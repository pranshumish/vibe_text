export class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.particles = []
        this.enabled = true

        this.resize()
        window.addEventListener('resize', () => this.resize())

        // Start animation loop
        this.animate = this.animate.bind(this)
        requestAnimationFrame(this.animate)
    }

    resize() {
        // Assume canvas should fill its parent or the window
        // We'll let the main app control the styling, but we ensure internal resolution matches
        const rect = this.canvas.getBoundingClientRect()
        this.canvas.width = rect.width
        this.canvas.height = rect.height
    }

    spawn(x, y, color = '#60a5fa', count = 5) {
        if (!this.enabled) return

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2
            const speed = Math.random() * 2 + 1

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                color,
                size: Math.random() * 3 + 2
            })
        }
    }

    animate() {
        if (!this.ctx) return

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        if (this.particles.length > 0) {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i]

                p.x += p.vx
                p.y += p.vy
                p.life -= 0.02
                p.vy += 0.1 // Gravity

                if (p.life <= 0) {
                    this.particles.splice(i, 1)
                    continue
                }

                this.ctx.globalAlpha = p.life
                this.ctx.fillStyle = p.color
                this.ctx.beginPath()
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                this.ctx.fill()
            }
        }

        requestAnimationFrame(this.animate)
    }
}
