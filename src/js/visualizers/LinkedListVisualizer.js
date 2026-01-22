export class LinkedListVisualizer {
    constructor(canvas, ctx) {
        this.canvas = canvas
        this.ctx = ctx
        this.characters = []
        this.cursorPosition = 0
    }

    updateFromText(text, textEditor) {
        this.characters = text.split('')
        this.cursorPosition = textEditor.getCursorPosition()
        this.draw()
    }

    reset() {
        this.characters = []
        this.cursorPosition = 0
        this.draw()
    }


    draw() {
        const ctx = this.ctx
        const canvas = this.canvas

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (this.characters.length === 0) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '16px Inter'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('Empty', canvas.width / 2, canvas.height / 2)
            return
        }

        // Display info
        ctx.fillStyle = '#667eea'
        ctx.font = 'bold 16px Inter'
        ctx.textAlign = 'center'
        ctx.fillText('Character Doubly Linked List', canvas.width / 2, 25)

        ctx.fillStyle = '#94a3b8'
        ctx.font = '12px Inter'
        ctx.fillText(`${this.characters.length} nodes | Cursor at position ${this.cursorPosition}`, canvas.width / 2, 45)

        const nodeWidth = 35
        const nodeHeight = 40
        const spacing = 15
        const maxVisibleNodes = Math.floor((canvas.width - 40) / (nodeWidth + spacing))
        const startY = canvas.height / 2 - nodeHeight / 2

        // Calculate which nodes to show (around cursor)
        let startIndex = Math.max(0, this.cursorPosition - Math.floor(maxVisibleNodes / 2))
        const endIndex = Math.min(this.characters.length, startIndex + maxVisibleNodes)

        if (endIndex - startIndex < maxVisibleNodes) {
            startIndex = Math.max(0, endIndex - maxVisibleNodes)
        }

        const visibleChars = this.characters.slice(startIndex, endIndex)
        const totalWidth = visibleChars.length * (nodeWidth + spacing) - spacing
        const startX = (canvas.width - totalWidth) / 2

        visibleChars.forEach((char, i) => {
            const index = startIndex + i
            const x = startX + i * (nodeWidth + spacing)
            const isCursor = index === this.cursorPosition

            // Node shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
            ctx.fillRect(x + 2, startY + 2, nodeWidth, nodeHeight)

            // Node box
            const gradient = ctx.createLinearGradient(x, startY, x, startY + nodeHeight)
            if (isCursor) {
                gradient.addColorStop(0, '#667eea')
                gradient.addColorStop(1, '#764ba2')
            } else {
                gradient.addColorStop(0, '#1a2237')
                gradient.addColorStop(1, '#12182b')
            }
            ctx.fillStyle = gradient
            ctx.fillRect(x, startY, nodeWidth, nodeHeight)

            // Node border
            ctx.strokeStyle = isCursor ? '#667eea' : 'rgba(255, 255, 255, 0.2)'
            ctx.lineWidth = 2
            ctx.strokeRect(x, startY, nodeWidth, nodeHeight)

            // Character (handle newlines and spaces)
            const displayChar = char === '\n' ? '↵' : char === ' ' ? '·' : char
            ctx.fillStyle = '#e2e8f0'
            ctx.font = 'bold 16px monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(displayChar, x + nodeWidth / 2, startY + nodeHeight / 2)

            // Head/Tail markers
            if (index === 0) {
                ctx.fillStyle = '#10b981'
                ctx.font = 'bold 10px Inter'
                ctx.fillText('HEAD', x + nodeWidth / 2, startY - 12)
            }
            if (index === this.characters.length - 1) {
                ctx.fillStyle = '#f59e0b'
                ctx.font = 'bold 10px Inter'
                ctx.fillText('TAIL', x + nodeWidth / 2, startY + nodeHeight + 15)
            }

            // Cursor marker
            if (isCursor) {
                ctx.fillStyle = '#667eea'
                ctx.font = 'bold 10px Inter'
                ctx.fillText('CURSOR', x + nodeWidth / 2, startY + nodeHeight + 28)
            }

            // Forward/backward arrows
            if (i < visibleChars.length - 1) {
                ctx.strokeStyle = '#667eea'
                ctx.fillStyle = '#667eea'
                ctx.lineWidth = 1.5
                this.drawArrow(x + nodeWidth, startY + 10, x + nodeWidth + spacing, startY + 10)

                ctx.strokeStyle = '#764ba2'
                ctx.fillStyle = '#764ba2'
                this.drawArrow(x + nodeWidth + spacing, startY + 30, x + nodeWidth, startY + 30)
            }
        })

        // Show ellipsis if there are more nodes
        if (startIndex > 0) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '20px Inter'
            ctx.fillText('...', startX - 20, startY + nodeHeight / 2)
        }
        if (endIndex < this.characters.length) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '20px Inter'
            ctx.fillText('...', startX + totalWidth + 20, startY + nodeHeight / 2)
        }
    }

    drawArrow(fromX, fromY, toX, toY, color) {
        const ctx = this.ctx
        const headLength = 8
        const angle = Math.atan2(toY - fromY, toX - fromX)

        ctx.strokeStyle = color
        ctx.fillStyle = color
        ctx.lineWidth = 2

        // Line
        ctx.beginPath()
        ctx.moveTo(fromX, fromY)
        ctx.lineTo(toX, toY)
        ctx.stroke()

        // Arrowhead
        ctx.beginPath()
        ctx.moveTo(toX, toY)
        ctx.lineTo(
            toX - headLength * Math.cos(angle - Math.PI / 6),
            toY - headLength * Math.sin(angle - Math.PI / 6)
        )
        ctx.lineTo(
            toX - headLength * Math.cos(angle + Math.PI / 6),
            toY - headLength * Math.sin(angle + Math.PI / 6)
        )
        ctx.closePath()
        ctx.fill()
    }
}
