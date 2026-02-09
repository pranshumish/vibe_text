// import './style.css'
import { StackVisualizer } from './src/js/visualizers/StackVisualizer.js'
import { LinkedListVisualizer } from './src/js/visualizers/LinkedListVisualizer.js'
import { HashMapVisualizer } from './src/js/visualizers/HashMapVisualizer.js'
import { GapBufferVisualizer } from './src/js/visualizers/GapBufferVisualizer.js'
import { TrieVisualizer } from './src/js/visualizers/TrieVisualizer.js'
import { GraphVisualizer } from './src/js/visualizers/GraphVisualizer.js'
import { HuffmanVisualizer } from './src/js/visualizers/HuffmanVisualizer.js'
import { TreeVisualizer } from './src/js/visualizers/TreeVisualizer.js'
import { BracketVisualizer } from './src/js/visualizers/BracketVisualizer.js'
import { TextEditor } from './src/js/TextEditor.js'
import { getTextStats, getWordFrequency } from './src/js/utils.js'

import { Predictor } from './src/js/Predictor.js'
import { AudioSystem } from './src/js/AudioSystem.js'
import { ParticleSystem } from './src/js/ParticleSystem.js'
import { ComplexityViewer } from './src/js/ComplexityViewer.js'
import { wasmLoader } from './src/js/WasmLoader.js'

// App state
let currentDS = 'stack'
let currentVisualizer = null
let textEditor = null
let predictor = new Predictor()
let audioSystem = new AudioSystem()
let particleSystem = null
let complexityViewer = null

// Initialize application
async function initApp() {
    // Load WASM modules first
    try {
        console.log('🚀 Initializing VibeText with C backend...');
        await wasmLoader.loadAll();
        console.log('✓ C backend ready');
    } catch (error) {
        console.error('Failed to load WASM modules:', error);
        console.warn('Falling back to JavaScript implementation');
    }

    setupTextEditor()
    loadSampleText()
    setupNavigation()
    setupSearch()
    setupCanvas()
    switchDataStructure('stack')
}

// Load some initial text to train the predictor
function loadSampleText() {
    fetch('/dictionary.txt')
        .then(res => res.text())
        .then(text => {
            // Create some phrases? Or just rely on user typing?
            // Let's seed with some basic English structure if possible or just rely on runtime
            predictor.train("the quick brown fox jumps over the lazy dog")
            predictor.train("data structures and algorithms are fun")
            predictor.train("stack is a linear data structure")
            predictor.train("linked list has nodes and pointers")
        })
}

