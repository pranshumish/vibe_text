#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <time.h>
#include "editor.h"

// ========== INITIALIZATION ==========

// Initialize editor with empty doubly linked list
// DATA STRUCTURE: Doubly Linked List - uses sentinel nodes for easier implementation
void initEditor(Editor *e) {
    // Create sentinel head node
    e->head = (Node *)malloc(sizeof(Node));
    e->head->data = '\0';
    e->head->prev = NULL;
    
    // Create sentinel tail node
    e->tail = (Node *)malloc(sizeof(Node));
    e->tail->data = '\0';
    e->tail->next = NULL;
    
    // Link head and tail
    e->head->next = e->tail;
    e->tail->prev = e->head;
    
    // Cursor starts at head (before first character)
    e->cursor = e->head;
    e->length = 0;
    e->cursorRow = 0;
    e->cursorCol = 0;
    
    // Initialize line structure (Linked List of strings)
    e->lineHead = NULL;
    e->lineTail = NULL;
    e->currentLine = NULL;
    e->lineCount = 0;
    
    // Initialize undo and redo stacks
    initStack(&(e->undoStack));
    initStack(&(e->redoStack));
    
    // Initialize clipboard
    e->clipboard = NULL;
    e->clipboardSize = 0;
    
    // Initialize auto-save queue
    initQueue(&(e->autoSaveQueue));
    strcpy(e->autoSaveFile, "autosave.txt");
    
    // Initialize spell checker (Trie)
    initTrie(&(e->dictionary));
    loadDictionary(&(e->dictionary), "dictionary.txt");
    e->spellCheckEnabled = 1;
    
    // Initialize syntax highlighting
    e->syntaxHighlightEnabled = 0;
}

// ========== BASIC FEATURES ==========

// Insert character at cursor position
// DATA STRUCTURE: Doubly Linked List - O(1) insertion at any position
void insertChar(Editor *e, char c) {
    // Create new node
    Node *newNode = (Node *)malloc(sizeof(Node));
    newNode->data = c;
    
    // Insert after cursor (before cursor->next)
    newNode->next = e->cursor->next;
    newNode->prev = e->cursor;
    e->cursor->next->prev = newNode;
    e->cursor->next = newNode;
    
    // Move cursor forward
    e->cursor = newNode;
    e->length++;
    e->cursorCol++;
    
    // Clear redo stack when new operation is performed
    while (!isStackEmpty(&(e->redoStack))) {
        pop(&(e->redoStack));
    }
    
    // Push to undo stack
    UndoOperation op;
    op.operation = 'i';
    op.data = c;
    op.position = e->length - 1;
    push(&(e->undoStack), op);
}

// Delete character at cursor position
// DATA STRUCTURE: Doubly Linked List - O(1) deletion at any position
void deleteChar(Editor *e) {
    // Check if there's a character to delete
    if (e->cursor->next == e->tail) {
        printf("Nothing to delete at cursor position.\n");
        return;
    }
    
    Node *toDelete = e->cursor->next;
    char deletedChar = toDelete->data;
    
    // Clear redo stack
    while (!isStackEmpty(&(e->redoStack))) {
        pop(&(e->redoStack));
    }
    
    // Store in undo stack before deleting
    UndoOperation op;
    op.operation = 'd';
    op.data = deletedChar;
    op.position = e->length - 1;
    push(&(e->undoStack), op);
    
    // Remove node from list
    e->cursor->next = toDelete->next;
    toDelete->next->prev = e->cursor;
    free(toDelete);
    e->length--;
    
    if (e->cursorCol > 0) {
        e->cursorCol--;
    }
}

// Move cursor left
// DATA STRUCTURE: Doubly Linked List - O(1) traversal backward
void moveCursorLeft(Editor *e) {
    if (e->cursor != e->head) {
        e->cursor = e->cursor->prev;
        if (e->cursorCol > 0) {
            e->cursorCol--;
        }
    }
}

// Move cursor right
// DATA STRUCTURE: Doubly Linked List - O(1) traversal forward
void moveCursorRight(Editor *e) {
    if (e->cursor->next != e->tail) {
        e->cursor = e->cursor->next;
        e->cursorCol++;
    }
}

