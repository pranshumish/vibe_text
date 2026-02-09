import { BracketMatcher } from '../BracketMatcher.js'

export class BracketVisualizer {
    constructor(canvas, ctx) {
        this.canvas = canvas
        this.ctx = ctx
        this.matcher = new BracketMatcher()
        this.text = ''
    }

    updateFromText(text, textEditor) {
        this.text = text
        this.draw()
    }

    reset() {
        this.text = ''
        this.draw()
    }

    draw() {
        const ctx = this.ctx
        const canvas = this.canvas
        const { stack, matches, errors } = this.matcher.analyze(this.text)

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw Summary
        ctx.fillStyle = '#e2e8f0'
        ctx.font = '16px Inter'
        ctx.textAlign = 'center'
        ctx.fillText(`Text Length: ${this.text.length}`, canvas.width / 2, 30)
        
        ctx.fillStyle = stack.length === 0 && errors.length === 0 ? '#10b981' : '#ef4444'
        const status = stack.length === 0 && errors.length === 0 ? '✓ Balanced' : `⚠ ${stack.length} Unclosed, ${errors.length} Errors`
        ctx.fillText(status, canvas.width / 2, 55)

        // Draw matching pairs as arcs
        const pairs = this.matcher.getAllPairs(this.text)
        const charWidth = 8
        const baseY = 100
        const maxArcHeight = 150

        ctx.fillStyle = '#64748b'
        ctx.font = '12px Inter'
        ctx.fillText('Matching Bracket Pairs (arcs show connections)', canvas.width / 2, 80)

        // Draw arcs for matched pairs
        pairs.forEach((pair, index) => {
            const x1 = 50 + pair.open * charWidth
            const x2 = 50 + pair.close * charWidth
            const distance = pair.close - pair.open
            const arcHeight = Math.min(distance * 2, maxArcHeight)

            ctx.beginPath()
            ctx.moveTo(x1, baseY)
            ctx.quadraticCurveTo(
                (x1 + x2) / 2,
                baseY - arcHeight,
                x2,
                baseY
            )
            ctx.strokeStyle = `hsl(${(index * 60) % 360}, 70%, 60%)`
            ctx.lineWidth = 2
            ctx.stroke()

            // Draw dots at endpoints
            ctx.fillStyle = ctx.strokeStyle
            ctx.beginPath()
            ctx.arc(x1, baseY, 4, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(x2, baseY, 4, 0, Math.PI * 2)
            ctx.fill()
        })

        // Draw Stack Visualization
        const startX = canvas.width / 2 - 50
        const bottomY = canvas.height - 40
        const boxHeight = 30
        const boxWidth = 100

        ctx.fillStyle = '#94a3b8'
        ctx.font = '14px Inter'
        ctx.textAlign = 'center'
        ctx.fillText('Current Stack (Open Brackets)', canvas.width / 2, bottomY + 25)

        if (stack.length === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
            ctx.fillRect(startX, bottomY - boxHeight, boxWidth, boxHeight)
            ctx.strokeStyle = '#475569'
            ctx.strokeRect(startX, bottomY - boxHeight, boxWidth, boxHeight)
            ctx.fillStyle = '#64748b'
            ctx.textAlign = 'center'
            ctx.fillText('(empty)', startX + boxWidth/2, bottomY - boxHeight/2 + 5)
            return
        }

        const maxItems = Math.floor((canvas.height - 200) / boxHeight)
        const visibleStack = stack.slice(-maxItems)

        visibleStack.forEach((item, i) => {
            const y = bottomY - ((i + 1) * boxHeight)
            
            ctx.fillStyle = '#1e293b'
            ctx.fillRect(startX, y, boxWidth, boxHeight)
            
            ctx.strokeStyle = '#3b82f6'
            ctx.lineWidth = 2
            ctx.strokeRect(startX, y, boxWidth, boxHeight)

            ctx.fillStyle = '#fff'
            ctx.font = 'bold 16px monospace'
            ctx.textAlign = 'center'
            ctx.fillText(item.char, startX + boxWidth / 2, y + 20)
            
            ctx.fillStyle = '#64748b'
            ctx.font = '10px Inter'
            ctx.textAlign = 'right'
            ctx.fillText(`@${item.index}`, startX - 10, y + 18)
        })

        // Draw errors
        if (errors.length > 0) {
            ctx.fillStyle = '#ef4444'
            ctx.font = '12px Inter'
            ctx.textAlign = 'left'
            ctx.fillText(`Errors: ${errors.map(e => `${e.char}@${e.index}`).join(', ')}`, 20, canvas.height - 10)
        }
    }

    getControls() {
        return `
            <div class="control-group">
                <label>Bracket Navigation</label>
                <div class="control-row">
                    <button class="btn-primary" onclick="window.goToMatchingBracket()">Go to Matching (Ctrl+B)</button>
                </div>
            </div>
        `
    }
}