function setupTextEditor() {
    const editorElement = document.getElementById('textEditor')
    textEditor = new TextEditor(editorElement)

    // Update stats on text change
    textEditor.on('change', updateStats)

    // Train predictor on text change
    textEditor.on('change', (text) => {
        predictor.train(text)
    })

    // Handle prediction requests
    textEditor.on('predict', () => {
        const text = textEditor.getText()
        // Get text before cursor
        const cursorPos = textEditor.getCursorPosition()
        const textBefore = text.substring(0, cursorPos)

        // Predict next word
        const suggestion = predictor.predict(textBefore)
        if (suggestion) {
            textEditor.setSuggestion(suggestion)
            showStatus(`Suggestion: Press Tab to accept "${suggestion}"`, 'info')
        }
    })

    // Update visualizations on text change
    textEditor.on('change', (text) => {
        if (currentVisualizer && currentVisualizer.updateFromText) {
            currentVisualizer.updateFromText(text, textEditor)

            // If in Trie mode, try to get autocomplete suggestion
            if (currentDS === 'trie' && currentVisualizer.getBestSuggestion) {
                const completion = currentVisualizer.getBestSuggestion()
                if (completion) {
                    textEditor.setSuggestion(completion, true) // true = isCompletion (no space)
                }
            }
        }
    })

    // Clear button
    document.getElementById('clearBtn').addEventListener('click', () => {
        textEditor.clear()
        showStatus('Editor cleared', 'success')
    })

    // Save File
    document.getElementById('saveBtn').addEventListener('click', () => {
        const text = textEditor.getText()
        const blob = new Blob([text], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'editor.txt'
        a.click()
        URL.revokeObjectURL(url)
        showStatus('File saved', 'success')
    })

    // Open File
    const fileInput = document.getElementById('fileInput')
    const openBtn = document.getElementById('openBtn')

    openBtn.addEventListener('click', () => {
        fileInput.click()
    })

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target.result
            textEditor.setText(text)
            // Fix: ensure change event fires to update everything
            textEditor.emit('change', text)
            textEditor.saveState()
            showStatus('File loaded', 'success')
        }
        reader.readAsText(file)
        fileInput.value = '' // Reset so same file can be selected again
    })

    // Particle System
    const particleCanvas = document.getElementById('particleCanvas')
    particleSystem = new ParticleSystem(particleCanvas)

    // Complexity Viewer
    complexityViewer = new ComplexityViewer('complexityDashboard')
    complexityViewer.render()

    // Set placeholder text for demo
    editorElement.focus()

    // Audio integration
    textEditor.on('type', () => {
        audioSystem.playTypeSound()

        // Complexity Update
        updateComplexity('insert')

        // Spawn particles at cursor
        const selection = window.getSelection()
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const rect = range.getBoundingClientRect()
            particleSystem.spawn(rect.left, rect.top + rect.height / 2, '#60a5fa', 3)
        }
    })

    // Undo/Redo particles
    textEditor.on('undo', () => {
        audioSystem.playPopSound()
        updateComplexity('undo')
        // Spawn a burst in center
        const rect = document.getElementById('visualizationCanvas').getBoundingClientRect()
        particleSystem.spawn(rect.left + rect.width / 2, rect.top + rect.height / 2, '#ef4444', 20)
    })

    textEditor.on('redo', () => {
        audioSystem.playPushSound()
        updateComplexity('redo')
        const rect = document.getElementById('visualizationCanvas').getBoundingClientRect()
        particleSystem.spawn(rect.left + rect.width / 2, rect.top + rect.height / 2, '#10b981', 20)
    })

    // History update for version tree
    textEditor.on('historyUpdate', (history) => {
        if (currentDS === 'versiontree' && currentVisualizer) {
            currentVisualizer.updateFromHistory(history)
        }
    })

    // Redo child selector
    textEditor.on('showRedoSelector', (children) => {
        showRedoChildSelector(children)
    })

    // Listen for version jumps from TreeVisualizer
    const canvas = document.getElementById('visualizationCanvas')
    canvas.addEventListener('version-jump', (e) => {
        textEditor.setText(e.detail.content)
        textEditor.emit('change', e.detail.content)
        showStatus(`Jumped to version ${e.detail.id}`, 'success')
    })
}

function updateStats() {
    const text = textEditor.getText()
    const stats = getTextStats(text)

    document.getElementById('charCount').textContent = `${stats.characters} character${stats.characters !== 1 ? 's' : ''}`
    document.getElementById('wordCount').textContent = `${stats.words} word${stats.words !== 1 ? 's' : ''}`
    document.getElementById('lineCount').textContent = `${stats.lines} line${stats.lines !== 1 ? 's' : ''}`
}

function setupNavigation() {
    const tabs = document.querySelectorAll('.nav-tab')
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const ds = tab.dataset.ds
            tabs.forEach(t => t.classList.remove('active'))
            tab.classList.add('active')
            switchDataStructure(ds)
        })
    })

    document.getElementById('resetBtn').addEventListener('click', resetCurrentDS)
}

function setupSearch() {
    const input = document.getElementById('findInput')
    const btn = document.getElementById('findBtn')

    const performSearch = () => {
        const query = input.value.trim().toLowerCase()
        if (!query) return

        // Use HashMap for O(1) lookup
        const text = textEditor.getText()
        const frequencyMap = getWordFrequency(text)
        const count = frequencyMap.get(query) || 0

        if (count > 0) {
            showStatus(`Found "${query}" ${count} time${count !== 1 ? 's' : ''}`, 'success')
            updateComplexity('search')

            // Visual feedback: try to select the word
            // We use window.find() as a simple way to highlight the text in the browser
            // verifying the HashMap's finding visually
            const editor = document.getElementById('textEditor')
            editor.focus()

            // Try finding next
            if (!window.find(query, false, false, true, false, true, false)) {
                // Wrap around
                const sel = window.getSelection()
                sel.collapse(editor, 0)
                window.find(query, false, false, true, false, true, false)
            }
        } else {
            showStatus(`Word "${query}" not found`, 'error')
        }
    }

    btn.addEventListener('click', performSearch)
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch()
    })
}