// Move cursor up (to previous line)
// DATA STRUCTURE: Doubly Linked List - traverses backward to find newline
void moveCursorUp(Editor *e) {
    if (e->cursorRow > 0) {
        // Find previous newline
        Node *temp = e->cursor;
        int newlinesFound = 0;
        
        while (temp != e->head && newlinesFound < 2) {
            if (temp->data == '\n') {
                newlinesFound++;
            }
            if (newlinesFound < 2) {
                temp = temp->prev;
            }
        }
        
        if (newlinesFound >= 1) {
            // Move to start of previous line
            while (temp != e->head && temp->data != '\n') {
                temp = temp->prev;
            }
            if (temp->data == '\n') {
                temp = temp->next;
            }
            e->cursor = temp;
            e->cursorRow--;
        }
    }
}

// Move cursor down (to next line)
// DATA STRUCTURE: Doubly Linked List - traverses forward to find newline
void moveCursorDown(Editor *e) {
    // Find next newline
    Node *temp = e->cursor;
    
    while (temp->next != e->tail && temp->data != '\n') {
        temp = temp->next;
    }
    
    if (temp->data == '\n' && temp->next != e->tail) {
        // Move to next line
        temp = temp->next;
        e->cursor = temp;
        e->cursorRow++;
        e->cursorCol = 0;
    }
}

// Search for a word using array-based string matching
// ALGORITHM: Linear search with string matching - O(n*m) where n=text length, m=word length
void searchWord(Editor *e, const char *word) {
    if (word == NULL || strlen(word) == 0) {
        printf("Invalid search word.\n");
        return;
    }
    
    int wordLen = strlen(word);
    int positions[100];
    int count = 0;
    
    // Convert doubly linked list to array for easier searching
    char *text = (char *)malloc((e->length + 1) * sizeof(char));
    Node *current = e->head->next;
    int i = 0;
    
    while (current != e->tail) {
        text[i++] = current->data;
        current = current->next;
    }
    text[i] = '\0';
    
    // Linear search algorithm
    for (i = 0; i <= e->length - wordLen; i++) {
        int match = 1;
        for (int j = 0; j < wordLen; j++) {
            if (tolower(text[i + j]) != tolower(word[j])) {
                match = 0;
                break;
            }
        }
        if (match) {
            positions[count++] = i;
        }
    }
    
    // Print results
    if (count == 0) {
        printf("Word '%s' not found.\n", word);
    } else {
        printf("Word '%s' found at position(s): ", word);
        for (i = 0; i < count && i < 20; i++) {
            printf("%d ", positions[i]);
        }
        if (count > 20) {
            printf("... (and %d more)", count - 20);
        }
        printf("\n");
    }
    
    free(text);
}

// Word count using simple traversal
// ALGORITHM: Linear traversal - O(n) where n=text length
int getWordCount(Editor *e) {
    int wordCount = 0;
    int inWord = 0;
    
    Node *current = e->head->next;
    while (current != e->tail) {
        if (isalnum(current->data)) {
            if (!inWord) {
                wordCount++;
                inWord = 1;
            }
        } else {
            inWord = 0;
        }
        current = current->next;
    }
    
    return wordCount;
}

// Character count using simple traversal
// ALGORITHM: Linear traversal - O(n) where n=text length
int getCharCount(Editor *e) {
    return e->length;
}

// Display text with cursor shown as '|'
void displayText(Editor *e) {
    printf("\n--- Text Editor Content ---\n");
    Node *current = e->head->next;
    Node *cursorPos = e->cursor;
    
    while (current != e->tail) {
        // Show cursor before this character if cursor is at previous position
        if (current->prev == cursorPos) {
            printf("|");
        }
        printf("%c", current->data);
        current = current->next;
    }
    
    // Show cursor at end if cursor is at tail
    if (e->cursor->next == e->tail) {
        printf("|");
    }
    
    printf("\n--- End of Content ---\n");
    printf("Characters: %d | Words: %d | Lines: %d\n\n", getCharCount(e), getWordCount(e), e->lineCount + 1);
}

// ========== INTERMEDIATE FEATURES ==========

