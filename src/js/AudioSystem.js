export class AudioSystem {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)()
        this.enabled = true
        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.value = 0.3 // Default volume
        this.masterGain.connect(this.ctx.destination)
    }

    setEnabled(enabled) {
        this.enabled = enabled
    }

    // Gentle click for typing
    playTypeSound() {
        if (!this.enabled) return
        this._resumeContext()

        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.connect(gain)
        gain.connect(this.masterGain)

        // Randomize pitch slightly for realism
        const frequency = 800 + Math.random() * 200
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime)
        osc.type = 'sine'

        // Short envelope
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05)

        osc.start()
        osc.stop(this.ctx.currentTime + 0.05)
    }

    // Ascending sound for "add/push" operations
    playPushSound() {
        if (!this.enabled) return
        this._resumeContext()

        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.connect(gain)
        gain.connect(this.masterGain)

        osc.frequency.setValueAtTime(220, this.ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.2)
        osc.type = 'triangle'

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2)

        osc.start()
        osc.stop(this.ctx.currentTime + 0.2)
    }

    // Descending sound for "remove/pop" operations
    playPopSound() {
        if (!this.enabled) return
        this._resumeContext()

        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.connect(gain)
        gain.connect(this.masterGain)

        osc.frequency.setValueAtTime(440, this.ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.2)
        osc.type = 'sine'

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2)

        osc.start()
        osc.stop(this.ctx.currentTime + 0.2)
    }

    // Success/Completion sound
    playSuccessSound() {
        if (!this.enabled) return
        this._resumeContext()

        const now = this.ctx.currentTime
        const notes = [523.25, 659.25, 783.99] // C Major: C5, E5, G5

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator()
            const gain = this.ctx.createGain()

            osc.className = 'osc'
            osc.type = 'sine'
            osc.frequency.value = freq

            osc.connect(gain)
            gain.connect(this.masterGain)

            const start = now + i * 0.05
            gain.gain.setValueAtTime(0, start)
            gain.gain.linearRampToValueAtTime(0.1, start + 0.05)
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3)

            osc.start(start)
            osc.stop(start + 0.3)
        })
    }

    _resumeContext() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume()
        }
    }
}