function setupCanvas() {
    const canvas = document.getElementById('visualizationCanvas')
    const container = canvas.parentElement

    function resizeCanvas() {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
        if (currentVisualizer) {
            currentVisualizer.draw()
        }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
}

function switchDataStructure(ds) {
    currentDS = ds

    // Update title
    const titles = {
        stack: 'Undo/Redo Stack',
        linkedlist: 'Character Sequence',
        hashmap: 'Word Frequency',
        trie: 'Autocomplete Trie',
        graph: 'Full Text Trie (Trie-2)',
        huffman: 'Huffman Coding Tree',
        versiontree: 'Version History Tree (DAG)',
        brackets: 'Bracket Matching'
    }
    document.getElementById('vizTitle').textContent = titles[ds]

    // Update controls and visualizer
    updateControls(ds)
    initializeVisualizer(ds)

    // Trigger update with current text
    if (textEditor) {
        const text = textEditor.getText()
        if (currentVisualizer && currentVisualizer.updateFromText) {
            currentVisualizer.updateFromText(text, textEditor)
        }
    }
}

function updateControls(ds) {
    const controlsDiv = document.getElementById('controls')

    const controlTemplates = {
        stack: `
      <div class="control-group">
        <label>Undo/Redo Controls</label>
        <div class="control-row">
          <button class="btn-primary" onclick="window.editorUndo()">⟲ Undo (Ctrl+Z)</button>
          <button class="btn-primary" onclick="window.editorRedo()">⟳ Redo (Ctrl+Y)</button>
        </div>
      </div>
    `,
        linkedlist: `
      <div class="control-group">
        <label>Character Navigation</label>
      </div>
    `,
        hashmap: `
      <div class="control-group">
        <label>Word Frequency Settings</label>
        <div class="control-row">
          <label style="margin: 0"><input type="checkbox" id="ignoreStopWords" /> Ignore common words</label>
        </div>
      </div>
    `,
        trie: `
      <div class="control-group">
        <label>Autocomplete</label>
      </div>
    `,
        gapbuffer: `
      <div class="control-group">
        <label>Gap Buffer Settings</label>
        <div class="control-row">
          <label style="margin: 0"><input type="checkbox" id="showGapDetails" checked /> Show gap details</label>
        </div>
      </div>
    `,
        huffman: `
      <div class="control-group">
        <label>Compression Info</label>
        <div class="control-row">
            <span style="font-size: 12px; color: #94a3b8;">Tree built from character frequency</span>
        </div>
      </div>
    `,
        versiontree: `
      <div class="control-group">
        <label>Version Navigation</label>
        <div class="control-row">
            <button class="btn-primary" onclick="window.editorUndo()">⟲ Undo (Ctrl+Z)</button>
            <button class="btn-primary" onclick="window.editorRedo()">⟳ Redo (Ctrl+Y)</button>
        </div>
        <div class="control-row">
            <button class="btn-primary" onclick="window.selectRedoChild()">Select Branch (Ctrl+Q)</button>
        </div>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">
            Click nodes to jump to versions
        </div>
      </div>
    `,
        brackets: `
      <div class="control-group">
        <label>Bracket Navigation</label>
        <div class="control-row">
            <button class="btn-primary" onclick="window.goToMatchingBracket()">Go to Matching (Ctrl+B)</button>
        </div>
      </div>
    `
    }

    controlsDiv.innerHTML = controlTemplates[ds] || ''

    // Setup event listeners for controls
    if (ds === 'hashmap') {
        const checkbox = document.getElementById('ignoreStopWords')
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                if (currentVisualizer && currentVisualizer.setIgnoreStopWords) {
                    currentVisualizer.setIgnoreStopWords(checkbox.checked)
                }
            })
        }
    }

    if (ds === 'gapbuffer') {
        const checkbox = document.getElementById('showGapDetails')
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                if (currentVisualizer && currentVisualizer.setShowGapDetails) {
                    currentVisualizer.setShowGapDetails(checkbox.checked)
                }
            })
        }
    }
}

