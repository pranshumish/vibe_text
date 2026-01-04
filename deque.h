#ifndef DEQUE_H
#define DEQUE_H

#include "editor.h"

// Deque (Double-Ended Queue) data structure for MULTIPLE FILE TABS
// Allows insertion and deletion from both ends

#define MAX_TABS 10

// Tab structure - each tab contains an editor instance
typedef struct {
    Editor editor;        // Editor instance for this tab
    char filename[256];   // Filename associated with this tab
    int isActive;         // 1 if tab is active, 0 otherwise
} Tab;

// Deque structure for managing tabs
typedef struct {
    Tab tabs[MAX_TABS];   // Array of tabs
    int front;            // Front index
    int rear;             // Rear index
    int count;            // Number of active tabs
    int currentTab;       // Index of currently active tab
} TabDeque;

// Function declarations
void initTabDeque(TabDeque *dq);
int addTab(TabDeque *dq, const char *filename);
int removeTab(TabDeque *dq, int tabIndex);
void switchTab(TabDeque *dq, int tabIndex);
int getCurrentTabIndex(TabDeque *dq);
Editor* getCurrentEditor(TabDeque *dq);
void displayTabs(TabDeque *dq);
void freeTabDeque(TabDeque *dq);

#endif

