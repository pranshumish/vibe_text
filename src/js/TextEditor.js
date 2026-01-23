import { getCursorPosition, setCursorPosition, debounce } from './utils.js'

/**
 * TextEditor class - manages the contenteditable text area and state
 */
export class TextEditor {
    constructor(element) {
        this.element = element
        this.undoStack = []
        this.redoStack = []
        this.maxHistorySize = 50
        this.listeners = {
            'change': [],
            'undo': [],
            'redo': [],
            'cursorMove': [],
            'predict': []
        }

        this.setupEventListeners()
        this.saveState() // Initial state
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

        // Don't save if it's the same as the last state
        if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === currentText) {
            return
        }

        this.undoStack.push(currentText)

        // Limit history size
        if (this.undoStack.length > this.maxHistorySize) {
            this.undoStack.shift()
        }

        // Clear redo stack when new action is performed
        this.redoStack = []
    }

    undo() {
        // Ensure pending changes are saved before undoing
        const currentText = this.getText()
        if (this.undoStack.length === 0 || (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] !== currentText)) {
            this.saveState()
        }

        if (this.undoStack.length <= 1) return // Keep at least one state

        const currentState = this.undoStack.pop()
        this.redoStack.push(currentState)

        const previousState = this.undoStack[this.undoStack.length - 1]
        this.setText(previousState)

        this.emit('undo', previousState)
        this.emit('change', previousState)
    }

    redo() {
        // If we have unsaved changes, that counts as a new branch of history
        // triggering saveState which (correctly) clears the redo stack.
        const currentText = this.getText()
        if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] !== currentText) {
            this.saveState()
            return // Redo stack is now empty
        }

        if (this.redoStack.length === 0) return

        const nextState = this.redoStack.pop()
        this.undoStack.push(nextState)
        this.setText(nextState)

        this.emit('redo', nextState)
        this.emit('change', nextState)
    }

    clear() {
        this.setText('')
        this.undoStack = ['']
        this.redoStack = []
        this.emit('change', '')
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
        return [...this.undoStack]
    }

    getRedoStack() {
        return [...this.redoStack]
    }
}
