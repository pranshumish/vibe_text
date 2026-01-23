/**
 * Predictor class - uses N-Gram model (Markov Chain) for text prediction
 */
export class Predictor {
    constructor() {
        // Map of "word1 word2" -> Map(nextWord -> frequency)
        this.trigrams = new Map()
        // Map of "word1" -> Map(nextWord -> frequency)
        this.bigrams = new Map()
    }

    /**
     * Train the model with text
     * @param {string} text 
     */
    train(text) {
        // Clear previous state to rebuild from current text (simple approach)
        this.trigrams.clear()
        this.bigrams.clear()

        const words = text.toLowerCase().match(/\b[a-z0-9']+\b/gi) || []

        if (words.length < 2) return

        for (let i = 0; i < words.length - 1; i++) {
            const w1 = words[i]
            const w2 = words[i + 1]

            // Learn Bigram: w1 -> w2
            this.addTransition(this.bigrams, w1, w2)

            if (i < words.length - 2) {
                const w3 = words[i + 2]
                // Learn Trigram: "w1 w2" -> w3
                this.addTransition(this.trigrams, `${w1} ${w2}`, w3)
            }
        }
    }

    addTransition(model, key, value) {
        if (!model.has(key)) {
            model.set(key, new Map())
        }
        const nextWords = model.get(key)
        const count = nextWords.get(value) || 0
        nextWords.set(value, count + 1)
    }

    /**
     * Get best prediction based on context
     * @param {string} text - The text before the cursor
     */
    predict(text) {
        const words = text.toLowerCase().match(/\b[a-z0-9']+\b/gi) || []
        if (words.length === 0) return null

        let bestGuess = null

        // Try Trigram first (last 2 words)
        if (words.length >= 2) {
            const lastTwo = `${words[words.length - 2]} ${words[words.length - 1]}`
            bestGuess = this.getBestNext(this.trigrams, lastTwo)
        }

        // Fallback to Bigram (last 1 word)
        if (!bestGuess && words.length >= 1) {
            const lastOne = words[words.length - 1]
            bestGuess = this.getBestNext(this.bigrams, lastOne)
        }

        return bestGuess
    }

    getBestNext(model, key) {
        if (!model.has(key)) return null

        const nextWords = model.get(key)
        let bestWord = null
        let maxFreq = 0

        for (const [word, freq] of nextWords) {
            if (freq > maxFreq) {
                maxFreq = freq
                bestWord = word
            }
        }

        return bestWord
    }
}
