import { getCursorPosition, setCursorPosition, debounce } from './utils.js'
import { VersionHistory } from './VersionHistory.js'
import { BracketMatcher } from './BracketMatcher.js'

/**
 * TextEditor class - manages the contenteditable text area and state
 */
export class TextEditor {
    constructor(element) {
        this.element = element
        // Replace linear stacks with branching version history
        this.history = new VersionHistory('')
        this.bracketMatcher = new BracketMatcher()
        this.maxHistorySize = 50
        this.showingRedoChildSelector = false
        this.listeners = {
            'change': [],
            'undo': [],
            'redo': [],
            'cursorMove': [],
            'predict': [],
            'type': [],
            'historyUpdate': [] // New event for version tree updates
        }

        this.setupEventListeners()
        this.currentSuggestion = null
    }

    setupEventListeners() {
        // Save state on input (debounced for performance)
        const debouncedSave = debounce(() => {
            this.saveState()
            this.emit('change', this.getText())
            this.emit('change', this.getText())
            this.emit('predict', null) // Trigger prediction check
        }, 1000) // Increase debounce to 1s to avoid breaking words mid-typing for slow typers

        this.element.addEventListener('input', (e) => {
            this.emit('type') // Emit typing event for audio

            // If typing, clear invalid suggestion unless we want to keep it?
            // Safer to clear and re-predict
            if (this.currentSuggestion) {
                this.clearSuggestion()
            }

            // Check for word boundaries (space or newline) to save state immediately
            // inputType can help discriminate, but checking the last char is also viable
            // However, input event fires AFTER change, so we can check e.data
            if (e.data === ' ' || e.inputType === 'insertParagraph' || e.inputType === 'insertLineBreak') {
                this.saveState()
                debouncedSave.cancel() // Cancel pending debounce since we just saved
            } else {
                debouncedSave()
            }
        })

        // Track cursor movements
        this.element.addEventListener('click', () => {
            this.clearSuggestion() // Clear on move
            this.emit('cursorMove', this.getCursorPosition())
        })

        this.element.addEventListener('keyup', (e) => {
            if (!e.ctrlKey && !e.metaKey) {
                this.emit('cursorMove', this.getCursorPosition())
            }
        })

        // Keyboard shortcuts
        this.element.addEventListener('keydown', (e) => {
            // Tab to accept suggestion
            if (e.key === 'Tab') {
                e.preventDefault()
                if (this.acceptSuggestion()) {
                    return
                }
                // Indent behavior? For now just prevent default to avoid focus loss
            }

            // Undo: Ctrl/Cmd + Z
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault()
                this.undo()
            }
            // Redo: Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z
            else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault()
                this.redo()
            }
            // Ctrl+Q: Select redo child (if multiple branches exist)
            else if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
                e.preventDefault()
                this.showRedoChildSelector()
            }
            // Ctrl+B: Go to matching bracket
            else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault()
                this.goToMatchingBracket()
            }
        })
    }

    getText() {
        // Return text without the suggestion ghost
        const clone = this.element.cloneNode(true)
        const ghosts = clone.querySelectorAll('.ghost-text')
        ghosts.forEach(g => g.remove())
        return clone.innerText || ''
    }

    setSuggestion(text, isCompletion = false) {
        // Remove existing ghost
        this.clearSuggestion()

        if (!text) return

        const sel = window.getSelection()
        if (sel.rangeCount === 0) return

        const range = sel.getRangeAt(0)

        // Only show if cursor is at the end of a text node or the element
        // Simplifying: append a span at the current range

        const span = document.createElement('span')
        span.className = 'ghost-text'
        span.contentEditable = 'false'
        span.innerText = isCompletion ? text : ' ' + text
        span.style.color = '#94a3b8'
        span.style.pointerEvents = 'none'

        range.insertNode(span)

        // Move cursor back to before the span (otherwise it jumps after)
        // Actually, we want cursor BEFORE the ghost
        range.setEndBefore(span)
        range.collapse(false) // collapse to end

        this.currentSuggestion = text
    }

    clearSuggestion() {
        const ghosts = this.element.querySelectorAll('.ghost-text')
        ghosts.forEach(g => g.remove())
        this.currentSuggestion = null
    }

    acceptSuggestion() {
        if (!this.currentSuggestion) return false

        const ghosts = this.element.querySelectorAll('.ghost-text')
        ghosts.forEach(g => {
            // Convert to regular text node
            const text = document.createTextNode(g.innerText)
            g.parentNode.replaceChild(text, g)
        })

        // Move cursor to end
        const sel = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(this.element)
        range.collapse(false)
        sel.removeAllRanges()
        sel.addRange(range)

        this.currentSuggestion = null
        this.emit('change', this.getText())
        return true
    }

    setText(text) {
        const cursorPos = this.getCursorPosition()
        this.element.innerText = text
        // Try to restore cursor position
        if (cursorPos <= text.length) {
            setCursorPosition(this.element, cursorPos)
        }
    }

    getCursorPosition() {
        return getCursorPosition(this.element)
    }

    getWords() {
        const text = this.getText()
        return text.match(/\b[a-z0-9]+\b/gi) || []
    }

    getCharacters() {
        return this.getText().split('')
    }

    saveState() {
        const currentText = this.getText()
        
        // Add version to history tree (creates branch if needed)
        this.history.addVersion(currentText)
        this.emit('historyUpdate', this.history)
    }

    undo() {
        const previousContent = this.history.undo()
        if (previousContent !== null) {
            this.setText(previousContent)
            this.emit('undo', previousContent)
            this.emit('change', previousContent)
            this.emit('historyUpdate', this.history)
        }
    }

    redo() {
        const nextContent = this.history.redo()
        if (nextContent !== null) {
            this.setText(nextContent)
            this.emit('redo', nextContent)
            this.emit('change', nextContent)
            this.emit('historyUpdate', this.history)
        }
    }

    clear() {
        this.setText('')
        this.history = new VersionHistory('')
        this.emit('change', '')
        this.emit('historyUpdate', this.history)
    }

    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback)
        }
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data))
        }
    }

    getUndoStack() {
        // For backward compatibility with StackVisualizer
        const path = []
        let node = this.history.currentNode
        while (node) {
            path.unshift(node.content)
            node = node.parent
        }
        return path
    }

    getRedoStack() {
        // Return children as potential redo options
        return this.history.currentNode.children.map(child => child.content)
    }

    showRedoChildSelector() {
        const children = this.history.currentNode.children
        if (children.length === 0) {
            return // No redo options
        }
        
        if (children.length === 1) {
            // Only one option, just redo
            this.redo()
            return
        }

        // Multiple branches - show selector
        this.showingRedoChildSelector = true
        this.emit('showRedoSelector', children)
    }

    selectRedoChild(index) {
        const children = this.history.currentNode.children
        if (index >= 0 && index < children.length) {
            const targetNode = children[index]
            const content = this.history.jumpTo(targetNode.id)
            if (content !== null) {
                this.setText(content)
                this.emit('redo', content)
                this.emit('change', content)
                this.emit('historyUpdate', this.history)
            }
        }
        this.showingRedoChildSelector = false
    }

    goToMatchingBracket() {
        const text = this.getText()
        const cursorPos = this.getCursorPosition()
        
        const matchPos = this.bracketMatcher.findMatchingBracket(text, cursorPos)
        if (matchPos !== null) {
            setCursorPosition(this.element, matchPos)
            this.emit('cursorMove', matchPos)
        }
    }

    getBracketAnalysis() {
        return this.bracketMatcher.analyze(this.getText())
    }
}
