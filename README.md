# Advanced Text Editor - Data Structures & Algorithms Lab Project

A comprehensive text editor application implemented in C that demonstrates the practical use of various data structures and algorithms. This project is designed for a Data Structures & Algorithms course lab assignment.

## Project Overview

This text editor implements a console-based application with 14 distinct features, each utilizing specific data structures to solve real-world text editing problems. The project emphasizes clarity, correctness, and educational value over GUI complexity.

### Key Highlights

- **14 Features** covering Basic, Intermediate, and Advanced functionality
- **6 Data Structures** demonstrated: Doubly Linked List, Stack, Queue, Trie, Deque, Linked List of Strings
- **Multiple Algorithms**: String matching, traversal, prefix matching, bracket matching
- **Modular Design**: Well-organized code with clear separation of concerns
- **Comprehensive Comments**: Each feature explains which data structure is used and why

## Data Structure Mapping Table

| Feature | Data Structure Used | Why This Structure? | Time Complexity |
|---------|-------------------|---------------------|----------------|
| **1. Insert/Delete Text** | Doubly Linked List | O(1) insertion/deletion at any position without shifting elements | O(1) |
| **2. Cursor Movement** | Doubly Linked List | Efficient bidirectional traversal (left/right/up/down) | O(1) per move |
| **3. Search Word** | Array + String Matching | Simple linear search algorithm for pattern matching | O(n*m) |
| **4. Word/Char Count** | Linear Traversal | Simple iteration through all nodes | O(n) |
| **5. Undo/Redo** | Two Stacks | LIFO property perfect for operation history | O(1) |
| **6. Copy/Cut/Paste** | Queue/Array | FIFO behavior for clipboard operations | O(k) where k=clipboard size |
| **7. Find & Replace** | String Algorithms | Efficient pattern matching and replacement | O(n*m) |
| **8. Line-wise Editing** | Linked List of Strings | Each line as separate structure for efficient line operations | O(1) per line |
| **9. Auto-save** | Queue | FIFO ensures oldest saves processed first | O(1) enqueue/dequeue |
| **10. Syntax Highlighting** | Hash Table (simulated) | Fast keyword lookup for highlighting | O(1) average lookup |
| **11. Spell Checker** | Trie | Efficient word lookup and prefix matching | O(m) where m=word length |
| **12. Bracket Matching** | Stack | LIFO matches opening/closing bracket pairs | O(n) |
| **13. Search Suggestions** | Trie | Prefix-based word suggestions | O(m + k) where k=suggestions |
| **14. Multiple File Tabs** | Deque | Efficient insertion/deletion at both ends | O(1) |

## Features Implementation

### BASIC FEATURES

#### 1. Insert and Delete Text
- **Data Structure**: Doubly Linked List
- **Implementation**: Each character stored as a node with prev/next pointers
- **Location**: `editor.c` - `insertChar()`, `deleteChar()`
- **Why**: O(1) insertion/deletion at any position without shifting elements

#### 2. Cursor Movement (Left, Right, Up, Down)
- **Data Structure**: Doubly Linked List
- **Implementation**: Traverse using prev/next pointers, handle newlines for up/down
- **Location**: `editor.c` - `moveCursorLeft()`, `moveCursorRight()`, `moveCursorUp()`, `moveCursorDown()`
- **Why**: Efficient bidirectional traversal

#### 3. Search for Word
- **Data Structure**: Array-based string matching
- **Algorithm**: Linear search with pattern matching
- **Location**: `editor.c` - `searchWord()`
- **Time Complexity**: O(n*m) where n=text length, m=word length

#### 4. Word Count and Character Count
- **Data Structure**: Simple traversal
- **Implementation**: Linear iteration through all nodes
- **Location**: `editor.c` - `getWordCount()`, `getCharCount()`
- **Time Complexity**: O(n)

### INTERMEDIATE FEATURES

#### 5. Undo and Redo Functionality
- **Data Structure**: Two Stacks (undoStack, redoStack)
- **Implementation**: LIFO - push operations on undo, pop to redo
- **Location**: `editor.c` - `undo()`, `redo()`
- **Why**: Stack's LIFO property perfectly matches operation history

#### 6. Copy, Cut, and Paste Operations
- **Data Structure**: Queue/Array (clipboard)
- **Implementation**: Store copied text in array, paste inserts at cursor
- **Location**: `editor.c` - `copyText()`, `cutText()`, `paste()`
- **Why**: Queue ensures FIFO behavior for clipboard operations

#### 7. Find and Replace
- **Data Structure**: String algorithms
- **Algorithm**: Pattern matching with replacement
- **Location**: `editor.c` - `findAndReplace()`
- **Time Complexity**: O(n*m)

