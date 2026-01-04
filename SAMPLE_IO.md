# Sample Input/Output

This document demonstrates sample usage of the text editor with various features.

## Sample Session 1: Basic Text Editing

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
BASIC FEATURES:
  1. Insert Character
  2. Delete Character
  3. Move Cursor (Left/Right/Up/Down)
  4. Search Word
  5. Word Count & Character Count
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

Enter your choice: 1
Enter character to insert:  
Character ' ' inserted.

Enter your choice: 1
Enter character to insert: W
Character 'W' inserted.

Enter your choice: 1
Enter character to insert: o
Character 'o' inserted.

Enter your choice: 1
Enter character to insert: r
Character 'r' inserted.

Enter your choice: 1
Enter character to insert: l
Character 'l' inserted.

Enter your choice: 1
Enter character to insert: d
Character 'd' inserted.

--- Text Editor Content ---
Hello World|
--- End of Content ---
Characters: 11 | Words: 2 | Lines: 1

Enter your choice: 5
--- Statistics ---
Character Count: 11
Word Count: 2
Line Count: 1
--- End of Statistics ---
```

## Sample Session 2: Search and Spell Check

```
--- Text Editor Content ---
Hello World|
--- End of Content ---
Characters: 11 | Words: 2 | Lines: 1

Enter your choice: 4
Enter word to search: World
Word 'World' found at position(s): 6 

Enter your choice: 16
--- Spell Check Results ---
No spelling errors found!
--- End of Spell Check ---
```

## Sample Session 3: Undo/Redo

```
--- Text Editor Content ---
Hello World|
--- End of Content ---
Characters: 11 | Words: 2 | Lines: 1

Enter your choice: 1
Enter character to insert: !
Character '!' inserted.

--- Text Editor Content ---
Hello World!|
--- End of Content ---
Characters: 12 | Words: 2 | Lines: 1

Enter your choice: 6
Undone: Insert operation

--- Text Editor Content ---
Hello World|
--- End of Content ---
Characters: 11 | Words: 2 | Lines: 1

Enter your choice: 7
Redone: Insert operation

--- Text Editor Content ---
Hello World!|
--- End of Content ---
Characters: 12 | Words: 2 | Lines: 1
```

## Sample Session 4: Find and Replace

```
--- Text Editor Content ---
Hello World Hello|
--- End of Content ---
Characters: 16 | Words: 3 | Lines: 1

Enter your choice: 11
Enter text to find: Hello
Enter replacement text: Hi
Replaced 2 occurrence(s) of 'Hello' with 'Hi'.

--- Text Editor Content ---
Hi World Hi|
--- End of Content ---
Characters: 10 | Words: 3 | Lines: 1
```

## Sample Session 5: Bracket Matching

```
--- Text Editor Content ---
if (x > 0) { return x; }|
--- End of Content ---
Characters: 25 | Words: 6 | Lines: 1

Enter your choice: 17
All brackets are properly matched!
```

## Sample Session 6: Search Suggestions

```
Enter your choice: 18
Enter prefix for suggestions: hel
Suggestions for 'hel':
  1. hello
  2. help
  3. held
  4. hell
```

## Sample Session 7: Syntax Highlighting

```
--- Text Editor Content ---
if (x > 0) { return x; }|
--- End of Content ---
Characters: 25 | Words: 6 | Lines: 1

Enter your choice: 15
--- Syntax Highlighted Text ---
[KEYWORD:if] (x > 0) { [KEYWORD:return] x; }
--- End of Highlighted Text ---
Highlighted 2 keyword(s).
```

## Sample Session 8: Multiple Tabs

```
Enter your choice: 19
--- Multiple File Tabs ---
1. Add New Tab
2. Switch Tab
3. Remove Tab
4. Display All Tabs
5. Back to Main Menu
Enter choice: 1
Enter filename for new tab: file2.txt
Tab 1 created successfully.

Enter choice: 4
--- Open Tabs ---
> [0] untitled.txt (ACTIVE)
  [1] file2.txt
--- End of Tabs ---

Enter choice: 2
Enter tab index to switch to: 1
Switched to tab 1.

Enter choice: 4
--- Open Tabs ---
  [0] untitled.txt
> [1] file2.txt (ACTIVE)
--- End of Tabs ---
```

## Sample Session 9: Copy/Cut/Paste

```
--- Text Editor Content ---
Hello World|
--- End of Content ---
Characters: 11 | Words: 2 | Lines: 1

Enter your choice: 8
Enter start position: 0
Enter end position: 4
Copied 5 characters.

Enter your choice: 3
--- Cursor Movement ---
1. Move Left
2. Move Right
3. Move Up
4. Move Down
Enter choice: 2
Cursor moved right.

