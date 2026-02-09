export class HuffmanCoder {
    /**
     * Encode text using Huffman coding
     * @param {string} text - Text to encode
     * @returns {Object} - {compressed: string, tree: Object, stats: Object}
     */
    static encode(text) {
        if (!text || text.length === 0) {
            return {
                compressed: '',
                tree: null,
                stats: { originalSize: 0, compressedSize: 0, ratio: 0 }
            }
        }

        // 1. Calculate frequencies
        const freqs = {}
        for (const char of text) {
            freqs[char] = (freqs[char] || 0) + 1
        }

        // 2. Build Huffman tree
        const tree = this.buildTree(freqs)

        // 3. Generate codes
        const codes = {}
        this.generateCodes(tree, '', codes)

        // 4. Encode text
        let compressed = ''
        for (const char of text) {
            compressed += codes[char]
        }

        // 5. Calculate stats
        const originalSize = text.length * 8 // 8 bits per char
        const compressedSize = compressed.length
        const ratio = originalSize > 0 ? (1 - compressedSize / originalSize) * 100 : 0

        return {
            compressed,
            tree: this.serializeTree(tree),
            stats: {
                originalSize,
                compressedSize,
                ratio,
                originalLength: text.length
            }
        }
    }

    /**
     * Decode compressed data using Huffman tree
     * @param {string} compressed - Binary string (e.g., "01101001")
     * @param {Object} tree - Serialized Huffman tree
     * @returns {string} - Decoded text
     */
    static decode(compressed, tree) {
        if (!compressed || !tree) {
            return ''
        }

        const root = this.deserializeTree(tree)
        let result = ''
        let current = root

        // Handle single character case
        if (root.type === 'leaf') {
            return root.char.repeat(compressed.length)
        }

        for (const bit of compressed) {
            current = bit === '0' ? current.left : current.right

            if (current.type === 'leaf') {
                result += current.char
                current = root // Reset to root
            }
        }

        return result
    }

    /**
     * Build Huffman tree from frequency map
     * @param {Object} freqs - Character frequency map
     * @returns {Object} - Root node of Huffman tree
     */
    static buildTree(freqs) {
        // Create leaf nodes
        let nodes = Object.keys(freqs).map(char => ({
            type: 'leaf',
            char: char,
            freq: freqs[char],
            id: Math.random().toString(36).substr(2, 9)
        }))

        // Build tree using priority queue (sorted array)
        while (nodes.length > 1) {
            nodes.sort((a, b) => a.freq - b.freq)

            const left = nodes.shift()
            const right = nodes.shift()

            const parent = {
                type: 'internal',
                freq: left.freq + right.freq,
                left: left,
                right: right,
                id: Math.random().toString(36).substr(2, 9)
            }
            nodes.push(parent)
        }

        return nodes[0]
    }

    /**
     * Generate Huffman codes from tree
     * @param {Object} node - Current tree node
     * @param {string} code - Current code path
     * @param {Object} codes - Output codes object
     */
    static generateCodes(node, code, codes) {
        if (!node) return

        if (node.type === 'leaf') {
            codes[node.char] = code || '0' // Handle single char case
            return
        }

        this.generateCodes(node.left, code + '0', codes)
        this.generateCodes(node.right, code + '1', codes)
    }

    /**
     * Serialize tree to JSON-compatible object
     * @param {Object} node - Tree node
     * @returns {Object} - Serialized tree
     */
    static serializeTree(node) {
        if (!node) return null

        if (node.type === 'leaf') {
            return {
                type: 'leaf',
                char: node.char,
                freq: node.freq
            }
        }

        return {
            type: 'internal',
            freq: node.freq,
            left: this.serializeTree(node.left),
            right: this.serializeTree(node.right)
        }
    }

    /**
     * Deserialize tree from JSON object
     * @param {Object} obj - Serialized tree
     * @returns {Object} - Tree node
     */
    static deserializeTree(obj) {
        if (!obj) return null

        if (obj.type === 'leaf') {
            return {
                type: 'leaf',
                char: obj.char,
                freq: obj.freq,
                id: Math.random().toString(36).substr(2, 9)
            }
        }

        return {
            type: 'internal',
            freq: obj.freq,
            left: this.deserializeTree(obj.left),
            right: this.deserializeTree(obj.right),
            id: Math.random().toString(36).substr(2, 9)
        }
    }
}