#### 8. Line-wise Text Editing
- **Data Structure**: Linked List of Strings
- **Implementation**: Each line is a separate linked list structure
- **Location**: `editor.c` - `insertLine()`, `deleteLine()`
- **Why**: Efficient line operations without affecting other lines

### ADVANCED FEATURES

#### 9. Auto-save Functionality
- **Data Structure**: Queue
- **Implementation**: Enqueue save operations, process in FIFO order
- **Location**: `editor.c` - `autoSave()`, `processAutoSaveQueue()`
- **Why**: Queue ensures oldest saves processed first (FIFO)

#### 10. Basic Syntax Highlighting
- **Data Structure**: Hash Table (simulated with string comparison)
- **Implementation**: Keyword lookup and highlighting
- **Location**: `editor.c` - `highlightSyntax()`
- **Why**: Hash table provides O(1) average lookup for keywords

#### 11. Spell Checker
- **Data Structure**: Trie (Prefix Tree)
- **Implementation**: Dictionary stored in Trie, word lookup for checking
- **Location**: `editor.c` - `checkSpelling()`, `trie.c` - `searchWord()`
- **Why**: Trie provides O(m) search time where m=word length

#### 12. Bracket Matching
- **Data Structure**: Stack
- **Implementation**: Push opening brackets, pop on closing brackets
- **Location**: `editor.c` - `checkBracketMatching()`
- **Why**: Stack's LIFO matches bracket pairs perfectly

#### 13. Search Suggestions
- **Data Structure**: Trie
- **Implementation**: Prefix matching in Trie to find suggestions
- **Location**: `editor.c` - `getSearchSuggestions()`, `trie.c` - `getSuggestions()`
- **Why**: Trie efficiently finds all words with given prefix

#### 14. Multiple File Tabs
- **Data Structure**: Deque (Double-Ended Queue)
- **Implementation**: Each tab contains an editor instance
- **Location**: `deque.c` - Tab management functions
- **Why**: Deque allows efficient insertion/deletion at both ends

## File Structure

```
.
├── main.c          # Main program with menu interface
├── editor.h       # Editor header file
├── editor.c         # Editor implementation (all features)
├── stack.h          # Stack header file
├── stack.c          # Stack implementation (undo/redo, bracket matching)
├── queue.h          # Queue header file
├── queue.c          # Queue implementation (auto-save)
├── trie.h           # Trie header file
├── trie.c           # Trie implementation (spell checker, suggestions)
├── deque.h          # Deque header file
├── deque.c          # Deque implementation (multiple tabs)
├── Makefile         # Build configuration
└── README.md        # This file
```

## Compilation

### Using Makefile (Recommended)
```bash
make
```

### Manual Compilation
```bash
gcc -Wall -Wextra -std=c99 -o text_editor main.c editor.c stack.c queue.c trie.c deque.c
```

### Clean Build Files
```bash
make clean
```

## Running the Program

```bash
./text_editor
```

## Usage Guide

### Basic Features

1. **Insert Character**: Choose option 1, then enter a character
2. **Delete Character**: Choose option 2 to delete character at cursor
3. **Move Cursor**: Choose option 3, then select direction (left/right/up/down)
4. **Search Word**: Choose option 4, then enter word to search
5. **Word/Char Count**: Choose option 5 to see statistics

### Intermediate Features

6. **Undo**: Choose option 6 to undo last operation
7. **Redo**: Choose option 7 to redo last undone operation
8. **Copy**: Choose option 8, enter start and end positions
9. **Cut**: Choose option 9, enter start and end positions
10. **Paste**: Choose option 10 to paste copied text
11. **Find & Replace**: Choose option 11, enter find and replace strings
12. **Insert Line**: Choose option 12, enter line number and text
13. **Delete Line**: Choose option 13, enter line number

### Advanced Features

14. **Auto-save**: Choose option 14 to queue and process auto-save
15. **Syntax Highlighting**: Choose option 15 to highlight keywords
16. **Spell Checker**: Choose option 16 to check spelling of all words
17. **Bracket Matching**: Choose option 17 to verify bracket pairs
18. **Search Suggestions**: Choose option 18, enter prefix for suggestions
19. **Multiple Tabs**: Choose option 19 to manage multiple file tabs

### File Operations

20. **Load File**: Choose option 20, enter filename
21. **Save File**: Choose option 21, enter filename
22. **Display Text**: Choose option 22 to show current text

## Sample Input/Output

### Example Session

