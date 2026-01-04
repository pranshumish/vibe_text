#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "editor.h"
#include "deque.h"

// Display main menu
void displayMenu() {
    printf("\n========== TEXT EDITOR MENU ==========\n");
    printf("BASIC FEATURES:\n");
    printf("  1. Insert Character\n");
    printf("  2. Delete Character\n");
    printf("  3. Move Cursor (Left/Right/Up/Down)\n");
    printf("  4. Search Word\n");
    printf("  5. Word Count & Character Count\n");
    printf("\nINTERMEDIATE FEATURES:\n");
    printf("  6. Undo\n");
    printf("  7. Redo\n");
    printf("  8. Copy Text\n");
    printf("  9. Cut Text\n");
    printf(" 10. Paste Text\n");
    printf(" 11. Find and Replace\n");
    printf(" 12. Insert Line\n");
    printf(" 13. Delete Line\n");
    printf("\nADVANCED FEATURES:\n");
    printf(" 14. Auto-save\n");
    printf(" 15. Syntax Highlighting\n");
    printf(" 16. Spell Checker\n");
    printf(" 17. Bracket Matching\n");
    printf(" 18. Search Suggestions\n");
    printf(" 19. Multiple File Tabs\n");
    printf("\nFILE OPERATIONS:\n");
    printf(" 20. Load File\n");
    printf(" 21. Save File\n");
    printf(" 22. Display Text\n");
    printf("  0. Exit\n");
    printf("======================================\n");
    printf("Enter your choice: ");
}

// Function to handle cursor movement submenu
void handleCursorMovement(Editor *e) {
    int choice;
    printf("\n--- Cursor Movement ---\n");
    printf("1. Move Left\n");
    printf("2. Move Right\n");
    printf("3. Move Up\n");
    printf("4. Move Down\n");
    printf("Enter choice: ");
    scanf("%d", &choice);
    getchar();  // Consume newline
    
    switch (choice) {
        case 1:
            moveCursorLeft(e);
            printf("Cursor moved left.\n");
            break;
        case 2:
            moveCursorRight(e);
            printf("Cursor moved right.\n");
            break;
        case 3:
            moveCursorUp(e);
            printf("Cursor moved up.\n");
            break;
        case 4:
            moveCursorDown(e);
            printf("Cursor moved down.\n");
            break;
        default:
            printf("Invalid choice.\n");
    }
}

// Function to handle copy/cut text
void handleCopyCut(Editor *e, int isCut) {
    int start, end;
    printf("Enter start position: ");
    scanf("%d", &start);
    printf("Enter end position: ");
    scanf("%d", &end);
    getchar();
    
    if (isCut) {
        cutText(e, start, end);
    } else {
        copyText(e, start, end);
    }
}

// Function to handle multiple tabs
void handleTabs(TabDeque *tabs) {
    int choice;
    char filename[256];
    int tabIndex;
    
    printf("\n--- Multiple File Tabs ---\n");
    printf("1. Add New Tab\n");
    printf("2. Switch Tab\n");
    printf("3. Remove Tab\n");
    printf("4. Display All Tabs\n");
    printf("5. Back to Main Menu\n");
    printf("Enter choice: ");
    scanf("%d", &choice);
    getchar();
    
    switch (choice) {
        case 1:
            printf("Enter filename for new tab: ");
            fgets(filename, sizeof(filename), stdin);
            filename[strcspn(filename, "\n")] = '\0';
            tabIndex = addTab(tabs, filename);
            if (tabIndex >= 0) {
                printf("Tab %d created successfully.\n", tabIndex);
            }
            break;
        case 2:
            displayTabs(tabs);
            printf("Enter tab index to switch to: ");
            scanf("%d", &tabIndex);
            getchar();
            switchTab(tabs, tabIndex);
            printf("Switched to tab %d.\n", tabIndex);
            break;
        case 3:
            displayTabs(tabs);
            printf("Enter tab index to remove: ");
            scanf("%d", &tabIndex);
            getchar();
            if (removeTab(tabs, tabIndex)) {
                printf("Tab %d removed successfully.\n", tabIndex);
            } else {
                printf("Failed to remove tab.\n");
            }
            break;
        case 4:
            displayTabs(tabs);
            break;
        case 5:
            return;
        default:
            printf("Invalid choice.\n");
    }
}