function initializeVisualizer(ds) {
    const canvas = document.getElementById('visualizationCanvas')
    const ctx = canvas.getContext('2d')

    // Clean up previous visualizer
    if (currentVisualizer && currentVisualizer.destroy) {
        currentVisualizer.destroy()
    }

    switch (ds) {
        case 'stack':
            currentVisualizer = new StackVisualizer(canvas, ctx)
            break
        case 'linkedlist':
            currentVisualizer = new LinkedListVisualizer(canvas, ctx)
            break
        case 'hashmap':
            currentVisualizer = new HashMapVisualizer(canvas, ctx)
            break
        case 'trie':
            currentVisualizer = new TrieVisualizer(canvas, ctx)
            break
        case 'graph':
            currentVisualizer = new GraphVisualizer(canvas, ctx)
            break
        case 'huffman':
            currentVisualizer = new HuffmanVisualizer(canvas, ctx)
            break
        case 'versiontree':
            currentVisualizer = new TreeVisualizer(canvas, ctx)
            if (textEditor && textEditor.history) {
                currentVisualizer.updateFromHistory(textEditor.history)
            }
            break
        case 'brackets':
            currentVisualizer = new BracketVisualizer(canvas, ctx)
            break
    }

    currentVisualizer.draw()
}

function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('statusMessage')
    statusDiv.textContent = message
    statusDiv.className = `status-message show ${type}`

    setTimeout(() => {
        statusDiv.classList.remove('show')
    }, 2000)
}


function resetCurrentDS() {
    if (currentVisualizer && currentVisualizer.reset) {
        currentVisualizer.reset()
        showStatus('Reset complete', 'success')
    }
}

function updateComplexity(action) {
    if (!complexityViewer) return

    let complexity = 'O(1)'
    let operation = 'Operation'
    let description = 'Constant time operation'

    // Stack
    if (currentDS === 'stack') {
        if (action === 'insert' || action === 'redo') {
            complexity = 'O(1)'
            operation = 'Push'
            description = 'Adding to top of stack'
        } else if (action === 'undo') {
            complexity = 'O(1)'
            operation = 'Pop'
            description = 'Removing from top of stack'
        }
    }
    // Linked List
    else if (currentDS === 'linkedlist') {
        if (action === 'insert') {
            complexity = 'O(1)'
            operation = 'Append'
            description = 'Adding to end (with tail pointer)'
        } else if (action === 'search') {
            complexity = 'O(n)'
            operation = 'Traversal'
            description = 'Linear search through nodes'
        }
    }
    // Hash Map
    else if (currentDS === 'hashmap') {
        if (action === 'insert') {
            complexity = 'O(1)' // Amortized
            operation = 'Insert'
            description = 'Hashing key to index'
        } else if (action === 'search') {
            complexity = 'O(1)'
            operation = 'Lookup'
            description = 'Direct access via hash'
        }
    }
    // Trie
    else if (currentDS === 'trie') {
        if (action === 'insert' || action === 'search') {
            complexity = 'O(k)'
            operation = action === 'insert' ? 'Insert' : 'Search'
            description = 'Proportional to word length (k)'
        }
    }

    complexityViewer.update(complexity, operation, description)
}

// Text Editor operations
window.editorUndo = () => {
    if (textEditor) {
        textEditor.undo()
        showStatus('Undo', 'success')
    }
}

window.editorRedo = () => {
    if (textEditor) {
        textEditor.redo()
        showStatus('Redo', 'success')
    }
}

window.selectRedoChild = () => {
    if (textEditor) {
        textEditor.showRedoChildSelector()
    }
}

window.goToMatchingBracket = () => {
    if (textEditor) {
        textEditor.goToMatchingBracket()
    }
}

function showRedoChildSelector(children) {
    // Create a simple modal to select which branch to redo
    const message = children.map((child, i) => 
        `${i + 1}. ${child.content.substring(0, 50)}...`
    ).join('\n')
    
    const choice = prompt(`Multiple redo branches available:\n${message}\n\nEnter number (1-${children.length}):`, '1')
    if (choice) {
        const index = parseInt(choice) - 1
        textEditor.selectRedoChild(index)
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initApp)
