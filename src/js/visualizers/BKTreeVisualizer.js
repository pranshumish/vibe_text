export class BKTreeVisualizer {
    constructor(canvas, ctx) {
        this.canvas = canvas
        this.ctx = ctx
        this.root = null
        this.dictionary = new Set()
        this.dictionaryLoaded = false
        this.error = null
        this.currentWord = ''
        this.suggestions = []
        this.tolerance = 2  // Edit distance tolerance
        this.misspelledWords = []
        this.loadDictionary()
    }

    async loadDictionary() {
        try {
            const response = await fetch('/dictionary.txt')
            const text = await response.text()
            const words = text.split('\n').map(w => w.trim().toLowerCase()).filter(w => w.length > 0)

            // Build BK-Tree
            this.dictionary = new Set(words)
            console.log(`📚 Dictionary contains ${words.length} words`)
            console.log(`📝 Sample words:`, words.slice(0, 10))
            console.log(`✓ Contains "the":`, this.dictionary.has('the'))
            console.log(`✓ Contains "quick":`, this.dictionary.has('quick'))

            this.buildBKTree(words)

            this.dictionaryLoaded = true
            console.log(`✅ Loaded ${words.length} words into BK-Tree`)

            // Test search
            const testResults = this.search('teh', 2)
            console.log(`🔍 Test search for "teh" found:`, testResults)

            this.draw()
        } catch (e) {
            console.error('Failed to load dictionary:', e)
            this.error = `Failed to load dictionary: ${e.message}`
            this.draw()
        }
    }

    buildBKTree(words) {
        if (words.length === 0) return

        // Use first word as root
        this.root = this.createNode(words[0])

        // Insert remaining words
        for (let i = 1; i < words.length; i++) {
            this.insert(words[i])
        }
    }

    createNode(word) {
        return {
            word: word,
            children: {}  // Key: edit distance, Value: child node
        }
    }

    insert(word) {
        if (!this.root) {
            this.root = this.createNode(word)
            return
        }

        let current = this.root

        while (true) {
            const distance = this.levenshteinDistance(current.word, word)

            // Word already exists
            if (distance === 0) return

            // If no child at this distance, insert here
            if (!current.children[distance]) {
                current.children[distance] = this.createNode(word)
                return
            }

            // Traverse to child
            current = current.children[distance]
        }
    }

    // Levenshtein distance calculation
    levenshteinDistance(s1, s2) {
        const len1 = s1.length
        const len2 = s2.length

        // Create matrix
        const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0))

        // Initialize
        for (let i = 0; i <= len1; i++) matrix[i][0] = i
        for (let j = 0; j <= len2; j++) matrix[0][j] = j

        // Fill matrix
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // deletion
                    matrix[i][j - 1] + 1,      // insertion
                    matrix[i - 1][j - 1] + cost  // substitution
                )
            }
        }

        return matrix[len1][len2]
    }

    // Search for similar words within tolerance
    search(word, tolerance = this.tolerance) {
        const results = []
        this.searchRecursive(this.root, word, tolerance, results)

        // Sort by distance, then alphabetically
        results.sort((a, b) => {
            if (a.distance !== b.distance) return a.distance - b.distance
            return a.word.localeCompare(b.word)
        })

        return results.slice(0, 20)  // Limit to 20 suggestions
    }

    searchRecursive(node, target, tolerance, results) {
        if (!node || results.length >= 50) return

        const distance = this.levenshteinDistance(node.word, target)

        // If within tolerance, add to results
        if (distance <= tolerance) {
            results.push({ word: node.word, distance })
        }

        // Search children within range
        const minDist = Math.max(0, distance - tolerance)
        const maxDist = distance + tolerance

        for (let i = minDist; i <= maxDist; i++) {
            if (node.children[i]) {
                this.searchRecursive(node.children[i], target, tolerance, results)
            }
        }
    }

    updateFromText(text, textEditor) {
        if (!this.dictionaryLoaded) return

        // Get current word at cursor
        const cursorPosition = textEditor.getCursorPosition()
        const textBeforeCursor = text.substring(0, cursorPosition)
        const match = textBeforeCursor.match(/\b[a-zA-Z]+$/)

        if (match) {
            const word = match[0].toLowerCase()
            this.currentWord = word

            // Always search for suggestions, even if word is correct
            // This shows how BK-Tree finds similar words
            if (word.length > 2) {
                if (!this.dictionary.has(word)) {
                    // Word is misspelled - search for corrections
                    console.log(`🔍 Searching for "${word}" with tolerance ${this.tolerance}`)
                    this.suggestions = this.search(word, this.tolerance)
                    console.log(`📋 Found ${this.suggestions.length} suggestions:`, this.suggestions)
                } else {
                    // Word is correct - still show similar words for educational purposes
                    this.suggestions = this.search(word, 1).filter(s => s.word !== word)
                }
            } else {
                this.suggestions = []
            }
        } else {
            this.currentWord = ''
            this.suggestions = []
        }

        // Find all misspelled words in text
        this.findMisspelledWords(text)

        this.draw()
    }

    findMisspelledWords(text) {
        const words = text.match(/\b[a-zA-Z]+\b/g) || []
        this.misspelledWords = []

        const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))]

        for (const word of uniqueWords) {
            if (word.length > 2 && !this.dictionary.has(word)) {
                this.misspelledWords.push(word)
            }
        }
    }

    reset() {
        this.currentWord = ''
        this.suggestions = []
        this.misspelledWords = []
        this.draw()
    }

    draw() {
        const ctx = this.ctx
        const canvas = this.canvas

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (this.error) {
            ctx.fillStyle = '#ef4444'
            ctx.font = '16px Inter'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(this.error, canvas.width / 2, canvas.height / 2)
            return
        }

        if (!this.dictionaryLoaded) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '16px Inter'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('Loading dictionary...', canvas.width / 2, canvas.height / 2)
            return
        }

        // Draw header
        ctx.fillStyle = '#667eea'
        ctx.font = 'bold 20px Inter'
        ctx.textAlign = 'center'
        ctx.fillText('BK-Tree Spell Checker', canvas.width / 2, 30)

        // Draw error count badge
        if (this.misspelledWords.length > 0) {
            this.drawErrorBadge(this.misspelledWords.length)
        }

        if (!this.currentWord) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '16px Inter'
            ctx.textAlign = 'center'
            ctx.fillText('Type to see spell check suggestions', canvas.width / 2, canvas.height / 2)

            // Show misspelled words list if any
            if (this.misspelledWords.length > 0) {
                this.drawMisspelledWordsList()
            }
            return
        }

        // Check if current word is correct
        const isCorrect = this.dictionary.has(this.currentWord)

        if (isCorrect) {
            this.drawCorrectWord()
        } else {
            this.drawMisspelledWord()
        }
    }

    drawErrorBadge(count) {
        const ctx = this.ctx
        const x = this.canvas.width - 80
        const y = 30

        // Badge background with glassmorphism
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(x - 60, y - 15, 120, 30, 15)
        ctx.fill()
        ctx.stroke()

        // Badge text
        ctx.fillStyle = '#ef4444'
        ctx.font = 'bold 14px Inter'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${count} error${count !== 1 ? 's' : ''}`, x, y)
    }

    drawCorrectWord() {
        const ctx = this.ctx
        const canvas = this.canvas

        // Success indicator
        ctx.fillStyle = '#10b981'
        ctx.font = 'bold 18px Inter'
        ctx.textAlign = 'center'
        ctx.fillText(`✓ "${this.currentWord}" is spelled correctly`, canvas.width / 2, 80)

        // Draw simplified BK-Tree visualization
        this.drawSimplifiedTree()
    }

    drawMisspelledWord() {
        const ctx = this.ctx
        const canvas = this.canvas

        // Error indicator
        ctx.fillStyle = '#ef4444'
        ctx.font = 'bold 18px Inter'
        ctx.textAlign = 'center'
        ctx.fillText(`✗ "${this.currentWord}" not found in dictionary`, canvas.width / 2, 80)

        if (this.suggestions.length === 0) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '16px Inter'
            ctx.fillText('No suggestions found', canvas.width / 2, 120)
            return
        }

        // Draw suggestions
        ctx.fillStyle = '#94a3b8'
        ctx.font = '14px Inter'
        ctx.fillText('Suggestions (ranked by edit distance):', canvas.width / 2, 120)

        this.drawSuggestionsList()
        this.drawEditDistanceVisualization()
    }

    drawSuggestionsList() {
        const ctx = this.ctx
        const canvas = this.canvas
        const startY = 160
        const itemHeight = 40
        const maxVisible = 8

        const visibleSuggestions = this.suggestions.slice(0, maxVisible)

        visibleSuggestions.forEach((suggestion, index) => {
            const y = startY + index * itemHeight
            const x = canvas.width / 2

            // Card background with glassmorphism
            const gradient = ctx.createLinearGradient(x - 180, y, x + 180, y)
            gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)')
            gradient.addColorStop(1, 'rgba(118, 75, 162, 0.1)')
            ctx.fillStyle = gradient

            ctx.strokeStyle = suggestion.distance === 1 ? '#10b981' : '#667eea'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.roundRect(x - 180, y - 15, 360, 35, 8)
            ctx.fill()
            ctx.stroke()

            // Word
            ctx.fillStyle = '#e2e8f0'
            ctx.font = 'bold 16px Inter'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'middle'
            ctx.fillText(suggestion.word, x - 160, y)

            // Distance badge
            ctx.fillStyle = suggestion.distance === 1 ? '#10b981' : '#667eea'
            ctx.font = 'bold 12px Inter'
            ctx.textAlign = 'right'
            ctx.fillText(`distance: ${suggestion.distance}`, x + 160, y)
        })

        if (this.suggestions.length > maxVisible) {
            ctx.fillStyle = '#94a3b8'
            ctx.font = '12px Inter'
            ctx.textAlign = 'center'
            ctx.fillText(`+${this.suggestions.length - maxVisible} more suggestions`, canvas.width / 2, startY + maxVisible * itemHeight)
        }
    }

    drawEditDistanceVisualization() {
        // Draw a small visualization showing how edit distance works
        if (this.suggestions.length === 0) return

        const ctx = this.ctx
        const canvas = this.canvas
        const y = canvas.height - 100

        ctx.fillStyle = '#94a3b8'
        ctx.font = '12px Inter'
        ctx.textAlign = 'center'
        ctx.fillText('Edit distance: insertions, deletions, substitutions needed', canvas.width / 2, y)

        // Example with top suggestion
        const topSuggestion = this.suggestions[0]
        this.drawEditExample(topSuggestion.word, y + 30)
    }

    drawEditExample(suggestion, y) {
        const ctx = this.ctx
        const x = this.canvas.width / 2

        // Show character-by-character comparison
        ctx.font = 'bold 14px monospace'
        ctx.textAlign = 'center'

        const maxLen = Math.max(this.currentWord.length, suggestion.length)
        const charWidth = 20
        const startX = x - (maxLen * charWidth) / 2

        for (let i = 0; i < maxLen; i++) {
            const thisChar = this.currentWord[i] || ''
            const suggChar = suggestion[i] || ''
            const match = thisChar === suggChar

            // Your word
            ctx.fillStyle = match ? '#10b981' : '#ef4444'
            ctx.fillText(thisChar || '·', startX + i * charWidth, y)

            // Suggestion
            ctx.fillStyle = match ? '#10b981' : '#667eea'
            ctx.fillText(suggChar || '·', startX + i * charWidth, y + 20)
        }

        // Labels
        ctx.font = '10px Inter'
        ctx.fillStyle = '#94a3b8'
        ctx.textAlign = 'right'
        ctx.fillText('Input:', startX - 10, y)
        ctx.fillText('Suggest:', startX - 10, y + 20)
    }

    drawMisspelledWordsList() {
        const ctx = this.ctx
        const y = this.canvas.height - 60

        ctx.fillStyle = '#ef4444'
        ctx.font = 'bold 14px Inter'
        ctx.textAlign = 'left'
        ctx.fillText('Misspelled Words:', 20, y)

        ctx.fillStyle = '#94a3b8'
        ctx.font = '12px Inter'
        const wordsList = this.misspelledWords.slice(0, 10).join(', ')
        const fullText = wordsList + (this.misspelledWords.length > 10 ? '...' : '')

        // Wrap text if needed
        const maxWidth = this.canvas.width - 40
        let line = ''
        let currentY = y + 20

        const words = fullText.split(', ')
        for (let word of words) {
            const testLine = line + word + ', '
            const metrics = ctx.measureText(testLine)
            if (metrics.width > maxWidth && line !== '') {
                ctx.fillText(line, 20, currentY)
                line = word + ', '
                currentY += 16
            } else {
                line = testLine
            }
        }
        ctx.fillText(line, 20, currentY)
    }

    drawSimplifiedTree() {
        // Draw a simplified representation of BK-Tree structure
        const ctx = this.ctx
        const canvas = this.canvas
        const y = 150

        ctx.fillStyle = '#94a3b8'
        ctx.font = '14px Inter'
        ctx.textAlign = 'center'
        ctx.fillText('BK-Tree organizes words by edit distance', canvas.width / 2, y)

        // Draw simple node diagram
        const centerX = canvas.width / 2
        const centerY = y + 60

        // Root node
        this.drawNode(centerX, centerY, this.currentWord, true)

        // Show concept: children at different distances
        const radius = 80
        for (let i = 1; i <= 3; i++) {
            const angle = (i - 2) * Math.PI / 4
            const x = centerX + Math.cos(angle) * radius
            const y = centerY + Math.sin(angle) * radius

            // Line
            ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(centerX, centerY)
            ctx.lineTo(x, y)
            ctx.stroke()

            // Distance label
            ctx.fillStyle = '#667eea'
            ctx.font = 'bold 11px Inter'
            const midX = (centerX + x) / 2
            const midY = (centerY + y) / 2
            ctx.fillText(`d=${i}`, midX, midY - 5)

            // Child node
            this.drawNode(x, y, '...', false)
        }
    }

    drawNode(x, y, label, isHighlight = false) {
        const ctx = this.ctx
        const radius = 25

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.beginPath()
        ctx.arc(x + 2, y + 2, radius, 0, 2 * Math.PI)
        ctx.fill()

        // Node circle
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        if (isHighlight) {
            gradient.addColorStop(0, '#667eea')
            gradient.addColorStop(1, '#764ba2')
        } else {
            gradient.addColorStop(0, '#1a2237')
            gradient.addColorStop(1, '#12182b')
        }
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.fill()

        ctx.strokeStyle = isHighlight ? '#667eea' : 'rgba(255, 255, 255, 0.2)'
        ctx.lineWidth = 2
        ctx.stroke()

        // Label
        ctx.fillStyle = '#e2e8f0'
        ctx.font = 'bold 12px Inter'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, x, y)
    }

    setTolerance(tolerance) {
        this.tolerance = tolerance
        if (this.currentWord) {
            this.updateFromText(this.currentWord, { getCursorPosition: () => this.currentWord.length })
        }
    }
}