// Undo last operation using stack
// DATA STRUCTURE: Stack - LIFO (Last In First Out) for undo operations
void undo(Editor *e) {
    if (isStackEmpty(&(e->undoStack))) {
        printf("Nothing to undo.\n");
        return;
    }
    
    UndoOperation op = pop(&(e->undoStack));
    
    // Push to redo stack
    push(&(e->redoStack), op);
    
    if (op.operation == 'i') {
        // Undo insert: delete the character
        if (e->cursor != e->head && e->cursor->data == op.data) {
            Node *toDelete = e->cursor;
            e->cursor = e->cursor->prev;
            toDelete->prev->next = toDelete->next;
            toDelete->next->prev = toDelete->prev;
            free(toDelete);
            e->length--;
            if (e->cursorCol > 0) {
                e->cursorCol--;
            }
        } else if (e->cursor->next != e->tail) {
                Node *toDelete = e->cursor->next;
                e->cursor->next = toDelete->next;
                toDelete->next->prev = e->cursor;
                free(toDelete);
                e->length--;
        }
        printf("Undone: Insert operation\n");
    } else if (op.operation == 'd') {
        // Undo delete: insert the character back
        Node *newNode = (Node *)malloc(sizeof(Node));
        newNode->data = op.data;
        newNode->next = e->cursor->next;
        newNode->prev = e->cursor;
        e->cursor->next->prev = newNode;
        e->cursor->next = newNode;
        e->cursor = newNode;
        e->length++;
        e->cursorCol++;
        printf("Undone: Delete operation\n");
    }
}

// Redo last undone operation
// DATA STRUCTURE: Stack - LIFO for redo operations
void redo(Editor *e) {
    if (isStackEmpty(&(e->redoStack))) {
        printf("Nothing to redo.\n");
        return;
    }
    
    UndoOperation op = pop(&(e->redoStack));
    
    // Push back to undo stack
    push(&(e->undoStack), op);
    
    if (op.operation == 'i') {
        // Redo insert
        insertChar(e, op.data);
        // Remove the duplicate undo entry
        if (!isStackEmpty(&(e->undoStack))) {
            pop(&(e->undoStack));
        }
        printf("Redone: Insert operation\n");
    } else if (op.operation == 'd') {
        // Redo delete
        if (e->cursor->next != e->tail) {
            Node *toDelete = e->cursor->next;
            e->cursor->next = toDelete->next;
            toDelete->next->prev = e->cursor;
            free(toDelete);
            e->length--;
        }
        printf("Redone: Delete operation\n");
    }
}

// Copy text from position start to end
// DATA STRUCTURE: Queue/Array - stores copied text in clipboard
void copyText(Editor *e, int start, int end) {
    if (start < 0 || end >= e->length || start > end) {
        printf("Invalid range for copy.\n");
        return;
    }
    
    // Free existing clipboard
    if (e->clipboard != NULL) {
        free(e->clipboard);
    }
    
    int len = end - start + 1;
    e->clipboard = (char *)malloc((len + 1) * sizeof(char));
    e->clipboardSize = len;
    
    // Traverse to start position
    Node *current = e->head->next;
    for (int i = 0; i < start && current != e->tail; i++) {
        current = current->next;
    }
    
    // Copy characters
    for (int i = 0; i < len && current != e->tail; i++) {
        e->clipboard[i] = current->data;
        current = current->next;
    }
    e->clipboard[len] = '\0';
    
    printf("Copied %d characters.\n", len);
}

// Cut text (copy and delete)
// DATA STRUCTURE: Queue/Array - uses clipboard for cut operation
void cutText(Editor *e, int start, int end) {
    copyText(e, start, end);
    
    // Delete the copied text
    // Move cursor to start position
    Node *current = e->head->next;
    for (int i = 0; i < start && current != e->tail; i++) {
        current = current->next;
    }
    e->cursor = current->prev;
    
    // Delete characters
    for (int i = 0; i < e->clipboardSize; i++) {
        if (e->cursor->next != e->tail) {
            deleteChar(e);
        }
    }
    
    printf("Cut %d characters.\n", e->clipboardSize);
}

// Paste copied text at cursor position
void paste(Editor *e) {
    if (e->clipboard == NULL || e->clipboardSize == 0) {
        printf("Clipboard is empty. Nothing to paste.\n");
        return;
    }
    
    // Insert each character from clipboard
    for (int i = 0; i < e->clipboardSize; i++) {
        insertChar(e, e->clipboard[i]);
        // Remove undo entry for each insert (we'll add one at end)
        if (!isStackEmpty(&(e->undoStack))) {
            pop(&(e->undoStack));
        }
    }
    
    // Add single undo entry for paste operation
    UndoOperation op;
    op.operation = 'p';  // Paste operation
    op.data = '\0';
    op.position = e->length;
    push(&(e->undoStack), op);
    
    printf("Pasted %d characters.\n", e->clipboardSize);
}

