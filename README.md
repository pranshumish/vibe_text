# 📚 Data Structures Visualizer

A modern, interactive web-based text editor with real-time data structure visualizations. This educational tool helps users understand how various data structures work by visualizing their behavior as you type and interact with the editor.

![Data Structures Visualizer](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Vite](https://img.shields.io/badge/vite-7.2.4-646cff)

## ✨ Features

### 📝 Text Editor
- **Rich Text Editing**: Contenteditable text area with real-time updates
- **Undo/Redo**: Full undo/redo support visualized as stack operations
- **Smart Cursor Management**: Efficient cursor positioning and tracking
- **Text Prediction**: N-gram (Markov Chain) based word prediction
- **File Operations**: Save and load text files
- **Live Statistics**: Real-time character, word, and line counting
- **Word Search**: HashMap-based word finding functionality

### 🎨 Data Structure Visualizations

#### 1. **Stack Visualization**
- Visualizes undo/redo operations
- Shows push/pop operations in real-time
- Demonstrates LIFO (Last In, First Out) principle

#### 2. **Linked List Visualization**
- Displays text as a linked list of character chunks
- Shows node connections and traversal
- Demonstrates dynamic memory allocation concepts

#### 3. **Hash Map Visualization**
- Visualizes word frequency distribution
- Shows hash collisions and bucket organization
- Demonstrates O(1) average lookup time

#### 4. **Trie Visualization**
- Interactive dictionary word tree
- Supports search, insert, and delete operations
- Visualizes prefix-based word matching
- Loads dictionary from text file

#### 5. **Graph Visualization** (Trie-2)
- Represents unique words as graph nodes
- Shows word relationships and connections
- Demonstrates graph traversal concepts

#### 6. **Huffman Coding Visualization**
- Text compression algorithm demonstration
- Shows character frequency analysis
- Visualizes Huffman tree construction

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher recommended)
- **npm** (Node Package Manager)

### Installation

1. Clone or download the project:
   ```bash
   cd /path/to/dsa_proj
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:
```bash
npm run dev
```

This will start the Vite development server, typically at `http://localhost:5173`. Open this URL in your browser to view the application.

### Building for Production

To create a production-optimized build:
```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

To preview the production build locally:
```bash
npm run preview
```

## 📂 Project Structure

```
dsa_proj/
├── index.html              # Main HTML entry point
├── main.js                 # Application entry point
├── style.css               # Main stylesheet
├── package.json            # Project dependencies
├── public/                 # Static assets
│   └── dictionary.txt      # Dictionary file for Trie operations
├── src/
│   ├── js/                 # JavaScript source code
│   │   ├── TextEditor.js   # Core text editor logic
│   │   ├── Predictor.js    # N-gram text prediction model
│   │   ├── utils.js        # Utility functions
│   │   └── visualizers/    # Data structure visualizers
│   │       ├── StackVisualizer.js
│   │       ├── LinkedListVisualizer.js
│   │       ├── HashMapVisualizer.js
│   │       ├── TrieVisualizer.js
│   │       ├── GraphVisualizer.js
│   │       ├── HuffmanVisualizer.js
│   │       └── GapBufferVisualizer.js
│   └── c/                  # C implementations (for reference/WASM)
│       ├── trie.c
│       ├── stack.c
│       ├── linkedlist.c
│       ├── hashmap.c
│       └── graph.c
└── dist/                   # Production build output (generated)
```

## 🛠️ Technology Stack

- **Frontend Framework**: Vanilla JavaScript (ES6 Modules)
- **Build Tool**: Vite 7.2.4
- **Visualization**: HTML5 Canvas API
- **Styling**: CSS3 with Google Fonts (Inter)
- **Text Prediction**: N-gram (Markov Chain) model
- **Dictionary**: Plain text file with ~370,000+ words

## 💡 How It Works

1. **Modular Architecture**: The application uses a modular event-driven architecture where the text editor emits events that update visualizers in real-time.

2. **Text Editor Core**: The `TextEditor` class manages all text operations and emits events for:
   - Text changes
   - Undo/Redo operations
   - Cursor movements
   - Prediction requests

3. **Visualizers**: Each data structure has its own visualizer that:
   - Listens to text editor events
   - Updates its internal state
   - Renders the visualization on HTML5 Canvas

4. **Prediction System**: The `Predictor` uses an N-gram model to analyze text patterns and suggest next words based on context.

5. **Dictionary Integration**: A comprehensive dictionary file is loaded for Trie operations, enabling fast prefix-based word lookups.

## 🎯 Use Cases

- **Educational Tool**: Perfect for computer science students learning data structures
- **Interview Preparation**: Visualize how different data structures operate
- **Teaching Aid**: Instructors can use it to demonstrate data structure concepts
- **Self-Learning**: Interactive exploration of data structure implementations

## 🔧 Development

### Adding New Visualizers

1. Create a new file in `src/js/visualizers/`
2. Implement the visualizer class with required methods:
   - `constructor(canvas)`
   - `update(editorState)`
   - `reset()`
   - `getControls()` (for custom UI controls)

3. Import and register in `main.js`

### Code Structure

- **Event-Driven**: All components communicate via custom events
- **Canvas Rendering**: All visualizations use HTML5 Canvas for performance
- **Debouncing**: Heavy operations are debounced to maintain smooth UI

## 🌟 Future Enhancements

- [ ] WebAssembly integration for C implementations
- [ ] Additional data structures (AVL Tree, B-Tree, etc.)
- [ ] Dark/Light theme toggle
- [ ] Export visualizations as images/GIFs
- [ ] Code syntax highlighting
- [ ] Collaborative editing
- [ ] More advanced text prediction algorithms

## 📝 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📧 Contact

For questions or feedback, please open an issue in the project repository.

---

**Made with ❤️ for learning Data Structures**
