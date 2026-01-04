#ifndef STACK_H
#define STACK_H

// Stack data structure for UNDO functionality
// Uses a simple array-based stack implementation

#define MAX_STACK_SIZE 100

// Structure to store undo operation information
typedef struct {
    char operation;  // 'i' for insert, 'd' for delete
    char data;       // Character that was inserted/deleted
    int position;    // Position where operation occurred
} UndoOperation;

// Stack structure
typedef struct {
    UndoOperation items[MAX_STACK_SIZE];
    int top;  // Index of top element
} Stack;

// Function declarations
void initStack(Stack *s);
int isStackEmpty(Stack *s);
int isStackFull(Stack *s);
void push(Stack *s, UndoOperation op);
UndoOperation pop(Stack *s);

#endif

