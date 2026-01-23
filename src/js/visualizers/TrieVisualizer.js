export class TrieVisualizer {
    constructor(canvas, ctx) {
        this.canvas = canvas
        this.ctx = ctx
        this.root = { children: {}, isEnd: false }
        this.words = []
        this.dictionaryLoaded = false
        this.loadDictionary()
    }

    async loadDictionary() {
        try {
            const response = await fetch('/dictionary.txt')
            const text = await response.text()
            const words = text.split('\n').map(w => w.trim()).filter(w => w.length > 0)

            this.root = { children: {}, isEnd: false }
            words.forEach(word => this.insert(word))
            this.dictionaryLoaded = true
            console.log(`Loaded ${words.length} words into Trie`)
            this.draw()
        } catch (e) {
            console.error('Failed to load dictionary:', e)
        }
    }

    insert(word) {
        let node = this.root
        for (const char of word) {
            if (!node.children[char]) {
                node.children[char] = { children: {}, isEnd: false, char }
            }
            node = node.children[char]
        }
        node.isEnd = true
    }

    search(word) {
        let node = this.root
        for (const char of word) {
            if (!node.children[char]) return false
            node = node.children[char]
        }
        return node.isEnd
    }

    updateFromText(text, textEditor) {
        if (!this.dictionaryLoaded) return

        // Learn new words from text
        const words = text.match(/\b[a-zA-Z]+\b/gi) || []
        words.forEach(w => {
            const word = w.toLowerCase()
            if (!this.search(word)) {
                this.insert(word)
            }
        })

        // Get the word currently being typed (prefix)
        const cursorPosition = textEditor.getCursorPosition()
        const textBeforeCursor = text.substring(0, cursorPosition)
        const match = textBeforeCursor.match(/\b[a-zA-Z]+$/)

        this.currentPrefix = match ? match[0].toLowerCase() : ''
        this.draw()
    }

    reset() {
        // Just clear the prefix, don't clear the trie
        this.currentPrefix = ''
        this.draw()
    }

    draw() {
        const ctx = this.ctx
        const canvas = this.canvas

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (!this.dictionaryLoaded) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '16px Inter'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('Loading dictionary...', canvas.width / 2, canvas.height / 2)
            return
        }

        if (!this.currentPrefix) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '16px Inter'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('Type to see autocomplete suggestions', canvas.width / 2, canvas.height / 2)
            return
        }

        // Display current prefix
        ctx.fillStyle = '#667eea'
        ctx.font = 'bold 18px Inter'
        ctx.textAlign = 'center'
        ctx.fillText(`Autocomplete for: "${this.currentPrefix}"`, canvas.width / 2, 30)

        // Find the node corresponding to the prefix
        let prefixNode = this.root
        let path = []
        for (const char of this.currentPrefix) {
            if (prefixNode.children[char]) {
                prefixNode = prefixNode.children[char]
                path.push(prefixNode)
            } else {
                // Prefix not found in dictionary
                ctx.fillStyle = '#ef4444'
                ctx.font = '16px Inter'
                ctx.textAlign = 'center'
                ctx.fillText(`No suggestions found for "${this.currentPrefix}"`, canvas.width / 2, canvas.height / 2)
                return
            }
        }

        // Collect all completions from this node
        const completions = []
        this.collectWords(prefixNode, this.currentPrefix, completions)

        // Layout parameters
        const startX = canvas.width / 2
        const startY = 60
        const levelHeight = 50

        // Draw the prefix path (linear vertical)
        this.drawNode(startX, startY, 'ROOT', false, true)

        let currentY = startY + levelHeight
        let parentX = startX

        // Draw path nodes
        path.forEach((node, index) => {
            // Line from parent
            ctx.strokeStyle = '#667eea'
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(parentX, currentY - levelHeight + 15)
            ctx.lineTo(parentX, currentY - 15)
            ctx.stroke()

            this.drawNode(parentX, currentY, node.char, node.isEnd && index === path.length - 1)

            // If it's the last node of prefix, draw its children (suggestions)
            if (index === path.length - 1) {
                this.drawSuggestions(node, parentX, currentY, canvas.width)
            }

            currentY += levelHeight
        })

        // Draw suggestions list at bottom
        this.drawSuggestionsList(completions)
    }

    drawSuggestions(node, x, y, width) {
        const ctx = this.ctx
        const children = Object.values(node.children).sort((a, b) => a.char.localeCompare(b.char))

        if (children.length === 0) return

        const levelHeight = 60
        const childY = y + levelHeight
        // Limit max children to avoid overcrowding
        const maxChildren = 8
        const visibleChildren = children.slice(0, maxChildren)

        const spread = Math.min(width - 40, visibleChildren.length * 50)
        const childSpread = spread / visibleChildren.length
        const startX = x - (spread / 2) + (childSpread / 2)

        visibleChildren.forEach((child, index) => {
            const childX = startX + index * childSpread

            // Draw line
            ctx.strokeStyle = 'rgba(118, 75, 162, 0.5)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(x, y + 15)
            ctx.lineTo(childX, childY - 15)
            ctx.stroke()

            // Draw node
            this.drawNode(childX, childY, child.char, child.isEnd, false, true)

            // Draw subtree (simplified) - just one more level to hint branches
            if (Object.keys(child.children).length > 0) {
                this.drawSimpleSubtree(child, childX, childY)
            }
        })

        if (children.length > maxChildren) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '12px Inter'
            ctx.fillText(`+${children.length - maxChildren} more`, x + spread / 2 + 30, childY)
        }
    }

    drawSimpleSubtree(node, x, y) {
        const ctx = this.ctx
        const children = Object.values(node.children)
        if (children.length === 0) return

        const childY = y + 30
        ctx.strokeStyle = 'rgba(118, 75, 162, 0.3)'
        ctx.beginPath()
        ctx.moveTo(x, y + 15)
        ctx.lineTo(x, childY)
        ctx.stroke()

        // little dot
        ctx.fillStyle = 'rgba(118, 75, 162, 0.5)'
        ctx.beginPath()
        ctx.arc(x, childY, 2, 0, Math.PI * 2)
        ctx.fill()
    }

    collectWords(node, currentWord, results, limit = 20) {
        if (results.length >= limit) return

        if (node.isEnd) {
            results.push(currentWord)
        }

        for (const char in node.children) {
            this.collectWords(node.children[char], currentWord + char, results, limit)
        }
    }

    drawNode(x, y, label, isEnd, isRoot = false, isSuggestion = false) {
        const ctx = this.ctx
        const radius = isRoot ? 20 : 15

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.beginPath()
        ctx.arc(x + 2, y + 2, radius, 0, 2 * Math.PI)
        ctx.fill()

        // Node circle
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        if (isSuggestion) {
            gradient.addColorStop(0, '#764ba2')
            gradient.addColorStop(1, '#667eea')
        } else if (isEnd) {
            gradient.addColorStop(0, '#10b981')
            gradient.addColorStop(1, '#059669')
        } else {
            gradient.addColorStop(0, '#1a2237')
            gradient.addColorStop(1, '#12182b')
        }
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.fill()

        ctx.strokeStyle = isEnd ? '#10b981' : isSuggestion ? '#764ba2' : 'rgba(255, 255, 255, 0.2)'
        ctx.lineWidth = 2
        ctx.stroke()

        // Label
        if (!isRoot) {
            ctx.fillStyle = '#e2e8f0'
            ctx.font = 'bold 12px Inter'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(label, x, y)
        } else {
            ctx.fillStyle = '#94a3b8'
            ctx.font = 'bold 10px Inter'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(label, x, y)
        }
    }

    drawSuggestionsList(words) {
        const ctx = this.ctx
        const canvas = this.canvas

        ctx.fillStyle = '#94a3b8'
        ctx.font = '12px Inter'
        ctx.textAlign = 'left'
        const text = 'Suggestions: ' + (words.length > 0 ? words.join(', ') : 'None')

        // Wrap text if too long
        const maxWidth = canvas.width - 20
        let line = ''
        let y = canvas.height - 40
        const lineHeight = 16

        const wordsList = text.split(' ')
        for (let i = 0; i < wordsList.length; i++) {
            const testLine = line + wordsList[i] + ' '
            const metrics = ctx.measureText(testLine)
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line, 10, y)
                line = wordsList[i] + ' '
                y += lineHeight
            } else {
                line = testLine
            }
        }
        ctx.fillText(line, 10, y)
    }
}
