export class GapBufferVisualizer {
    constructor(canvas, ctx) {
        this.canvas = canvas
        this.ctx = ctx
        this.buffer = []
        this.gapStart = 0
        this.gapEnd = 10
        this.cursorPos = 0
        this.showGapDetails = true
        this.initBuffer()
    }

    initBuffer() {
        // Initialize with a gap of 10 spaces
        this.buffer = new Array(10).fill(null)
        this.gapStart = 0
        this.gapEnd = 10
    }

    updateFromText(text, textEditor) {
        this.cursorPos = textEditor.getCursorPosition()
        this.rebuildFromText(text)
        this.draw()
    }

    rebuildFromText(text) {
        const chars = text.split('')
        const gapSize = Math.max(10, Math.floor(chars.length * 0.2))

        // Build buffer with gap at cursor position
        this.buffer = []
        this.gapStart = this.cursorPos
        this.gapEnd = this.cursorPos + gapSize

        // Characters before gap
        for (let i = 0; i < this.gapStart; i++) {
            this.buffer.push(chars[i] || null)
        }

        // Gap
        for (let i = 0; i < gapSize; i++) {
            this.buffer.push(null)
        }

        // Characters after gap
        for (let i = this.gapStart; i < chars.length; i++) {
            this.buffer.push(chars[i])
        }
    }

    setShowGapDetails(show) {
        this.showGapDetails = show
        this.draw()
    }

    reset() {
        this.initBuffer()
        this.cursorPos = 0
        this.draw()
    }

    draw() {
        const ctx = this.ctx
        const canvas = this.canvas

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (this.buffer.filter(c => c !== null).length === 0) {
            this.drawEmptyMessage()
            return
        }

        // Draw title
        ctx.fillStyle = '#667eea'
        ctx.font = 'bold 18px Inter'
        ctx.textAlign = 'center'
        ctx.fillText('Gap Buffer Internal Structure', canvas.width / 2, 30)

        // Draw stats
        const gapSize = this.gapEnd - this.gapStart
        const textLength = this.buffer.filter(c => c !== null).length
        ctx.fillStyle = '#94a3b8'
        ctx.font = '12px Inter'
        ctx.fillText(`Buffer size: ${this.buffer.length} | Gap: [${this.gapStart}, ${this.gapEnd}) (${gapSize} slots) | Text: ${textLength} chars`, canvas.width / 2, 50)

        // Calculate how many cells we can show
        const cellWidth = 40
        const cellHeight = 50
        const spacing = 2
        const startY = 80
        const maxCells = Math.floor((canvas.width - 40) / (cellWidth + spacing))

        // Show a window around the gap
        let startIndex = Math.max(0, this.gapStart - Math.floor(maxCells / 3))
        let endIndex = Math.min(this.buffer.length, startIndex + maxCells)

        if (endIndex - startIndex < maxCells && endIndex < this.buffer.length) {
            endIndex = Math.min(this.buffer.length, startIndex + maxCells)
        }
        if (endIndex === this.buffer.length && endIndex - startIndex < maxCells) {
            startIndex = Math.max(0, endIndex - maxCells)
        }

        const visibleCells = endIndex - startIndex
        const totalWidth = visibleCells * (cellWidth + spacing) - spacing
        const startX = (canvas.width - totalWidth) / 2

        // Draw cells
        for (let i = startIndex; i < endIndex; i++) {
            const x = startX + (i - startIndex) * (cellWidth + spacing)
            const char = this.buffer[i]
            const isGap = i >= this.gapStart && i < this.gapEnd
            const isCursor = i === this.gapStart

            // Cell background
            if (isGap) {
                ctx.fillStyle = '#1a2237'
            } else {
                ctx.fillStyle = '#12182b'
            }
            ctx.fillRect(x, startY, cellWidth, cellHeight)

            // Cell border
            if (isCursor) {
                ctx.strokeStyle = '#667eea'
                ctx.lineWidth = 3
            } else if (isGap) {
                ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)'
                ctx.lineWidth = 2
            } else {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
                ctx.lineWidth = 1
            }
            ctx.strokeRect(x, startY, cellWidth, cellHeight)

            // Content
            if (char !== null) {
                const displayChar = char === '\n' ? '↵' : char === ' ' ? '·' : char
                ctx.fillStyle = '#e2e8f0'
                ctx.font = 'bold 20px monospace'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText(displayChar, x + cellWidth / 2, startY + cellHeight / 2)
            } else if (isGap) {
                ctx.fillStyle = '#667eea'
                ctx.font = 'bold 24px Inter'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText('·', x + cellWidth / 2, startY + cellHeight / 2)
            }

            // Index label
            ctx.fillStyle = '#94a3b8'
            ctx.font = '10px Inter'
            ctx.textAlign = 'center'
            ctx.fillText(i.toString(), x + cellWidth / 2, startY - 8)

            // Cursor marker
            if (isCursor) {
                ctx.fillStyle = '#667eea'
                ctx.font = 'bold 10px Inter'
                ctx.fillText('CURSOR', x + cellWidth / 2, startY + cellHeight + 15)
            }
        }

        // Gap region indicator
        if (this.showGapDetails && this.gapEnd > this.gapStart) {
            const gapStartX = startX + (this.gapStart - startIndex) * (cellWidth + spacing)
            const gapEndX = startX + (this.gapEnd - startIndex) * (cellWidth + spacing)

            if (this.gapStart >= startIndex && this.gapEnd <= endIndex) {
                const gapWidth = gapEndX - gapStartX - spacing

                // Gap bracket
                ctx.strokeStyle = '#667eea'
                ctx.lineWidth = 2
                ctx.beginPath()
                ctx.moveTo(gapStartX, startY + cellHeight + 25)
                ctx.lineTo(gapStartX, startY + cellHeight + 30)
                ctx.lineTo(gapEndX - spacing, startY + cellHeight + 30)
                ctx.lineTo(gapEndX - spacing, startY + cellHeight + 25)
                ctx.stroke()

                ctx.fillStyle = '#667eea'
                ctx.font = '11px Inter'
                ctx.textAlign = 'center'
                ctx.fillText('GAP', gapStartX + gapWidth / 2, startY + cellHeight + 42)
            }
        }

        // Ellipsis indicators
        if (startIndex > 0) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '20px Inter'
            ctx.textAlign = 'center'
            ctx.fillText('...', startX - 15, startY + cellHeight / 2)
        }
        if (endIndex < this.buffer.length) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '20px Inter'
            ctx.textAlign = 'center'
            ctx.fillText('...', startX + totalWidth + 15, startY + cellHeight / 2)
        }

        // Explanation
        if (this.showGapDetails) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '11px Inter'
            ctx.textAlign = 'center'
            ctx.fillText('Gap buffers are efficient for editing at cursor position - insertions just fill the gap', canvas.width / 2, canvas.height - 20)
        }
    }

    drawEmptyMessage() {
        const ctx = this.ctx
        const canvas = this.canvas

        ctx.fillStyle = '#94a3b8'
        ctx.font = '16px Inter'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Empty buffer', canvas.width / 2, canvas.height / 2)
    }
}