// Find and Replace using string algorithms
// ALGORITHM: String matching and replacement - O(n*m) where n=text length, m=pattern length
void findAndReplace(Editor *e, const char *find, const char *replace) {
    if (find == NULL || replace == NULL || strlen(find) == 0) {
        printf("Invalid find/replace strings.\n");
        return;
    }
    
    // Convert text to array for easier manipulation
    char *text = (char *)malloc((e->length + 1) * sizeof(char));
    Node *current = e->head->next;
    int i = 0;
    
    while (current != e->tail) {
        text[i++] = current->data;
        current = current->next;
    }
    text[i] = '\0';
    
    int findLen = strlen(find);
    int replaceLen = strlen(replace);
    int count = 0;
    
    // Find all occurrences
    for (i = 0; i <= e->length - findLen; i++) {
        int match = 1;
        for (int j = 0; j < findLen; j++) {
            if (tolower(text[i + j]) != tolower(find[j])) {
                match = 0;
                break;
            }
        }
        if (match) {
            count++;
        }
    }
    
    if (count == 0) {
        printf("No occurrences of '%s' found.\n", find);
        free(text);
        return;
    }
    
    // Clear editor and rebuild with replacements
    // Free all nodes
    current = e->head->next;
    while (current != e->tail) {
        Node *temp = current;
        current = current->next;
        free(temp);
    }
    e->head->next = e->tail;
    e->tail->prev = e->head;
    e->cursor = e->head;
    e->length = 0;
    
    // Rebuild with replacements
    size_t textLen = strlen(text);
    i = 0;
    while (i < (int)textLen) {
        int match = 1;
        if (i <= (int)textLen - findLen) {
            for (int j = 0; j < findLen; j++) {
                if (tolower(text[i + j]) != tolower(find[j])) {
                    match = 0;
                    break;
                }
            }
        } else {
            match = 0;
        }
        
        if (match) {
            // Insert replacement string
            for (int k = 0; k < replaceLen; k++) {
                insertChar(e, replace[k]);
                if (!isStackEmpty(&(e->undoStack))) {
                    pop(&(e->undoStack));
                }
            }
            i += findLen;
        } else {
            // Insert original character
            insertChar(e, text[i]);
            if (!isStackEmpty(&(e->undoStack))) {
                pop(&(e->undoStack));
            }
            i++;
        }
    }
    
    printf("Replaced %d occurrence(s) of '%s' with '%s'.\n", count, find, replace);
    free(text);
}

// Insert line at specified line number
// DATA STRUCTURE: Linked List of strings - each line is a separate linked list
void insertLine(Editor *e, int lineNum __attribute__((unused)), const char *text) {
    // For simplicity, we'll insert text with newline at cursor position
    // In a full implementation, this would manage line structures separately
    if (text == NULL) {
        return;
    }
    
    for (int i = 0; text[i] != '\0'; i++) {
        insertChar(e, text[i]);
        if (!isStackEmpty(&(e->undoStack))) {
            pop(&(e->undoStack));
        }
    }
    insertChar(e, '\n');
    if (!isStackEmpty(&(e->undoStack))) {
        pop(&(e->undoStack));
    }
    e->lineCount++;
    
    printf("Line inserted.\n");
}

// Delete line at specified line number
// DATA STRUCTURE: Linked List of strings
void deleteLine(Editor *e, int lineNum __attribute__((unused))) {
    // Find the line and delete it
    // Simplified implementation: delete from cursor to next newline
    Node *end = e->cursor->next;
    
    while (end != e->tail && end->data != '\n') {
        end = end->next;
    }
    
    // Delete all characters from cursor to end of line
    while (e->cursor->next != e->tail && e->cursor->next->data != '\n') {
        deleteChar(e);
    }
    
    // Delete the newline too
    if (e->cursor->next != e->tail && e->cursor->next->data == '\n') {
        deleteChar(e);
    }
    
    e->lineCount--;
    printf("Line deleted.\n");
}

// ========== ADVANCED FEATURES ==========

// Auto-save functionality using Queue
// DATA STRUCTURE: Queue - FIFO (First In First Out) for auto-save operations
void autoSave(Editor *e) {
    // Convert text to string
    char *content = (char *)malloc((e->length + 1) * sizeof(char));
    Node *current = e->head->next;
    int i = 0;
    
    while (current != e->tail) {
        content[i++] = current->data;
        current = current->next;
    }
    content[i] = '\0';
    
    // Create auto-save operation
    AutoSaveOperation op;
    op.content = content;
    op.contentLength = e->length;
    strcpy(op.filename, e->autoSaveFile);
    
    // Enqueue the operation
    enqueue(&(e->autoSaveQueue), op);
    
    free(content);
    printf("Auto-save operation queued.\n");
}