Enter your choice: 2
Cursor moved right.

Enter your choice: 2
Cursor moved right.

Enter your choice: 2
Cursor moved right.

Enter your choice: 2
Cursor moved right.

Enter your choice: 2
Cursor moved right.

--- Text Editor Content ---
Hello |World
--- End of Content ---
Characters: 11 | Words: 2 | Lines: 1

Enter your choice: 10
Pasted 5 characters.

--- Text Editor Content ---
Hello Hello|World
--- End of Content ---
Characters: 16 | Words: 3 | Lines: 1
```

## Sample Session 10: Auto-save

```
Enter your choice: 14
Auto-save operation queued.
Processed 1 auto-save operation(s).
```

## Complete Example: C Code Editing

```
Enter your choice: 1
Enter character to insert: #
Character '#' inserted.

Enter your choice: 1
Enter character to insert: i
Character 'i' inserted.

Enter your choice: 1
Enter character to insert: n
Character 'n' inserted.

Enter your choice: 1
Enter character to insert: c
Character 'c' inserted.

Enter your choice: 1
Enter character to insert: l
Character 'l' inserted.

Enter your choice: 1
Enter character to insert: u
Character 'u' inserted.

Enter your choice: 1
Enter character to insert: d
Character 'd' inserted.

Enter your choice: 1
Enter character to insert: e
Character 'e' inserted.

Enter your choice: 1
Enter character to insert:  
Character ' ' inserted.

Enter your choice: 1
Enter character to insert: <
Character '<' inserted.

Enter your choice: 1
Enter character to insert: s
Character 's' inserted.

Enter your choice: 1
Enter character to insert: t
Character 't' inserted.

Enter your choice: 1
Enter character to insert: d
Character 'd' inserted.

Enter your choice: 1
Enter character to insert: i
Character 'i' inserted.

Enter your choice: 1
Enter character to insert: o
Character 'o' inserted.

Enter your choice: 1
Enter character to insert: .
Character '.' inserted.

Enter your choice: 1
Enter character to insert: h
Character 'h' inserted.

Enter your choice: 1
Enter character to insert: >
Character '>' inserted.

Enter your choice: 1
Enter character to insert: 

Character '
' inserted.

Enter your choice: 1
Enter character to insert: i
Character 'i' inserted.

Enter your choice: 1
Enter character to insert: n
Character 'n' inserted.

Enter your choice: 1
Enter character to insert: t
Character 't' inserted.

Enter your choice: 1
Enter character to insert:  
Character ' ' inserted.

Enter your choice: 1
Enter character to insert: m
Character 'm' inserted.

Enter your choice: 1
Enter character to insert: a
Character 'a' inserted.

Enter your choice: 1
Enter character to insert: i
Character 'i' inserted.

Enter your choice: 1
Enter character to insert: n
Character 'n' inserted.

Enter your choice: 1
Enter character to insert: (
Character '(' inserted.

Enter your choice: 1
Enter character to insert: )
Character ')' inserted.

Enter your choice: 1
Enter character to insert:  
Character ' ' inserted.

Enter your choice: 1
Enter character to insert: {
Character '{' inserted.

Enter your choice: 1
Enter character to insert: 
Character '
' inserted.

Enter your choice: 1
Enter character to insert:  
Character ' ' inserted.

Enter your choice: 1
Enter character to insert: r
Character 'r' inserted.

Enter your choice: 1
Enter character to insert: e
Character 'e' inserted.

Enter your choice: 1
Enter character to insert: t
Character 't' inserted.

Enter your choice: 1
Enter character to insert: u
Character 'u' inserted.

Enter your choice: 1
Enter character to insert: r
Character 'r' inserted.

Enter your choice: 1
Enter character to insert: n
Character 'n' inserted.

Enter your choice: 1
Enter character to insert:  
Character ' ' inserted.

Enter your choice: 1
Enter character to insert: 0
Character '0' inserted.

Enter your choice: 1
Enter character to insert: ;
Character ';' inserted.

Enter your choice: 1
Enter character to insert: 
Character '
' inserted.

Enter your choice: 1
Enter character to insert: }
Character '}' inserted.

--- Text Editor Content ---
#include <stdio.h>
int main() {
 return 0;
}|
--- End of Content ---
Characters: 35 | Words: 4 | Lines: 3

Enter your choice: 15
--- Syntax Highlighted Text ---
#include <stdio.h>
[KEYWORD:int] main() {
 [KEYWORD:return] 0;
}
--- End of Highlighted Text ---
Highlighted 2 keyword(s).

Enter your choice: 17
All brackets are properly matched!

Enter your choice: 16
--- Spell Check Results ---
No spelling errors found!
--- End of Spell Check ---
```

