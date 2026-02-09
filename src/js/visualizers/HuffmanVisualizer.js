export class HuffmanVisualizer {
    constructor(canvas, ctx) {
        this.canvas = canvas
        this.ctx = ctx
        this.tree = null
        this.codes = {}
        this.frequencies = {}
        this.stats = {
            originalSize: 0,
            compressedSize: 0,
            ratio: 0
        }
        
        // Zoom and pan state
        this.zoom = 1.0
        this.offsetX = 0
        this.offsetY = 0
        this.isDragging = false
        this.lastMouseX = 0
        this.lastMouseY = 0
        
        this.setupZoomPan()
    }
    
    setupZoomPan() {
        // Mouse wheel for zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault()
            const delta = e.deltaY > 0 ? 0.9 : 1.1
            this.zoom *= delta
            this.zoom = Math.max(0.1, Math.min(5, this.zoom))
            this.draw()
        })
        
        // Mouse drag for pan
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true
            this.lastMouseX = e.offsetX
            this.lastMouseY = e.offsetY
            this.canvas.style.cursor = 'grabbing'
        })
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.offsetX += e.offsetX - this.lastMouseX
                this.offsetY += e.offsetY - this.lastMouseY
                this.lastMouseX = e.offsetX
                this.lastMouseY = e.offsetY
                this.draw()
            }
        })
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false
            this.canvas.style.cursor = 'grab'
        })
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false
            this.canvas.style.cursor = 'default'
        })
        
        this.canvas.style.cursor = 'grab'
    }
    
    resetZoom() {
        this.zoom = 1.0
        this.offsetX = 0
        this.offsetY = 0
        this.draw()
    }

    updateFromText(text, textEditor) {
        if (!text) {
            this.reset()
            return
        }

        // 1. Calculate Frequencies
        const freqs = {}
        for (const char of text) {
            freqs[char] = (freqs[char] || 0) + 1
        }
        
        // Store for table display
        this.frequencies = freqs

        // 2. Build Tree
        // Create leaf nodes
        let nodes = Object.keys(freqs).map(char => ({
            type: 'leaf',
            char: char,
            freq: freqs[char],
            id: Math.random().toString(36).substr(2, 9)
        }))

        // Priority Queue simulation (sort by freq)
        while (nodes.length > 1) {
            nodes.sort((a, b) => a.freq - b.freq)

            const left = nodes.shift()
            const right = nodes.shift()

            const parent = {
                type: 'internal',
                freq: left.freq + right.freq,
                left: left,
                right: right,
                id: Math.random().toString(36).substr(2, 9)
            }
            nodes.push(parent)
        }

        this.tree = nodes[0]

        // 3. Generate Codes
        this.codes = {}
        this.generateCodes(this.tree, '')

        // 4. Calculate Stats
        this.stats.originalSize = text.length * 8 // Assume 8-bit ASCII/UTF-8
        this.stats.compressedSize = 0
        for (const char of text) {
            this.stats.compressedSize += this.codes[char].length
        }
        this.stats.ratio = (1 - this.stats.compressedSize / this.stats.originalSize) * 100

        this.draw()
    }

    generateCodes(node, code) {
        if (!node) return

        if (node.type === 'leaf') {
            this.codes[node.char] = code || '0' // Handle single char case
            return
        }

        this.generateCodes(node.left, code + '0')
        this.generateCodes(node.right, code + '1')
    }

    reset() {
        this.tree = null
        this.codes = {}
        this.frequencies = {}
        this.stats = { originalSize: 0, compressedSize: 0, ratio: 0 }
        this.draw()
    }

    draw() {
        const ctx = this.ctx
        const canvas = this.canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (!this.tree) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '16px Inter'
            ctx.textAlign = 'center'
            ctx.fillText('Type text to generate Huffman Tree', canvas.width / 2, canvas.height / 2)
            return
        }

        // Apply zoom and pan transforms
        ctx.save()
        ctx.translate(this.offsetX, this.offsetY)
        ctx.scale(this.zoom, this.zoom)

        // 1. Draw Stats Header
        ctx.fillStyle = '#667eea'
        ctx.font = 'bold 16px Inter'
        ctx.textAlign = 'center'
        ctx.fillText('Huffman Coding Tree', canvas.width / 2, 25)

        ctx.fillStyle = '#94a3b8'
        ctx.font = '12px Inter'
        const statText = `Original: ${this.stats.originalSize} bits | Compressed: ${this.stats.compressedSize} bits | Savings: ${this.stats.ratio.toFixed(1)}%`
        ctx.fillText(statText, canvas.width / 2, 45)

        // 2. Draw Code Table (Left Side)
        this.drawTable(20, 70)

        // 3. Draw Tree (Right Side area)
        this.drawTree(this.tree, canvas.width * 0.6, 80, canvas.width * 0.4, 1)
        
        // Restore context
        ctx.restore()
    }

    drawTable(x, y) {
        const ctx = this.ctx

        ctx.font = 'bold 12px monospace'
        ctx.textAlign = 'left'
        ctx.fillStyle = '#e2e8f0'

        let currentY = y
        const lineHeight = 20

        // Header
        ctx.fillText('Char  Freq  Code', x, currentY)
        ctx.beginPath()
        ctx.strokeStyle = '#667eea'
        ctx.moveTo(x, currentY + 5)
        ctx.lineTo(x + 150, currentY + 5)
        ctx.stroke()
        currentY += lineHeight + 5

        // Sort chars by freq
        const sortedChars = Object.keys(this.codes).sort((a, b) => this.codes[a].length - this.codes[b].length)

        // Show top 15 entries if too many
        const displayChars = sortedChars.slice(0, 15)

        displayChars.forEach(char => {
            const displayChar = char === '\n' ? '↵' : char === ' ' ? 'SPC' : char
            const code = this.codes[char]
            const freq = this.frequencies[char] || 0

            ctx.fillStyle = '#94a3b8'
            ctx.fillText(`${displayChar.padEnd(4)}  ${freq.toString().padStart(4)}  ${code}`, x, currentY)
            currentY += lineHeight
        })

        if (sortedChars.length > 15) {
            ctx.fillStyle = '#667eea'
            ctx.fillText(`...and ${sortedChars.length - 15} more`, x, currentY)
        }
    }

    drawTree(node, x, y, spread, level) {
        if (!node) return

        const ctx = this.ctx

        // Dynamic sizing for nodes
        const radius = 18
        const levelHeight = 50

        // Draw connections first
        if (node.left) {
            // Adjust spread based on depth
            const childSpread = spread / 1.8
            const childX = x - childSpread
            const childY = y + levelHeight

            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(childX, childY)
            ctx.strokeStyle = '#667eea'
            ctx.lineWidth = 1
            ctx.stroke()

            // Edge label '0'
            ctx.fillStyle = '#667eea'
            ctx.font = '10px Inter'
            ctx.fillText('0', (x + childX) / 2 - 5, (y + childY) / 2)

            this.drawTree(node.left, childX, childY, childSpread, level + 1)
        }

        if (node.right) {
            const childSpread = spread / 1.8
            const childX = x + childSpread
            const childY = y + levelHeight

            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(childX, childY)
            ctx.strokeStyle = '#764ba2'
            ctx.lineWidth = 1
            ctx.stroke()

            // Edge label '1'
            ctx.fillStyle = '#764ba2'
            ctx.font = '10px Inter'
            ctx.fillText('1', (x + childX) / 2 + 5, (y + childY) / 2)

            this.drawTree(node.right, childX, childY, childSpread, level + 1)
        }

        // Draw Node
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = node.type === 'leaf' ? '#1a2237' : '#12182b'
        ctx.fill()
        ctx.strokeStyle = node.type === 'leaf' ? '#10b981' : '#667eea'
        ctx.lineWidth = 2
        ctx.stroke()

        // Text
        ctx.fillStyle = '#e2e8f0'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        if (node.type === 'leaf') {
            const displayChar = node.char === '\n' ? '↵' : node.char === ' ' ? '·' : node.char
            ctx.font = 'bold 12px monospace'
            ctx.fillText(displayChar, x, y)

            // Freq below
            ctx.font = '9px Inter'
            ctx.fillStyle = '#94a3b8'
            ctx.fillText(node.freq, x, y + radius + 10)
        } else {
            ctx.font = '10px Inter'
            ctx.fillText(node.freq, x, y)
        }
    }
}
