# Project Architecture & Detailed Explanation

This document provides a comprehensive overview of how the **DS Visualizer** project works. It is built as a Single Page Application (SPA) using **Vanilla JavaScript** and **Vite** for the build tooling.

## 1. High-Level Overview
The application is designed to visualize data structures in real-time as the user types into a text editor. It bridges the gap between abstract data structure concepts (like Stacks, Linked Lists, Tries) and practical text editing operations (Undo/Redo, Autocomplete).

**Key Flow:**
1.  User types into the **Text Editor**.
2.  The application captures the input events.
3.  The text data is passed to the active **Visualizer**.
4.  The **Visualizer** processes the meaningful data (e.g., pushes a state to a stack) and draws it on the HTML5 Canvas.

---

## 2. File Structure & Responsibilities

### `index.html`
The skeleton of the application. It divides the screen into two main panels:
*   **Editor Panel (Left)**: Contains the text input area (`#textEditor`) and file controls (Save, Open, Clear).
*   **Visualization Panel (Right)**: Contains the `<canvas id="visualizationCanvas">` where the data structures are drawn.
*   **Navigation**: Tabs at the top to switch between different data structures (Stack, Linked List, HashMap, etc.).

### `main.js`
The "brain" of the application. It orchestrates everything:
*   **Initialization**: Sets up the Text Editor, Canvas, and Event Listeners.
*   **Event Handling**: Listens for `change` events from the editor and updates the active visualizer.
*   **Routing**: Switches the active Data Structure when a tab is clicked (`switchDataStructure`).
*   **UI Controls**: Dynamically injects specific controls (like "Ignore Stop Words" for HashMap) based on the active view.

### `src/js/` (Core Logic)
This directory contains the actual JavaScript implementation that runs in the browser.

*   **`src/js/TextEditor.js`**:
    *   Manages the `contenteditable` div.
    *   Maintains the **Undo/Redo History** (essential for the Stack visualizer).
    *   Emits custom events (`change`, `predict`) that `main.js` listens to.

*   **`src/js/visualizers/`**:
    *   Contains a class for each data structure (e.g., `StackVisualizer.js`, `LinkedListVisualizer.js`).
    *   Each class implements a standard interface:
        *   `updateFromText(text, editorInstance)`: Recalculates the data structure state based on new text.
        *   `draw()`: Renders the state to the Canvas 2D context.

*   **`src/js/Predictor.js`**:
    *   A simple n-gram based predictor for autocomplete suggestion.
    *   Used by the Text Editor to show ghost text suggestions.

### `src/c/` (Reference Only)
*   Contains C implementations of the data structures (`stack.c`, `linkedlist.c`, etc.).
*   **Important**: These files are **NOT** executed by the browser. They serve as reference algorithms or educational material for how these structures are implemented in a lower-level language. The project logic is entirely JavaScript.

---

## 3. Deep Dive: How Visualization Works

### The Update Cycle
When you type a character:
1.  **`TextEditor`** updates its internal buffer and history.
2.  It fires a custom event: `textEditor.emit('change', newText)`.
3.  **`main.js`** catches this event.
4.  It calls `currentVisualizer.updateFromText(newText, textEditor)`.

### Example: Stack Visualization
*   The **Stack** represents the **Undo/Redo** functionality.
*   When `updateFromText` is called on the `StackVisualizer`:
    1.  It asks the `TextEditor` for its internal `undoStack` and `redoStack` arrays.
    2.  It takes these arrays (which contain snapshots of the text history).
    3.  It loops through them and draws a rectangle for each state on the canvas, stacking them visually.
    4.  The top of the stack represents the most recent state.

### Example: HashMap Visualization
*   Used for **Word Frequency**.
*   When updated:
    1.  It splits the entire text into words.
    2.  It counts the occurrence of each word (building a frequency map).
    3.  It visualizes this map, often as a list or a bar chart of top words.
    4.  It can filter out "stop words" (common words like "the", "is") if the checkbox control is active.

---

## 4. Technical Stack
*   **Vite**: The build tool. It provides a fast dev server (`npm run dev`) and bundles the modules for production.
*   **Canvas API**: Used for all the rendering. No external graphics libraries are used; it's raw 2D context drawing (`ctx.fillRect`, `ctx.fillText`).
*   **Modules**: The code uses ES6 Modules (`import`/`export`) to keep files organized and dependencies clear.
