export class StackVisualizer {
    constructor(canvas, ctx) {
        this.canvas = canvas
        this.ctx = ctx
        this.undoStack = []
        this.redoStack = []
        this.textEditor = null
    }

    updateFromText(text, textEditor) {
        this.textEditor = textEditor
        this.undoStack = textEditor.getUndoStack()
        this.redoStack = textEditor.getRedoStack()
        this.draw()
    }

    reset() {
        // Reset handled by text editor
        this.draw()
    }

    draw() {
        const ctx = this.ctx
        const canvas = this.canvas

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (this.undoStack.length === 0 && this.redoStack.length === 0) {
            this.drawEmptyMessage()
            return
        }

        // Draw side by side stacks
        const stackWidth = canvas.width / 2 - 40
        this.drawStack(this.undoStack, 20, 'Undo Stack', '#667eea')
        this.drawStack(this.redoStack, canvas.width / 2 + 20, 'Redo Stack', '#764ba2')
    }

    drawStack(stack, startX, title, color) {
        const ctx = this.ctx
        const canvas = this.canvas

        // Draw title
        ctx.fillStyle = color
        ctx.font = 'bold 16px Inter'
        ctx.textAlign = 'center'
        ctx.fillText(title, startX + (canvas.width / 2 - 40) / 2, 30)

        // Draw stack count
        ctx.fillStyle = '#94a3b8'
        ctx.font = '12px Inter'
        ctx.fillText(`(${stack.length} states)`, startX + (canvas.width / 2 - 40) / 2, 50)

        if (stack.length === 0) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '14px Inter'
            ctx.fillText('Empty', startX + (canvas.width / 2 - 40) / 2, canvas.height / 2)
            return
        }

        const boxWidth = canvas.width / 2 - 60
        const boxHeight = 40
        const spacing = 5
        const maxVisibleItems = Math.floor((canvas.height - 80) / (boxHeight + spacing))
        // Adjust startY to ensure bottom element is fully visible
        const startY = canvas.height - 30 - boxHeight

        // Show only recent items
        const visibleStack = stack.slice(-maxVisibleItems)
        const startIndex = Math.max(0, stack.length - maxVisibleItems)

        visibleStack.forEach((state, i) => {
            const index = startIndex + i
            const y = startY - (i * (boxHeight + spacing))

            // Box shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
            ctx.fillRect(startX + 3, y + 3, boxWidth, boxHeight)

            // Box gradient
            const gradient = ctx.createLinearGradient(startX, y, startX, y + boxHeight)
            if (index === stack.length - 1) {
                gradient.addColorStop(0, color)
                gradient.addColorStop(1, color + '99')
            } else {
                gradient.addColorStop(0, '#1a2237')
                gradient.addColorStop(1, '#12182b')
            }
            ctx.fillStyle = gradient
            ctx.fillRect(startX, y, boxWidth, boxHeight)

            // Box border
            ctx.strokeStyle = index === stack.length - 1 ? color : 'rgba(255, 255, 255, 0.2)'
            ctx.lineWidth = 2
            ctx.strokeRect(startX, y, boxWidth, boxHeight)

            // Text preview (truncated)
            const preview = state.length > 30 ? state.substring(0, 30) + '...' : state
            const displayText = preview.replace(/\n/g, '↵') || '(empty)'

            ctx.fillStyle = '#e2e8f0'
            ctx.font = '11px monospace'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'middle'
            ctx.fillText(displayText, startX + 8, y + boxHeight / 2)

            // Index label
            if (index === stack.length - 1) {
                ctx.fillStyle = color
                ctx.font = 'bold 10px Inter'
                ctx.textAlign = 'right'
                ctx.fillText('TOP', startX + boxWidth - 8, y + 12)
            }
        })
    }

    drawEmptyMessage() {
        const ctx = this.ctx
        const canvas = this.canvas

        ctx.fillStyle = '#94a3b8'
        ctx.font = '16px Inter'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Start typing to see undo/redo history', canvas.width / 2, canvas.height / 2)
    }
}
