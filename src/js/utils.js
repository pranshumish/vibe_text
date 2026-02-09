// Utility functions for text processing and performance

/**
 * Tokenize text into words (alphanumeric sequences)
 */
export function tokenizeWords(text) {
    if (!text) return []
    return text.toLowerCase()
        .match(/\b[a-z0-9]+\b/gi) || []
}

/**
 * Get unique words from text
 */
export function getUniqueWords(text) {
    return [...new Set(tokenizeWords(text))]
}

/**
 * Debounce function for performance optimization
 */
export function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * Common English stop words to filter
 */
export const STOP_WORDS = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what'
])

/**
 * Filter out common stop words
 */
export function filterStopWords(words) {
    return words.filter(word => !STOP_WORDS.has(word.toLowerCase()))
}

/**
 * Get text statistics
 */
export function getTextStats(text) {
    const words = tokenizeWords(text)
    const uniqueWords = new Set(words)

    return {
        characters: text.length,
        words: words.length,
        uniqueWords: uniqueWords.size,
        lines: text.split('\n').length
    }
}

/**
 * Get word frequency map
 */
export function getWordFrequency(text, ignoreStopWords = false) {
    let words = tokenizeWords(text)
    if (ignoreStopWords) {
        words = filterStopWords(words)
    }

    const frequency = new Map()
    for (const word of words) {
        frequency.set(word, (frequency.get(word) || 0) + 1)
    }

    return frequency
}

/**
 * Get top N most frequent words
 */
export function getTopWords(text, n = 10, ignoreStopWords = false) {
    const frequency = getWordFrequency(text, ignoreStopWords)
    return Array.from(frequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
}

/**
 * Build word adjacency pairs (for graph)
 */
export function getWordPairs(text) {
    const words = tokenizeWords(text)
    const pairs = []

    for (let i = 0; i < words.length - 1; i++) {
        pairs.push([words[i], words[i + 1]])
    }

    return pairs
}

/**
 * Get cursor position in contenteditable div
 */
export function getCursorPosition(element) {
    const selection = window.getSelection()
    if (selection.rangeCount === 0) return 0

    const range = selection.getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(element)
    preCaretRange.setEnd(range.endContainer, range.endOffset)

    return preCaretRange.toString().length
}

/**
 * Set cursor position in contenteditable div
 */
export function setCursorPosition(element, position) {
    const range = document.createRange()
    const sel = window.getSelection()

    let currentPos = 0
    let found = false

    function traverseNodes(node) {
        if (found) return

        if (node.nodeType === Node.TEXT_NODE) {
            const nextPos = currentPos + node.length
            if (position <= nextPos) {
                range.setStart(node, position - currentPos)
                range.collapse(true)
                found = true
                return
            }
            currentPos = nextPos
        } else {
            for (let i = 0; i < node.childNodes.length; i++) {
                traverseNodes(node.childNodes[i])
                if (found) return
            }
        }
    }

    traverseNodes(element)

    if (found) {
        sel.removeAllRanges()
        sel.addRange(range)
    }
}
