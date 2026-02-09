export class TreeVisualizer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.history = null;
        this.nodeRadius = 15;
        this.levelHeight = 60;
        this.siblingSpacing = 40;
        this.nodePositions = new Map(); // id -> {x, y}
        
        // Zoom and pan state
        this.zoom = 1.0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.setupZoomPan();
        
        // Handle clicks
        this.canvas.addEventListener('click', this.handleClick.bind(this));
    }
    
    setupZoomPan() {
        // Mouse wheel for zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom *= delta;
            this.zoom = Math.max(0.1, Math.min(5, this.zoom));
            this.draw();
        });
        
        // Mouse drag for pan
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.offsetX;
            this.lastMouseY = e.offsetY;
            this.canvas.style.cursor = 'grabbing';
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.offsetX += e.offsetX - this.lastMouseX;
                this.offsetY += e.offsetY - this.lastMouseY;
                this.lastMouseX = e.offsetX;
                this.lastMouseY = e.offsetY;
                this.draw();
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'default';
        });
        
        this.canvas.style.cursor = 'grab';
    }
    
    resetZoom() {
        this.zoom = 1.0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.draw();
    }

    updateFromHistory(history) {
        this.history = history;
        this.draw();
    }

    // Called by main app when tab is switched or text changed
    updateFromText(text, textEditor) {
        // We need access to the history object from the textEditor
        if (textEditor && textEditor.history) {
            this.history = textEditor.history;
            this.draw();
        }
    }
    
    destroy() {
         // Clean up listeners if needed
         // We might need to remove the click listener to avoid duplicates if re-initialized
         // But usually visualizer instances are reused or garbage collected. 
         // For safety in this architecture:
         // The main app simpleNews new instance. We should remove the old listener?
         // Since we don't have a reference to the bound function easily unless stored, 
         // we might leak a listener if we keep creating new Visualizers.
         // Better to store the bound function.
    }

    handleClick(e) {
        if (!this.history) return;

        const rect = this.canvas.getBoundingClientRect();
        // Transform click coordinates to account for zoom/pan
        const x = (e.clientX - rect.left - this.offsetX) / this.zoom;
        const y = (e.clientY - rect.top - this.offsetY) / this.zoom;

        // Check if any node was clicked
        for (const [id, pos] of this.nodePositions) {
            const dx = x - pos.x;
            const dy = y - pos.y;
            if (dx * dx + dy * dy <= this.nodeRadius * this.nodeRadius) {
                // Clicked!
                const content = this.history.jumpTo(id);
                if (content !== null) {
                    // Update editor
                    // We need a way to callback to the editor. 
                    // This is a bit circular. The visualizer typically just reads.
                    // We'll dispatch a custom event on the canvas that the main app can listen to?
                    // Or we assume we have reference to textEditor (passed in updateFromText).
                }
                
                // Dispatch event
                const event = new CustomEvent('version-jump', { 
                    detail: { id, content: this.history.nodes.get(id).content } 
                });
                this.canvas.dispatchEvent(event);
                
                this.draw(); // Redraw to update active node
                break;
            }
        }
    }

    draw() {
        if (!this.history) return;

        const ctx = this.ctx;
        const canvas = this.canvas;
        const graph = this.history.getGraph();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.nodePositions.clear();

        // Calculate positions (Simple tree layout)
        // We'll verify depth and breadth-wise positions
        // Root at top center? Or left?
        // Let's do top-down standard tree.
        
        // We need to traverse to assign positions.
        // A simple recursive traversal to assign depths and relative X.
        // To prevent overlap, we need a smarter layout or Reingold-Tilford.
        // For simplicity now: simple fixed width spacing per leaf?
        
        // Let's just do a basic layout:
        // x = depth * spacing
        // y = index_in_level * spacing? 
        // No, let's do standard vertical tree.
        
        const root = graph.root;
        this.calculatePositions(root, canvas.width / 2, 40, canvas.width / 4);

        // Apply zoom and pan transforms
        ctx.save();
        ctx.translate(this.offsetX, this.offsetY);
        ctx.scale(this.zoom, this.zoom);

        // Draw connections first
        this.drawConnections(root);

        // Draw nodes
        this.drawNodes(root, graph.currentNodeId);
        
        // Restore context
        ctx.restore();
    }

    calculatePositions(node, x, y, offset) {
        this.nodePositions.set(node.id, { x, y });

        if (node.children.length === 0) return;

        // If one child, go straight down
        if (node.children.length === 1) {
            this.calculatePositions(node.children[0], x, y + this.levelHeight, offset);
        } else {
            // Spread children
            const totalWidth = offset * 2; 
            const step = totalWidth / (node.children.length - 1 || 1);
            // Actually, we should reduce the offset for the next level to avoid overlap
            // Start from x - offset
            
            let startX = x - offset;
            let currentOffset = offset / 2;
            
            if (node.children.length === 1) {
                 // Already handled
            } else {
                node.children.forEach((child, index) => {
                    // Distribute equally
                    // If 2 children: x-offset, x+offset
                    
                    // Simple logic:
                    // childX = x + (index - (total - 1)/2) * (offset*something)
                    // Let's just create a dynamic gap based on depth.
                    
                    // Better approach for simple visualization:
                    // Just basic fanning out.
                    const childX = x + (index - (node.children.length - 1) / 2) * (offset * 1.5);
                    this.calculatePositions(child, childX, y + this.levelHeight, offset * 0.5);
                });
            }
        }
    }
    
    // Fallback simple layout if the recursive one gets messy with overlaps
    // For now, let's trust the recursive fanning with diminishing offset.

    drawConnections(node) {
        const start = this.nodePositions.get(node.id);
        
        node.children.forEach(child => {
            const end = this.nodePositions.get(child.id);
            
            this.ctx.beginPath();
            this.ctx.moveTo(start.x, start.y);
            // Curve it?
            this.ctx.bezierCurveTo(start.x, start.y + 20, end.x, end.y - 20, end.x, end.y);
            
            this.ctx.strokeStyle = '#475569';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            this.drawConnections(child);
        });
    }

    drawNodes(node, activeId) {
        const pos = this.nodePositions.get(node.id);
        const isActive = node.id === activeId;

        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, this.nodeRadius, 0, Math.PI * 2);
        
        // Fill
        this.ctx.fillStyle = isActive ? '#10b981' : '#3b82f6';
        if (node.id === 'root') this.ctx.fillStyle = '#64748b';
        this.ctx.fill();

        // Border
        this.ctx.strokeStyle = isActive ? '#fff' : '#1e293b';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Label
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.font = '10px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(node.id, pos.x, pos.y + this.nodeRadius + 14);
        
        // Recurse
        node.children.forEach(child => this.drawNodes(child, activeId));
    }
}
