export class GraphVisualizer {
    constructor(canvas, ctx) {
        this.canvas = canvas
        this.ctx = ctx
        this.root = { children: {}, isEnd: false }
        this.words = []
    }

    updateFromText(text, textEditor) {
        this.resetInternal()

        const words = text.match(/\b[a-zA-Z]+\b/gi) || []
        // Filter unique words and sort generic validation
        const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))]

        uniqueWords.forEach(word => {
            this.insert(word)
        })
        this.draw()
    }

    resetInternal() {
        this.root = { children: {}, isEnd: false }
        this.words = []
    }

    reset() {
        this.resetInternal()
        this.draw()
    }

    insert(word) {
        let node = this.root
        let currentSuffix = word

        while (currentSuffix.length > 0) {
            // Find if any existing edge starts with the same character
            const matchChar = currentSuffix[0]
            const edgeKey = Object.keys(node.children).find(k => k.startsWith(matchChar))

            if (!edgeKey) {
                // Case 1: No edge starts with this char. Create new edge.
                node.children[currentSuffix] = { children: {}, isEnd: true }
                return
            }

            // Calculate common prefix length
            let commonLen = 0
            while (commonLen < edgeKey.length && commonLen < currentSuffix.length && edgeKey[commonLen] === currentSuffix[commonLen]) {
                commonLen++
            }

            // Case 2: Edge is a prefix of the word (e.g. Edge="app", Word="apple")
            // Traverse down
            if (commonLen === edgeKey.length) {
                node = node.children[edgeKey]
                currentSuffix = currentSuffix.substring(commonLen)

                if (currentSuffix.length === 0) {
                    node.isEnd = true
                    return
                }
                continue // Continue with the remaining suffix from the new node
            }

            // Case 3: Word is a prefix of Edge (e.g. Edge="apple", Word="app")
            // Split edge: "apple" -> "app" -> "le"
            if (commonLen === currentSuffix.length) {
                const oldChild = node.children[edgeKey]
                const commonStr = currentSuffix
                const remainingEdge = edgeKey.substring(commonLen)

                const splitNode = { children: {}, isEnd: true } // Current word ends here
                splitNode.children[remainingEdge] = oldChild

                delete node.children[edgeKey]
                node.children[commonStr] = splitNode
                return
            }

            // Case 4: Mismatch in middle (e.g. Edge="apple", Word="apply")
            // Split edge: "apple" -> "appl" -> ("e", "y")
            {
                const oldChild = node.children[edgeKey]
                const commonStr = edgeKey.substring(0, commonLen)
                const remainingEdge = edgeKey.substring(commonLen)
                const remainingWord = currentSuffix.substring(commonLen)

                const splitNode = { children: {}, isEnd: false }

                // Old branch
                splitNode.children[remainingEdge] = oldChild

                // New branch
                splitNode.children[remainingWord] = { children: {}, isEnd: true }

                delete node.children[edgeKey]
                node.children[commonStr] = splitNode
                return
            }
        }
    }

    draw() {
        const ctx = this.ctx
        const canvas = this.canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (Object.keys(this.root.children).length === 0) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '16px Inter'
            ctx.textAlign = 'center'
            ctx.fillText('Type text to generate Compressed Trie', canvas.width / 2, canvas.height / 2)
            return
        }

        // Draw Root Node
        const rootX = canvas.width / 2
        const rootY = 60

        ctx.fillStyle = '#94a3b8'
        ctx.font = '12px Inter'
        ctx.textAlign = 'center'
        ctx.fillText('ROOT', rootX, rootY - 15)

        this.drawNodeCircle(rootX, rootY, this.root.isEnd, true)

        // Title
        ctx.fillStyle = '#667eea'
        ctx.font = 'bold 16px Inter'
        ctx.textAlign = 'center'
        ctx.fillText('Compressed Trie (Patricia Trie)', canvas.width / 2, 30)

        // Draw Tree
        // Start recursive drawing with root's spread
        this.drawTreeRecursive(this.root, rootX, rootY, canvas.width - 40)
    }

    drawTreeRecursive(node, x, y, spread) {
        const ctx = this.ctx
        const childrenKeys = Object.keys(node.children || {}).sort()

        if (childrenKeys.length === 0) return

        const levelHeight = 60
        const childY = y + levelHeight

        // Determine spread for children
        const minChildWidth = 50 // Minimum width per child
        const requiredWidth = childrenKeys.length * minChildWidth

        // Use the larger of available spread or required width to prevent overlap
        // If we are deep in the tree, usually spread gets smaller, but we must expand if needed
        const actualSpread = Math.max(spread, requiredWidth)

        // Each child gets a slice of this spread
        const childSlice = actualSpread / childrenKeys.length

        // Start X position: Center of the spread area relative to parent X
        let currentX = x - (actualSpread / 2) + (childSlice / 2)

        childrenKeys.forEach(key => {
            const childNode = node.children[key]

            // Draw Line
            ctx.beginPath()
            ctx.moveTo(x, y + 8) // From bottom of parent
            ctx.lineTo(currentX, childY - 8) // To top of child
            ctx.strokeStyle = '#64748b'
            ctx.lineWidth = 1
            ctx.stroke()

            // Draw Edge Label (The Key Segment)
            const midX = (x + currentX) / 2
            const midY = (y + childY) / 2

            // Label Background
            ctx.font = 'bold 12px monospace'
            const textWidth = ctx.measureText(key).width
            ctx.fillStyle = '#0f172a'
            ctx.fillRect(midX - textWidth / 2 - 4, midY - 8, textWidth + 8, 16)

            // Label Text
            ctx.fillStyle = '#fbbf24' // Amber-400
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(key, midX, midY)

            // Draw Child Node
            this.drawNodeCircle(currentX, childY, childNode.isEnd, false)

            // Recurse
            // Pass a portion of the spread to the child
            // We reduce it slightly (0.9) to keep children grouped
            this.drawTreeRecursive(childNode, currentX, childY, childSlice * 0.9)

            currentX += childSlice
        })
    }

    drawNodeCircle(x, y, isEnd, isRoot) {
        const ctx = this.ctx
        const radius = isRoot ? 10 : 8

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)

        if (isRoot) {
            ctx.fillStyle = '#475569'
        } else if (isEnd) {
            ctx.fillStyle = '#10b981' // Green for word end
        } else {
            ctx.fillStyle = '#3b82f6' // Blue for intermediate
        }
        ctx.fill()

        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
    }
}
