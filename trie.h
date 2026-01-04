#ifndef TRIE_H
#define TRIE_H

// Trie (Prefix Tree) data structure for SPELL CHECKER and SEARCH SUGGESTIONS
// Each node represents a character in a word

#define ALPHABET_SIZE 26

// Trie node structure
typedef struct TrieNode {
    struct TrieNode *children[ALPHABET_SIZE];  // Array of pointers to child nodes
    int isEndOfWord;  // 1 if this node marks the end of a word, 0 otherwise
    int frequency;    // Frequency of word (for suggestions)
} TrieNode;

// Trie structure
typedef struct {
    TrieNode *root;  // Root node of trie
} Trie;

// Function declarations
TrieNode* createTrieNode(void);
void initTrie(Trie *t);
void insertWord(Trie *t, const char *word);
int searchWordInTrie(Trie *t, const char *word);
void getSuggestions(Trie *t, const char *prefix, char suggestions[][50], int *count);
void freeTrieNode(TrieNode *node);
void freeTrie(Trie *t);
void loadDictionary(Trie *t, const char *filename);

#endif