int main() {
    Editor editor;
    TabDeque tabs;
    int choice;
    char input;
    char filename[100];
    char wordToSearch[100];
    char findStr[100], replaceStr[100];
    char lineText[1000];
    int lineNum;
    char prefix[100];
    
    // Initialize editor
    initEditor(&editor);
    
    // Initialize tabs (Deque for multiple file tabs)
    initTabDeque(&tabs);
    addTab(&tabs, "untitled.txt");
    
    printf("========== ADVANCED TEXT EDITOR ==========\n");
    printf("Welcome to the Text Editor!\n");
    printf("\nThis editor demonstrates various Data Structures:\n");
    printf("- Doubly Linked List: Text storage & cursor movement\n");
    printf("- Stack: Undo/Redo & Bracket matching\n");
    printf("- Queue: Auto-save operations\n");
    printf("- Trie: Spell checker & Search suggestions\n");
    printf("- Deque: Multiple file tabs\n");
    printf("- Linked List of Strings: Line-wise editing\n");
    printf("- Hash Table (simulated): Syntax highlighting\n");
    printf("==========================================\n");
    
    // Ask if user wants to load a file
    printf("\nDo you want to load a file? (y/n): ");
    scanf(" %c", &input);
    getchar();
    
    if (input == 'y' || input == 'Y') {
        printf("Enter filename to load: ");
        fgets(filename, sizeof(filename), stdin);
        filename[strcspn(filename, "\n")] = '\0';
        loadFile(&editor, filename);
    }
    
    // Main menu loop
    while (1) {
        Editor *currentEditor = getCurrentEditor(&tabs);
        if (currentEditor == NULL) {
            currentEditor = &editor;
        }
        
        displayText(currentEditor);
        displayMenu();
        scanf("%d", &choice);
        getchar();  // Consume newline
        
        switch (choice) {
            case 1:  // Insert Character
                printf("Enter character to insert: ");
                scanf(" %c", &input);
                getchar();
                insertChar(currentEditor, input);
                printf("Character '%c' inserted.\n", input);
                break;
                
            case 2:  // Delete Character
                deleteChar(currentEditor);
                break;
                
            case 3:  // Move Cursor
                handleCursorMovement(currentEditor);
                break;
                
            case 4:  // Search Word
                printf("Enter word to search: ");
                fgets(wordToSearch, sizeof(wordToSearch), stdin);
                wordToSearch[strcspn(wordToSearch, "\n")] = '\0';
                searchWord(currentEditor, wordToSearch);
                break;
                
            case 5:  // Word Count & Character Count
                printf("\n--- Statistics ---\n");
                printf("Character Count: %d\n", getCharCount(currentEditor));
                printf("Word Count: %d\n", getWordCount(currentEditor));
                printf("Line Count: %d\n", currentEditor->lineCount + 1);
                printf("--- End of Statistics ---\n");
                break;
                
            case 6:  // Undo
                undo(currentEditor);
                break;
                
            case 7:  // Redo
                redo(currentEditor);
                break;
                
            case 8:  // Copy Text
                handleCopyCut(currentEditor, 0);
                break;
                
            case 9:  // Cut Text
                handleCopyCut(currentEditor, 1);
                break;
                
            case 10:  // Paste Text
                paste(currentEditor);
                break;
                
            case 11:  // Find and Replace
                printf("Enter text to find: ");
                fgets(findStr, sizeof(findStr), stdin);
                findStr[strcspn(findStr, "\n")] = '\0';
                printf("Enter replacement text: ");
                fgets(replaceStr, sizeof(replaceStr), stdin);
                replaceStr[strcspn(replaceStr, "\n")] = '\0';
                findAndReplace(currentEditor, findStr, replaceStr);
                break;
                
            case 12:  // Insert Line
                printf("Enter line number: ");
                scanf("%d", &lineNum);
                getchar();
                printf("Enter line text: ");
                fgets(lineText, sizeof(lineText), stdin);
                lineText[strcspn(lineText, "\n")] = '\0';
                insertLine(currentEditor, lineNum, lineText);
                break;
                
            case 13:  // Delete Line
                printf("Enter line number to delete: ");
                scanf("%d", &lineNum);
                getchar();
                deleteLine(currentEditor, lineNum);
                break;
                
            case 14:  // Auto-save
                autoSave(currentEditor);
                processAutoSaveQueue(currentEditor);
                break;
                
            case 15:  // Syntax Highlighting
                currentEditor->syntaxHighlightEnabled = 1;
                highlightSyntax(currentEditor);
                break;
                
            case 16:  // Spell Checker
                checkSpelling(currentEditor);
                break;
                
            case 17:  // Bracket Matching
                checkBracketMatching(currentEditor);
                break;
                
            case 18:  // Search Suggestions
                printf("Enter prefix for suggestions: ");
                fgets(prefix, sizeof(prefix), stdin);
                prefix[strcspn(prefix, "\n")] = '\0';
                getSearchSuggestions(currentEditor, prefix);
                break;
                
            case 19:  // Multiple File Tabs
                handleTabs(&tabs);
                currentEditor = getCurrentEditor(&tabs);
                if (currentEditor == NULL) {
                    currentEditor = &editor;
                }
                break;
                
            case 20:  // Load File
                printf("Enter filename to load: ");
                fgets(filename, sizeof(filename), stdin);
                filename[strcspn(filename, "\n")] = '\0';
                loadFile(currentEditor, filename);
                break;
                
            case 21:  // Save File
                printf("Enter filename to save: ");
                fgets(filename, sizeof(filename), stdin);
                filename[strcspn(filename, "\n")] = '\0';
                saveFile(currentEditor, filename);
                break;
                
            case 22:  // Display Text
                displayText(currentEditor);
                break;
                
            case 0:  // Exit
                printf("Exiting editor...\n");
                freeEditor(currentEditor);
                freeTabDeque(&tabs);
                printf("Thank you for using the Text Editor!\n");
                return 0;
                
            default:
                printf("Invalid choice! Please try again.\n");
                break;
        }
    }
    
    return 0;
}
