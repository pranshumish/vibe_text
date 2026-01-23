export class LinkedListVisualizer {
    constructor(canvas, ctx) {
        this.canvas = canvas
        this.ctx = ctx
        this.characters = []
        this.cursorPosition = 0
    }

    updateFromText(text, textEditor) {
        // Chunk characters into groups of 10
        this.characters = []
        for (let i = 0; i < text.length; i += 10) {
            this.characters.push(text.substr(i, 10))
        }
        // If text is empty, still show one empty chunk or handle in draw

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
        ctx.fillText('Unrolled Linked List (10 chars per node)', canvas.width / 2, 25)

        // Calculate chunk index for cursor
        const cursorChunkIndex = Math.min(Math.floor(this.cursorPosition / 10), this.characters.length - 1)

        ctx.fillStyle = '#94a3b8'
        ctx.font = '12px Inter'
        ctx.fillText(`${this.characters.length} nodes | Cursor in node ${cursorChunkIndex + 1}`, canvas.width / 2, 45)

        const nodeWidth = 120 // Wider for 10 chars
        const nodeHeight = 50
        const spacing = 30 // More spacing for arrows
        const maxVisibleNodes = Math.floor((canvas.width - 60) / (nodeWidth + spacing))
        const startY = canvas.height / 2 - nodeHeight / 2

        // Calculate which nodes to show (around cursor)
        let startIndex = Math.max(0, cursorChunkIndex - Math.floor(maxVisibleNodes / 2))
        const endIndex = Math.min(this.characters.length, startIndex + maxVisibleNodes)

        if (endIndex - startIndex < maxVisibleNodes) {
            startIndex = Math.max(0, endIndex - maxVisibleNodes)
        }

        const visibleChunks = this.characters.slice(startIndex, endIndex)
        const totalWidth = visibleChunks.length * (nodeWidth + spacing) - spacing
        const startX = (canvas.width - totalWidth) / 2

        visibleChunks.forEach((chunk, i) => {
            const index = startIndex + i
            const x = startX + i * (nodeWidth + spacing)
            const isCursorNode = index === cursorChunkIndex

            // Node shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
            ctx.fillRect(x + 4, startY + 4, nodeWidth, nodeHeight)

            // Node box
            const gradient = ctx.createLinearGradient(x, startY, x, startY + nodeHeight)
            if (isCursorNode) {
                gradient.addColorStop(0, '#667eea')
                gradient.addColorStop(1, '#764ba2')
            } else {
                gradient.addColorStop(0, '#1a2237')
                gradient.addColorStop(1, '#12182b')
            }
            ctx.fillStyle = gradient
            ctx.fillRect(x, startY, nodeWidth, nodeHeight)

            // Node border
            ctx.strokeStyle = isCursorNode ? '#667eea' : 'rgba(255, 255, 255, 0.2)'
            ctx.lineWidth = 2
            ctx.strokeRect(x, startY, nodeWidth, nodeHeight)

            // Content
            const displayChunk = chunk.replace(/\n/g, '↵').replace(/ /g, '·')
            // Truncate if too long to fit visually (though 10 chars should fit)

            ctx.fillStyle = '#e2e8f0'
            ctx.font = '14px monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(displayChunk, x + nodeWidth / 2, startY + nodeHeight / 2)

            // Length indicator
            ctx.fillStyle = 'rgba(255,255,255,0.5)'
            ctx.font = '10px Inter'
            ctx.fillText(`len: ${chunk.length}`, x + nodeWidth - 25, startY + nodeHeight - 5)

            // Head/Tail markers
            if (index === 0) {
                ctx.fillStyle = '#10b981'
                ctx.font = 'bold 10px Inter'
                ctx.textAlign = 'center'
                ctx.fillText('HEAD', x + nodeWidth / 2, startY - 12)
            }
            if (index === this.characters.length - 1) {
                ctx.fillStyle = '#f59e0b'
                ctx.font = 'bold 10px Inter'
                ctx.textAlign = 'center'
                ctx.fillText('TAIL', x + nodeWidth / 2, startY + nodeHeight + 15)
            }

            // Forward/backward arrows
            if (i < visibleChunks.length - 1) {
                this.drawDoubleArrow(x + nodeWidth, startY + nodeHeight / 2, x + nodeWidth + spacing, startY + nodeHeight / 2)
            }
        })

        // Show ellipsis if there are more nodes
        if (startIndex > 0) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '20px Inter'
            ctx.textAlign = 'right'
            ctx.fillText('...', startX - 20, startY + nodeHeight / 2)
        }
        if (endIndex < this.characters.length) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '20px Inter'
            ctx.textAlign = 'left'
            ctx.fillText('...', startX + totalWidth + 20, startY + nodeHeight / 2)
        }
    }

    drawDoubleArrow(startX, startY, endX, endY) {
        const ctx = this.ctx
        const arrowLength = 5

        // Forward line (top)
        ctx.beginPath()
        ctx.strokeStyle = '#667eea'
        ctx.moveTo(startX, startY - 5)
        ctx.lineTo(endX, endY - 5)
        ctx.stroke()

        // Forward arrow head
        ctx.beginPath()
        ctx.moveTo(endX, endY - 5)
        ctx.lineTo(endX - arrowLength, endY - 9)
        ctx.lineTo(endX - arrowLength, endY - 1)
        ctx.fill()

        // Backward line (bottom)
        ctx.beginPath()
        ctx.strokeStyle = '#764ba2'
        ctx.moveTo(endX, endY + 5)
        ctx.lineTo(startX, endY + 5)
        ctx.stroke()

        // Backward arrow head
        ctx.beginPath()
        ctx.moveTo(startX, endY + 5)
        ctx.lineTo(startX + arrowLength, endY + 1)
        ctx.lineTo(startX + arrowLength, endY + 9)
        ctx.fill()
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
