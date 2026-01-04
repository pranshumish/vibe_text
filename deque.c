#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "deque.h"

// Initialize the tab deque
void initTabDeque(TabDeque *dq) {
    dq->front = 0;
    dq->rear = -1;
    dq->count = 0;
    dq->currentTab = -1;
    
    // Initialize all tabs
    for (int i = 0; i < MAX_TABS; i++) {
        dq->tabs[i].isActive = 0;
        strcpy(dq->tabs[i].filename, "");
    }
}

// Add a new tab
int addTab(TabDeque *dq, const char *filename) {
    if (dq->count >= MAX_TABS) {
        printf("Maximum number of tabs reached (%d).\n", MAX_TABS);
        return -1;
    }
    
    // Find first inactive tab slot
    int tabIndex = -1;
    for (int i = 0; i < MAX_TABS; i++) {
        if (!dq->tabs[i].isActive) {
            tabIndex = i;
            break;
        }
    }
    
    if (tabIndex == -1) {
        return -1;
    }
    
    // Initialize editor for this tab
    initEditor(&(dq->tabs[tabIndex].editor));
    strcpy(dq->tabs[tabIndex].filename, filename);
    dq->tabs[tabIndex].isActive = 1;
    
    dq->count++;
    dq->currentTab = tabIndex;
    
    return tabIndex;
}

// Remove a tab
int removeTab(TabDeque *dq, int tabIndex) {
    if (tabIndex < 0 || tabIndex >= MAX_TABS || !dq->tabs[tabIndex].isActive) {
        return 0;
    }
    
    // Free editor resources
    freeEditor(&(dq->tabs[tabIndex].editor));
    dq->tabs[tabIndex].isActive = 0;
    strcpy(dq->tabs[tabIndex].filename, "");
    
    dq->count--;
    
    // If removed tab was current, switch to another tab
    if (dq->currentTab == tabIndex) {
        dq->currentTab = -1;
        // Find first active tab
        for (int i = 0; i < MAX_TABS; i++) {
            if (dq->tabs[i].isActive) {
                dq->currentTab = i;
                break;
            }
        }
    }
    
    return 1;
}

// Switch to a different tab
void switchTab(TabDeque *dq, int tabIndex) {
    if (tabIndex >= 0 && tabIndex < MAX_TABS && dq->tabs[tabIndex].isActive) {
        dq->currentTab = tabIndex;
    }
}

// Get current tab index
int getCurrentTabIndex(TabDeque *dq) {
    return dq->currentTab;
}

// Get current editor
Editor* getCurrentEditor(TabDeque *dq) {
    if (dq->currentTab >= 0 && dq->currentTab < MAX_TABS && dq->tabs[dq->currentTab].isActive) {
        return &(dq->tabs[dq->currentTab].editor);
    }
    return NULL;
}

// Display all tabs
void displayTabs(TabDeque *dq) {
    printf("\n--- Open Tabs ---\n");
    for (int i = 0; i < MAX_TABS; i++) {
        if (dq->tabs[i].isActive) {
            if (i == dq->currentTab) {
                printf("> [%d] %s (ACTIVE)\n", i, dq->tabs[i].filename);
            } else {
                printf("  [%d] %s\n", i, dq->tabs[i].filename);
            }
        }
    }
    printf("--- End of Tabs ---\n\n");
}

// Free all tabs
void freeTabDeque(TabDeque *dq) {
    for (int i = 0; i < MAX_TABS; i++) {
        if (dq->tabs[i].isActive) {
            freeEditor(&(dq->tabs[i].editor));
        }
    }
}

