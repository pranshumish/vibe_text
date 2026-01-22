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
            'cursorMove': []
        }

        this.setupEventListeners()
        this.saveState() // Initial state
    }

    setupEventListeners() {
        // Save state on input (debounced for performance)
        const debouncedSave = debounce(() => {
            this.saveState()
            this.emit('change', this.getText())
        }, 300)

        this.element.addEventListener('input', () => {
            debouncedSave()
        })

        // Track cursor movements
        this.element.addEventListener('click', () => {
            this.emit('cursorMove', this.getCursorPosition())
        })

        this.element.addEventListener('keyup', (e) => {
            if (!e.ctrlKey && !e.metaKey) {
                this.emit('cursorMove', this.getCursorPosition())
            }
        })

        // Keyboard shortcuts
        this.element.addEventListener('keydown', (e) => {
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
        return this.element.innerText || ''
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
        if (this.undoStack.length <= 1) return // Keep at least one state

        const currentState = this.undoStack.pop()
        this.redoStack.push(currentState)

        const previousState = this.undoStack[this.undoStack.length - 1]
        this.setText(previousState)

        this.emit('undo', previousState)
        this.emit('change', previousState)
    }

    redo() {
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
