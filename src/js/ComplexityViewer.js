export class ComplexityViewer {
    constructor(containerId) {
        this.containerId = containerId
        this.container = document.getElementById(containerId)
        // Wait for container to exist if not found immediately?
        // Assuming it exists for now based on index.html updates coming next
    }

    render() {
        if (!this.container) {
            this.container = document.getElementById(this.containerId)
            if (!this.container) return
        }

        this.container.innerHTML = `
            <div class="complexity-card" style="background: rgba(30, 41, 59, 0.8); backdrop-filter: blur(10px); padding: 15px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); margin-top: 20px; color: white;">
                <div class="complexity-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span class="complexity-label" style="font-size: 14px; color: #94a3b8; font-weight: 600;">COMPLEXITY</span>
                    <span class="complexity-value" id="complexityValue" style="font-family: monospace; font-size: 18px; font-weight: bold; color: #94a3b8;">Idle</span>
                </div>
                <div class="complexity-details" id="complexityDetails" style="font-size: 13px; color: #cbd5e1; margin-bottom: 10px; min-height: 20px;">
                    Waiting for interaction...
                </div>
                <div class="complexity-meter" style="height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden;">
                    <div class="meter-fill" id="meterFill" style="width: 0%; height: 100%; background: #10b981; transition: width 0.3s, background-color 0.3s;"></div>
                </div>
            </div>
        `
        this.valueEl = this.container.querySelector('#complexityValue')
        this.detailsEl = this.container.querySelector('#complexityDetails')
        this.meterFill = this.container.querySelector('#meterFill')
    }

    update(complexity, operation, description) {
        if (!this.valueEl) this.render()
        if (!this.valueEl) return

        this.valueEl.textContent = complexity
        this.detailsEl.textContent = `${operation}: ${description}`

        let color = '#10b981' // Green (O(1))
        let width = '10%'

        if (complexity.includes('log n') && !complexity.includes('n log')) {
            color = '#3b82f6' // Blue O(log n)
            width = '30%'
        } else if (complexity === 'O(n)') {
            color = '#f59e0b' // Orange O(n)
            width = '60%'
        } else if (complexity.includes('n log n')) {
            color = '#f97316' // Dark Orange
            width = '80%'
        } else if (complexity.includes('n^2') || complexity.includes('2^n')) {
            color = '#ef4444' // Red
            width = '100%'
        } else if (complexity === 'O(1)') {
            color = '#10b981'
            width = '10%'
        }

        this.meterFill.style.width = width
        this.meterFill.style.backgroundColor = color
        this.valueEl.style.color = color

        // Reset check
        if (this.timeout) clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
            if (this.valueEl) {
                // Fade out effects could be added here
            }
        }, 3000)
    }
}
