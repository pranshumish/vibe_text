import { getWordPairs } from '../utils.js'

export class GraphVisualizer {
    constructor(canvas, ctx) {
        this.canvas = canvas
        this.ctx = ctx
        this.vertices = new Map() // word -> {x, y, connections}
        this.edges = new Map() // "word1->word2" -> weight
        this.showWeights = true
    }

    updateFromText(text, textEditor) {
        // Build graph from word pairs
        this.vertices = new Map()
        this.edges = new Map()

        const pairs = getWordPairs(text)

        // Count word adjacencies
        pairs.forEach(([word1, word2]) => {
            const edgeKey = `${word1}->${word2}`
            this.edges.set(edgeKey, (this.edges.get(edgeKey) || 0) + 1)

            if (!this.vertices.has(word1)) {
                this.vertices.set(word1, { connections: 0 })
            }
            if (!this.vertices.has(word2)) {
                this.vertices.set(word2, { connections: 0 })
            }

            this.vertices.get(word1).connections++
            this.vertices.get(word2).connections++
        })

        // Layout vertices in circle
        this.layoutVertices()
        this.draw()
    }

    setShowWeights(show) {
        this.showWeights = show
        this.draw()
    }

    layoutVertices() {
        const centerX = this.canvas.width / 2
        const centerY = this.canvas.height / 2
        const radius = Math.min(centerX, centerY) - 60

        const words = Array.from(this.vertices.keys())
        words.forEach((word, i) => {
            const angle = (i / words.length) * 2 * Math.PI - Math.PI / 2
            const vertex = this.vertices.get(word)
            vertex.x = centerX + radius * Math.cos(angle)
            vertex.y = centerY + radius * Math.sin(angle)
            vertex.word = word
        })
    }

    reset() {
        this.vertices = new Map()
        this.edges = new Map()
        this.draw()
    }

    draw() {
        const ctx = this.ctx
        const canvas = this.canvas

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (this.vertices.size === 0) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '16px Inter'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('No word connections yet', canvas.width / 2, canvas.height / 2)
            return
        }

        // Draw title
        ctx.fillStyle = '#667eea'
        ctx.font = 'bold 16px Inter'
        ctx.textAlign = 'center'
        ctx.fillText('Word Relationship Graph', canvas.width / 2, 25)

        ctx.fillStyle = '#94a3b8'
        ctx.font = '12px Inter'
        ctx.fillText(`${this.vertices.size} words, ${this.edges.size} connections`, canvas.width / 2, 45)

        // Draw edges first
        this.edges.forEach((weight, edgeKey) => {
            const [word1, word2] = edgeKey.split('->')
            const v1 = this.vertices.get(word1)
            const v2 = this.vertices.get(word2)

            if (v1 && v2) {
                this.drawEdge(v1, v2, weight)
            }
        })

        // Draw vertices
        this.vertices.forEach((vertex) => {
            this.drawVertex(vertex)
        })
    }

    drawEdge(v1, v2, weight) {
        const ctx = this.ctx

        const dx = v2.x - v1.x
        const dy = v2.y - v1.y
        const length = Math.sqrt(dx * dx + dy * dy)
        const radius = 25

        const offsetX = (dx / length) * radius
        const offsetY = (dy / length) * radius

        const startX = v1.x + offsetX
        const startY = v1.y + offsetY
        const endX = v2.x - offsetX
        const endY = v2.y - offsetY

        const thickness = Math.min(1 + weight * 0.5, 5)

        ctx.strokeStyle = `rgba(102, 126, 234, ${Math.min(0.3 + weight * 0.1, 0.8)})`
        ctx.lineWidth = thickness
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()

        if (this.showWeights && weight > 1) {
            const midX = (startX + endX) / 2
            const midY = (startY + endY) / 2

            ctx.fillStyle = '#667eea'
            ctx.font = 'bold 10px Inter'
            ctx.textAlign = 'center'
            ctx.fillText(weight, midX, midY - 5)
        }

        const angle = Math.atan2(dy, dx)
        const headLength = 8

        ctx.fillStyle = 'rgba(102, 126, 234, 0.6)'
        ctx.beginPath()
        ctx.moveTo(endX, endY)
        ctx.lineTo(
            endX - headLength * Math.cos(angle - Math.PI / 6),
            endY - headLength * Math.sin(angle - Math.PI / 6)
        )
        ctx.lineTo(
            endX - headLength * Math.cos(angle + Math.PI / 6),
            endY - headLength * Math.sin(angle + Math.PI / 6)
        )
        ctx.closePath()
        ctx.fill()
    }

    drawVertex(vertex) {
        const ctx = this.ctx
        const radius = 25

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.beginPath()
        ctx.arc(vertex.x + 2, vertex.y + 2, radius, 0, 2 * Math.PI)
        ctx.fill()

        const gradient = ctx.createRadialGradient(vertex.x, vertex.y, 0, vertex.x, vertex.y, radius)
        gradient.addColorStop(0, '#1a2237')
        gradient.addColorStop(1, '#12182b')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(vertex.x, vertex.y, radius, 0, 2 * Math.PI)
        ctx.fill()

        ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)'
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.fillStyle = '#e2e8f0'
        ctx.font = 'bold 11px Inter'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const word = vertex.word.length > 8 ? vertex.word.substring(0, 7) + '...' : vertex.word
        ctx.fillText(word, vertex.x, vertex.y)
    }
}