```
========== ADVANCED TEXT EDITOR ==========
Welcome to the Text Editor!

This editor demonstrates various Data Structures:
- Doubly Linked List: Text storage & cursor movement
- Stack: Undo/Redo & Bracket matching
- Queue: Auto-save operations
- Trie: Spell checker & Search suggestions
- Deque: Multiple file tabs
- Linked List of Strings: Line-wise editing
- Hash Table (simulated): Syntax highlighting
==========================================

Do you want to load a file? (y/n): n

--- Text Editor Content ---
|
--- End of Content ---
Characters: 0 | Words: 0 | Lines: 1

========== TEXT EDITOR MENU ==========
...
Enter your choice: 1
Enter character to insert: H
Character 'H' inserted.

Enter your choice: 1
Enter character to insert: e
Character 'e' inserted.

Enter your choice: 1
Enter character to insert: l
Character 'l' inserted.

Enter your choice: 1
Enter character to insert: l
Character 'l' inserted.

Enter your choice: 1
Enter character to insert: o
Character 'o' inserted.

--- Text Editor Content ---
Hello|
--- End of Content ---
Characters: 5 | Words: 1 | Lines: 1

Enter your choice: 4
Enter word to search: Hello
Word 'Hello' found at position(s): 0

Enter your choice: 5
--- Statistics ---
Character Count: 5
Word Count: 1
Line Count: 1
--- End of Statistics ---

Enter your choice: 16
--- Spell Check Results ---
No spelling errors found!
--- End of Spell Check ---

Enter your choice: 0
Exiting editor...
Thank you for using the Text Editor!
```

## Viva Questions & Answers

**Q: Which data structure is used for text storage and why?**
A: Doubly Linked List. Each character is stored as a node with pointers to previous and next nodes. This allows O(1) insertion and deletion at any position without shifting elements, which is crucial for efficient text editing.

**Q: How is undo/redo implemented?**
A: Using two Stack data structures (undoStack and redoStack). Each operation is pushed onto the undo stack. When undo is called, the operation is popped from undo stack and pushed to redo stack. The LIFO (Last In First Out) property of stacks perfectly matches the operation history.

**Q: Why use Trie for spell checker?**
A: Trie (Prefix Tree) provides O(m) search time where m is the word length, independent of dictionary size. It also enables efficient prefix matching for search suggestions. Each node represents a character, making it ideal for word-related operations.

**Q: How does bracket matching work?**
A: Using a Stack. Opening brackets (`, `[`, `{`) are pushed onto the stack. When a closing bracket is encountered, we pop from the stack and check if it matches. The LIFO property ensures the most recent opening bracket matches with the current closing bracket.

**Q: What is the time complexity of search?**
A: O(n*m) where n is the text length and m is the word length. We use linear search with pattern matching algorithm, comparing each position in text with the search word.

**Q: Why use Queue for auto-save?**
A: Queue's FIFO (First In First Out) property ensures that the oldest save operations are processed first, which is important for maintaining chronological order of auto-saves.

**Q: How are multiple tabs managed?**
A: Using a Deque (Double-Ended Queue). Each tab contains an editor instance. Deque allows efficient insertion and deletion at both ends, making it suitable for managing a collection of tabs where we might need to add/remove tabs from anywhere.

**Q: What data structure is used for line-wise editing?**
A: Linked List of Strings. Each line is represented as a separate linked list structure. This allows efficient line operations (insert/delete) without affecting other lines.

## Algorithm Details

### String Matching Algorithm
- **Type**: Linear Search with Pattern Matching
- **Time Complexity**: O(n*m)
- **Space Complexity**: O(n)
- **Implementation**: Convert linked list to array, then compare each position

### Bracket Matching Algorithm
- **Type**: Stack-based Matching
- **Time Complexity**: O(n)
- **Space Complexity**: O(n) worst case
- **Implementation**: Push opening brackets, pop and match on closing brackets

### Trie Operations
- **Insert**: O(m) where m = word length
- **Search**: O(m) where m = word length
- **Prefix Search**: O(m + k) where k = number of suggestions
- **Space Complexity**: O(ALPHABET_SIZE * N * M) where N = number of words, M = average word length

## Notes

- This is a comprehensive implementation suitable for academic purposes
- All data structures are implemented from scratch (no external libraries)
- Only standard C libraries: stdio.h, stdlib.h, string.h, ctype.h, time.h
- Terminal-based interface (no GUI)
- Code is well-commented explaining data structure choices
- Modular design allows easy extension

## Extensions & Future Work

Possible enhancements:
- Implement more efficient string matching (KMP, Boyer-Moore)
- Add more syntax highlighting rules
- Implement file history using Deque
- Add multi-level undo/redo
- Implement text formatting features
- Add regex search support

## Author

Created for Data Structures & Algorithms course lab project.

## License

Educational use only.
