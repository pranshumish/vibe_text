#ifndef EDITOR_H
#define EDITOR_H

#include "stack.h"
#include "queue.h"
#include "trie.h"

// Doubly Linked List Node for storing characters
// Each node stores one character and pointers to previous and next nodes
// DATA STRUCTURE: Doubly Linked List - allows efficient insertion/deletion at any position
typedef struct Node {
    char data;           // Character stored in this node
    struct Node *prev;   // Pointer to previous node
    struct Node *next;   // Pointer to next node
} Node;

// Line structure for line-wise editing
// DATA STRUCTURE: Linked List of strings - each line is a linked list of characters
typedef struct Line {
    Node *head;          // Head of character list for this line
    Node *tail;          // Tail of character list for this line
    int length;          // Length of this line
    struct Line *next;   // Pointer to next line
    struct Line *prev;   // Pointer to previous line
} Line;

// Editor structure
typedef struct {
    // Text storage using Doubly Linked List
    Node *head;          // Pointer to first node (sentinel)
    Node *tail;          // Pointer to last node (sentinel)
    Node *cursor;        // Pointer to node before cursor position
    
    // Line-wise structure (Linked List of lines)
    Line *lineHead;      // Head of line list
    Line *lineTail;      // Tail of line list
    Line *currentLine;   // Current line cursor is on
    int lineCount;       // Number of lines
    
    int length;          // Total number of characters
    int cursorRow;       // Cursor row (line number)
    int cursorCol;       // Cursor column (position in line)
    
    // Undo/Redo using two Stacks
    Stack undoStack;     // Stack for undo operations
    Stack redoStack;     // Stack for redo operations
    
    // Clipboard for copy/cut/paste (Queue-based)
    char *clipboard;     // Clipboard for copy/paste
    int clipboardSize;   // Size of clipboard
    
    // Auto-save queue
    Queue autoSaveQueue; // Queue for auto-save operations
    char autoSaveFile[256]; // Auto-save filename
    
    // Spell checker and suggestions
    Trie dictionary;     // Trie for spell checking
    int spellCheckEnabled; // Flag for spell check
    
    // Syntax highlighting (using Hash table simulation)
    int syntaxHighlightEnabled; // Flag for syntax highlighting
} Editor;

// Function declarations

// ========== BASIC FEATURES ==========

// Initialize editor
void initEditor(Editor *e);

// Insert character at cursor position (Doubly Linked List insertion)
void insertChar(Editor *e, char c);

// Delete character at cursor position (Doubly Linked List deletion)
void deleteChar(Editor *e);

// Move cursor left (Doubly Linked List traversal)
void moveCursorLeft(Editor *e);

// Move cursor right (Doubly Linked List traversal)
void moveCursorUp(Editor *e);

// Move cursor down (Doubly Linked List traversal)
void moveCursorDown(Editor *e);

// Move cursor right (Doubly Linked List traversal)
void moveCursorRight(Editor *e);

// Search for a word using array-based string matching
void searchWord(Editor *e, const char *word);

// Word count using simple traversal
int getWordCount(Editor *e);

// Character count using simple traversal
int getCharCount(Editor *e);

// Display text with cursor
void displayText(Editor *e);

// ========== INTERMEDIATE FEATURES ==========

// Undo last operation (Stack pop)
void undo(Editor *e);

// Redo last undone operation (Stack pop from redo stack)
void redo(Editor *e);

// Copy text (Queue-based clipboard)
void copyText(Editor *e, int start, int end);

// Cut text (Queue-based clipboard)
void cutText(Editor *e, int start, int end);

// Paste copied text at cursor position
void paste(Editor *e);

// Find and Replace using string algorithms
void findAndReplace(Editor *e, const char *find, const char *replace);

// Insert line (Linked List of strings)
void insertLine(Editor *e, int lineNum, const char *text);

// Delete line (Linked List of strings)
void deleteLine(Editor *e, int lineNum);

// ========== ADVANCED FEATURES ==========

// Auto-save functionality using Queue
void autoSave(Editor *e);

// Process auto-save queue
void processAutoSaveQueue(Editor *e);

// Basic syntax highlighting using Hash table simulation
void highlightSyntax(Editor *e);

// Spell checker using Trie
void checkSpelling(Editor *e);

// Bracket matching using Stack
int checkBracketMatching(Editor *e);

// Search suggestions using Trie
void getSearchSuggestions(Editor *e, const char *prefix);

// Load text from file
void loadFile(Editor *e, const char *filename);

// Save text to file
void saveFile(Editor *e, const char *filename);

// Free all memory
void freeEditor(Editor *e);

#endif

