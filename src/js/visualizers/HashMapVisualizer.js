import { getWordFrequency, getTopWords } from '../utils.js'

export class HashMapVisualizer {
    constructor(canvas, ctx) {
        this.canvas = canvas
        this.ctx = ctx
        this.wordFrequency = new Map()
        this.ignoreStopWords = false
        this.topWords = []
    }

    updateFromText(text, textEditor) {
        this.wordFrequency = getWordFrequency(text, this.ignoreStopWords)
        this.topWords = getTopWords(text, 10, this.ignoreStopWords)
        this.draw()
    }

    setIgnoreStopWords(ignore) {
        this.ignoreStopWords = ignore
        this.draw()
    }

    reset() {
        this.wordFrequency = new Map()
        this.topWords = []
        this.draw()
    }

    draw() {
        const ctx = this.ctx
        const canvas = this.canvas

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (this.topWords.length === 0) {
            this.drawEmptyMessage()
            return
        }

        // Draw title
        ctx.fillStyle = '#667eea'
        ctx.font = 'bold 18px Inter'
        ctx.textAlign = 'center'
        ctx.fillText('Word Frequency Analysis', canvas.width / 2, 30)

        // Draw stats
        ctx.fillStyle = '#94a3b8'
        ctx.font = '12px Inter'
        ctx.fillText(`${this.wordFrequency.size} unique words`, canvas.width / 2, 50)

        // Draw top words as bar chart
        const startY = 80
        const barHeight = 35
        const spacing = 10
        const maxBarWidth = canvas.width - 200
        const maxFreq = Math.max(...this.topWords.map(([, freq]) => freq))

        this.topWords.forEach(([word, freq], index) => {
            const y = startY + index * (barHeight + spacing)
            const barWidth = (freq / maxFreq) * maxBarWidth

            // Draw rank
            ctx.fillStyle = '#94a3b8'
            ctx.font = 'bold 14px Inter'
            ctx.textAlign = 'right'
            ctx.fillText(`#${index + 1}`, 35, y + barHeight / 2 + 5)

            // Draw word
            ctx.fillStyle = '#e2e8f0'
            ctx.font = '13px Inter'
            ctx.textAlign = 'left'
            ctx.fillText(word, 50, y + barHeight / 2 + 5)

            // Draw bar background
            ctx.fillStyle = '#1a2237'
            ctx.fillRect(150, y, maxBarWidth, barHeight)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
            ctx.lineWidth = 1
            ctx.strokeRect(150, y, maxBarWidth, barHeight)

            // Draw bar
            const gradient = ctx.createLinearGradient(150, y, 150 + barWidth, y)
            gradient.addColorStop(0, '#667eea')
            gradient.addColorStop(1, '#764ba2')
            ctx.fillStyle = gradient
            ctx.fillRect(150, y, barWidth, barHeight)

            // Draw frequency
            ctx.fillStyle = '#e2e8f0'
            ctx.font = 'bold 12px Inter'
            ctx.textAlign = 'left'
            ctx.fillText(freq, 155 + barWidth + 5, y + barHeight / 2 + 5)
        })
    }

    drawEmptyMessage() {
        const ctx = this.ctx
        const canvas = this.canvas

        ctx.fillStyle = '#94a3b8'
        ctx.font = '16px Inter'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('No words to analyze', canvas.width / 2, canvas.height / 2)
    }
}
