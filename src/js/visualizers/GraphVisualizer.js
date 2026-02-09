export class GraphVisualizer {
    constructor(canvas, ctx) {
        this.canvas = canvas
        this.ctx = ctx
        this.root = { children: {}, isEnd: false }
        this.words = []
    }

    updateFromText(text, textEditor) {
        // Rebuild trie from all words in text
        this.root = { children: {}, isEnd: false }
        this.words = []

        const words = text.match(/\b[a-zA-Z]+\b/gi) || []
        const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))]

        uniqueWords.forEach(word => {
            this.insert(word)
        })
        this.draw()
    }

    insert(word) {
        let node = this.root
        for (const char of word) {
            if (!node.children[char]) {
                node.children[char] = { children: {}, isEnd: false, char }
            }
            node = node.children[char]
        }
        node.isEnd = true
        if (!this.words.includes(word)) {
            this.words.push(word)
        }
    }

    reset() {
        this.root = { children: {}, isEnd: false }
        this.words = []
        this.draw()
    }

    draw() {
        const ctx = this.ctx
        const canvas = this.canvas

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (this.words.length === 0) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '16px Inter'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('No words in text editor', canvas.width / 2, canvas.height / 2)
            return
        }

        // Calculate tree layout
        const startY = 60
        const centerX = canvas.width / 2

        // Draw info
        ctx.fillStyle = '#667eea'
        ctx.font = 'bold 16px Inter'
        ctx.textAlign = 'center'
        ctx.fillText('Full Text Trie (All Words)', canvas.width / 2, 25)

        ctx.fillStyle = '#94a3b8'
        ctx.font = '12px Inter'
        ctx.fillText(`${this.words.length} unique words`, canvas.width / 2, 45)


        // Draw root
        this.drawNode(centerX, startY, 'ROOT', false, true)

        // Draw tree recursively
        this.drawTree(this.root, centerX, startY, canvas.width - 40, 1)
    }

    drawTree(node, x, y, spread, level) {
        const ctx = this.ctx
        const children = Object.values(node.children).sort((a, b) => a.char.localeCompare(b.char))

        if (children.length === 0) return

        const levelHeight = 60
        const childY = y + levelHeight

        // Adjust spread based on level to prevent overlap at deep levels
        const activeSpread = Math.max(spread, children.length * 30)

        const childSpread = activeSpread / children.length
        const startX = x - (activeSpread / 2) + (childSpread / 2)

        children.forEach((child, index) => {
            const childX = startX + index * childSpread

            // Draw line to child
            ctx.strokeStyle = 'rgba(102, 126, 234, 0.4)'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(x, y + 15)
            ctx.lineTo(childX, childY - 15)
            ctx.stroke()

            // Draw edge label (character)
            const midX = (x + childX) / 2
            const midY = (y + childY) / 2
            ctx.fillStyle = '#667eea'
            ctx.font = 'bold 12px Inter'
            ctx.textAlign = 'center'
            ctx.fillText(child.char, midX, midY - 5)

            // Draw child node
            this.drawNode(childX, childY, child.char, child.isEnd)

            // Recursively draw children
            if (level < 6) { // Limit depth for visualization
                this.drawTree(child, childX, childY, childSpread * 0.8, level + 1)
            }
        })
    }

    drawNode(x, y, label, isEnd, isRoot = false) {
        const ctx = this.ctx
        const radius = isRoot ? 20 : 15

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.beginPath()
        ctx.arc(x + 2, y + 2, radius, 0, 2 * Math.PI)
        ctx.fill()

        // Node circle
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        if (isEnd) {
            gradient.addColorStop(0, '#667eea')
            gradient.addColorStop(1, '#764ba2')
        } else {
            gradient.addColorStop(0, '#1a2237')
            gradient.addColorStop(1, '#12182b')
        }
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.fill()

        ctx.strokeStyle = isEnd ? '#667eea' : 'rgba(255, 255, 255, 0.2)'
        ctx.lineWidth = 2
        ctx.stroke()

        // Label
        if (!isRoot) {
            ctx.fillStyle = '#e2e8f0'
            ctx.font = 'bold 12px Inter'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(label, x, y)
        } else {
            ctx.fillStyle = '#94a3b8'
            ctx.font = 'bold 10px Inter'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(label, x, y)
        }

        // End marker
        if (isEnd) {
            ctx.fillStyle = '#10b981'
            ctx.font = 'bold 10px Inter'
            ctx.textAlign = 'center'
            ctx.fillText('✓', x, y + radius + 12)
        }
    }
}
