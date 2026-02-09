/**
 * BracketMatcher - Stack-based bracket matching algorithm
 * Analyzes text for matching brackets and provides navigation
 */
export class BracketMatcher {
    constructor() {
        this.bracketPairs = {
            '(': ')',
            '[': ']',
            '{': '}',
            '<': '>'
        };
        this.openBrackets = new Set(Object.keys(this.bracketPairs));
        this.closeBrackets = new Set(Object.values(this.bracketPairs));
        this.reverseMap = {};
        
        // Build reverse map for closing brackets
        for (const [open, close] of Object.entries(this.bracketPairs)) {
            this.reverseMap[close] = open;
        }
    }

    /**
     * Analyzes text and returns bracket matching information
     * @param {string} text - The text to analyze
     * @returns {Object} - { stack, matches, errors }
     */
    analyze(text) {
        const stack = []; // Stack of unmatched opening brackets
        const matches = new Map(); // Map of position -> matching position
        const errors = []; // Array of error positions

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if (this.openBrackets.has(char)) {
                // Push opening bracket with its position
                stack.push({ char, index: i });
            } else if (this.closeBrackets.has(char)) {
                // Found closing bracket
                const expectedOpen = this.reverseMap[char];

                if (stack.length === 0) {
                    // Closing bracket without matching opening
                    errors.push({ index: i, char, type: 'unmatched_close' });
                } else {
                    const top = stack[stack.length - 1];
                    
                    if (top.char === expectedOpen) {
                        // Match found!
                        stack.pop();
                        matches.set(top.index, i);
                        matches.set(i, top.index);
                    } else {
                        // Mismatched brackets
                        errors.push({ 
                            index: i, 
                            char, 
                            type: 'mismatch',
                            expected: this.bracketPairs[top.char]
                        });
                        stack.pop(); // Pop the mismatched one
                    }
                }
            }
        }

        // Remaining items in stack are unclosed brackets
        stack.forEach(item => {
            errors.push({ 
                index: item.index, 
                char: item.char, 
                type: 'unclosed' 
            });
        });

        return {
            stack: stack, // Unclosed brackets
            matches: matches, // Map of matching positions
            errors: errors // All errors
        };
    }

    /**
     * Finds the matching bracket for a given position
     * @param {string} text - The text
     * @param {number} position - Cursor position
     * @returns {number|null} - Position of matching bracket or null
     */
    findMatchingBracket(text, position) {
        const analysis = this.analyze(text);
        return analysis.matches.get(position) ?? null;
    }

    /**
     * Checks if brackets are balanced
     * @param {string} text - The text to check
     * @returns {boolean} - True if balanced
     */
    isBalanced(text) {
        const analysis = this.analyze(text);
        return analysis.stack.length === 0 && analysis.errors.length === 0;
    }

    /**
     * Gets all bracket pairs in the text
     * @param {string} text - The text
     * @returns {Array} - Array of {open, close} position pairs
     */
    getAllPairs(text) {
        const analysis = this.analyze(text);
        const pairs = [];
        const processed = new Set();

        for (const [pos1, pos2] of analysis.matches) {
            if (!processed.has(pos1) && !processed.has(pos2)) {
                pairs.push({
                    open: Math.min(pos1, pos2),
                    close: Math.max(pos1, pos2)
                });
                processed.add(pos1);
                processed.add(pos2);
            }
        }

        return pairs;
    }
}