// Process auto-save queue
void processAutoSaveQueue(Editor *e) {
    int count = 0;
    while (!isQueueEmpty(&(e->autoSaveQueue))) {
        AutoSaveOperation op = dequeue(&(e->autoSaveQueue));
        
        FILE *file = fopen(op.filename, "w");
        if (file != NULL) {
            fprintf(file, "%s", op.content);
            fclose(file);
            count++;
        }
        
        if (op.content != NULL) {
            free(op.content);
        }
    }
    
    if (count > 0) {
        printf("Processed %d auto-save operation(s).\n", count);
    }
}

// Basic syntax highlighting using Hash table simulation
// DATA STRUCTURE: Hash table (simulated with string comparison)
void highlightSyntax(Editor *e) {
    if (!e->syntaxHighlightEnabled) {
        printf("Syntax highlighting is disabled.\n");
        return;
    }
    
    // Keywords for syntax highlighting (simulating hash table lookup)
    const char *keywords[] = {
        "if", "else", "for", "while", "int", "char", "void", "return",
        "include", "define", "struct", "typedef", "const", "static"
    };
    int keywordCount = sizeof(keywords) / sizeof(keywords[0]);
    
    // Convert text to array
    char *text = (char *)malloc((e->length + 1) * sizeof(char));
    Node *current = e->head->next;
    int i = 0;
    
    while (current != e->tail) {
        text[i++] = current->data;
        current = current->next;
    }
    text[i] = '\0';
    
    printf("\n--- Syntax Highlighted Text ---\n");
    // Simple highlighting: just identify keywords
    int highlighted = 0;
    size_t textLen = strlen(text);
    for (i = 0; i < (int)textLen; i++) {
        // Check if current position starts a keyword
        int isKeyword = 0;
        for (int k = 0; k < keywordCount; k++) {
            int len = (int)strlen(keywords[k]);
            if (i + len <= (int)textLen) {
                int match = 1;
                for (int j = 0; j < len; j++) {
                    if (tolower(text[i + j]) != tolower(keywords[k][j])) {
                        match = 0;
                        break;
                    }
                }
                if (match && (i == 0 || !isalnum(text[i-1])) && 
                    (i + len >= (int)textLen || !isalnum(text[i + len]))) {
                    printf("[KEYWORD:%s]", keywords[k]);
                    i += len - 1;
                    isKeyword = 1;
                    highlighted++;
                    break;
                }
            }
        }
        if (!isKeyword) {
            printf("%c", text[i]);
        }
    }
    printf("\n--- End of Highlighted Text ---\n");
    printf("Highlighted %d keyword(s).\n\n", highlighted);
    
    free(text);
}

// Spell checker using Trie
// DATA STRUCTURE: Trie (Prefix Tree) - O(m) search time where m=word length
void checkSpelling(Editor *e) {
    if (!e->spellCheckEnabled) {
        printf("Spell checking is disabled.\n");
        return;
    }
    
    // Extract words from text
    char *text = (char *)malloc((e->length + 1) * sizeof(char));
    Node *current = e->head->next;
    int i = 0;
    
    while (current != e->tail) {
        text[i++] = current->data;
        current = current->next;
    }
    text[i] = '\0';
    
    // Extract and check each word
    char word[100];
    int wordStart = -1;
    int misspelledCount = 0;
    
    printf("\n--- Spell Check Results ---\n");
    for (i = 0; i <= e->length; i++) {
        if (i < e->length && isalnum(text[i])) {
            if (wordStart == -1) {
                wordStart = i;
            }
        } else {
            if (wordStart != -1) {
                // Extract word
                int wordLen = i - wordStart;
                strncpy(word, text + wordStart, wordLen);
                word[wordLen] = '\0';
                
                // Check spelling using Trie
                if (!searchWordInTrie(&(e->dictionary), word)) {
                    printf("Misspelled: '%s' at position %d\n", word, wordStart);
                    misspelledCount++;
                }
                
                wordStart = -1;
            }
        }
    }
    
    if (misspelledCount == 0) {
        printf("No spelling errors found!\n");
    } else {
        printf("Found %d misspelled word(s).\n", misspelledCount);
    }
    printf("--- End of Spell Check ---\n\n");
    
    free(text);
}

// Bracket matching using Stack
// DATA STRUCTURE: Stack - LIFO for matching opening and clo
int checkBracketMatching(Editor *e) {
    Stack bracketStack;
    initStack(&bracketStack);
    
    Node *current = e->head->next;
    int errors = 0;
    
    while (current != e->tail) {
        char c = current->data;
        
        // Push opening brackets
        if (c == '(' || c == '[' || c == '{') {
            UndoOperation op;
            op.operation = c;
            op.data = c;
            op.position = 0;
            push(&bracketStack, op);
        }
        // Check closing brackets
        else if (c == ')' || c == ']' || c == '}') {
            if (isStackEmpty(&bracketStack)) {
                printf("Error: Unmatched closing bracket '%c'\n", c);
                errors++;
            } else {
                UndoOperation op = pop(&bracketStack);
                char expected = (c == ')') ? '(' : (c == ']') ? '[' : '{';
                if (op.operation != expected) {
                    printf("Error: Mismatched brackets. Expected '%c', found '%c'\n", expected, op.operation);
                    errors++;
                }
            }
        }
        
        current = current->next;
    }
    
    // Check for unmatched opening brackets
    while (!isStackEmpty(&bracketStack)) {
        UndoOperation op = pop(&bracketStack);
        printf("Error: Unmatched opening bracket '%c'\n", op.operation);
        errors++;
    }
    
    if (errors == 0) {
        printf("All brackets are properly matched!\n");
        return 1;
    } else {
        printf("Found %d bracket error(s).\n", errors);
        return 0;
    }
}

// Search suggestions using Trie
// DATA STRUCTURE: Trie - provides prefix-based suggestions
void getSearchSuggestions(Editor *e, const char *prefix) {
    if (prefix == NULL || strlen(prefix) == 0) {
        printf("Invalid prefix.\n");
        return;
    }
    
    char suggestions[10][50];
    int count = 0;
    
    getSuggestions(&(e->dictionary), prefix, suggestions, &count);
    
    if (count == 0) {
        printf("No suggestions found for '%s'.\n", prefix);
    } else {
        printf("Suggestions for '%s':\n", prefix);
        for (int i = 0; i < count; i++) {
            printf("  %d. %s\n", i + 1, suggestions[i]);
        }
    }
}

// ========== FILE OPERATIONS ==========

// Load text from file
void loadFile(Editor *e, const char *filename) {
    FILE *file = fopen(filename, "r");
    if (file == NULL) {
        printf("Error: Cannot open file '%s'\n", filename);
        return;
    }
    
    // Clear existing content
    Node *current = e->head->next;
    while (current != e->tail) {
        Node *temp = current;
        current = current->next;
        free(temp);
    }
    e->head->next = e->tail;
    e->tail->prev = e->head;
    e->cursor = e->head;
    e->length = 0;
    e->lineCount = 0;
    
    // Read file character by character
    int c;
    while ((c = fgetc(file)) != EOF) {
        insertChar(e, (char)c);
        // Remove undo entries for file loading
        if (!isStackEmpty(&(e->undoStack))) {
            pop(&(e->undoStack));
        }
        if (c == '\n') {
            e->lineCount++;
        }
    }
    
    fclose(file);
    printf("File '%s' loaded successfully.\n", filename);
}

// Save text to file
void saveFile(Editor *e, const char *filename) {
    FILE *file = fopen(filename, "w");
    if (file == NULL) {
        printf("Error: Cannot create file '%s'\n", filename);
        return;
    }
    
    // Write all characters to file
    Node *current = e->head->next;
    while (current != e->tail) {
        fputc(current->data, file);
        current = current->next;
    }
    
    fclose(file);
    printf("File '%s' saved successfully.\n", filename);
}

// Free all memory
void freeEditor(Editor *e) {
    // Free all nodes
    Node *current = e->head->next;
    while (current != e->tail) {
        Node *temp = current;
        current = current->next;
        free(temp);
    }
    
    // Free sentinel nodes
    free(e->head);
    free(e->tail);
    
    // Free clipboard
    if (e->clipboard != NULL) {
        free(e->clipboard);
    }
    
    // Free trie
    freeTrie(&(e->dictionary));
    
    // Process and free auto-save queue
    processAutoSaveQueue(e);
}
