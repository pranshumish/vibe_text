#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include "trie.h"

// Create a new trie node
TrieNode* createTrieNode(void) {
    TrieNode *node = (TrieNode *)malloc(sizeof(TrieNode));
    node->isEndOfWord = 0;
    node->frequency = 0;
    
    // Initialize all children to NULL
    for (int i = 0; i < ALPHABET_SIZE; i++) {
        node->children[i] = NULL;
    }
    
    return node;
}

// Initialize trie
void initTrie(Trie *t) {
    t->root = createTrieNode();
}

// Insert a word into the trie
void insertWord(Trie *t, const char *word) {
    if (word == NULL || strlen(word) == 0) {
        return;
    }
    
    TrieNode *current = t->root;
    
    // Traverse or create nodes for each character
    for (int i = 0; word[i] != '\0'; i++) {
        int index = tolower(word[i]) - 'a';
        
        // Check if character is valid alphabet
        if (index < 0 || index >= ALPHABET_SIZE) {
            continue;
        }
        
        // Create new node if path doesn't exist
        if (current->children[index] == NULL) {
            current->children[index] = createTrieNode();
        }
        
        current = current->children[index];
    }
    
    // Mark end of word
    current->isEndOfWord = 1;
    current->frequency++;
}

// Search for a word in the trie
int searchWordInTrie(Trie *t, const char *word) {
    if (word == NULL || strlen(word) == 0) {
        return 0;
    }
    
    TrieNode *current = t->root;
    
    // Traverse the trie
    for (int i = 0; word[i] != '\0'; i++) {
        int index = tolower(word[i]) - 'a';
        
        if (index < 0 || index >= ALPHABET_SIZE) {
            return 0;
        }
        
        if (current->children[index] == NULL) {
            return 0;  // Word not found
        }
        
        current = current->children[index];
    }
    
    // Check if it's a complete word
    return (current != NULL && current->isEndOfWord);
}

// Helper function to collect all words with given prefix
void collectWords(TrieNode *node, char *prefix, int prefixLen, char suggestions[][50], int *count, int maxSuggestions) {
    if (node == NULL || *count >= maxSuggestions) {
        return;
    }
    
    // If current node marks end of word, add to suggestions
    if (node->isEndOfWord && *count < maxSuggestions) {
        prefix[prefixLen] = '\0';
        strcpy(suggestions[*count], prefix);
        (*count)++;
    }
    
    // Recursively search all children
    for (int i = 0; i < ALPHABET_SIZE && *count < maxSuggestions; i++) {
        if (node->children[i] != NULL) {
            prefix[prefixLen] = 'a' + i;
            collectWords(node->children[i], prefix, prefixLen + 1, suggestions, count, maxSuggestions);
        }
    }
}

// Get suggestions for a given prefix
void getSuggestions(Trie *t, const char *prefix, char suggestions[][50], int *count) {
    if (prefix == NULL || strlen(prefix) == 0) {
        return;
    }
    
    *count = 0;
    TrieNode *current = t->root;
    char word[50];
    int prefixLen = 0;
    
    // Traverse to the prefix node
    for (int i = 0; prefix[i] != '\0'; i++) {
        int index = tolower(prefix[i]) - 'a';
        
        if (index < 0 || index >= ALPHABET_SIZE) {
            return;
        }
        
        if (current->children[index] == NULL) {
            return;  // No words with this prefix
        }
        
        word[prefixLen++] = prefix[i];
        current = current->children[index];
    }
    
    // Collect all words with this prefix
    collectWords(current, word, prefixLen, suggestions, count, 10);
}

// Free a trie node recursively
void freeTrieNode(TrieNode *node) {
    if (node == NULL) {
        return;
    }
    
    // Recursively free all children
    for (int i = 0; i < ALPHABET_SIZE; i++) {
        if (node->children[i] != NULL) {
            freeTrieNode(node->children[i]);
        }
    }
    
    free(node);
}

// Free the entire trie
void freeTrie(Trie *t) {
    if (t->root != NULL) {
        freeTrieNode(t->root);
        t->root = NULL;
    }
}

// Load dictionary from file (for spell checker)
void loadDictionary(Trie *t, const char *filename) {
    FILE *file = fopen(filename, "r");
    if (file == NULL) {
        // If file doesn't exist, create a basic dictionary
        printf("Dictionary file not found. Creating basic dictionary...\n");
        const char *basicWords[] = {
            "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
            "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
            "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
            "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
            "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
            "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
            "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
            "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
            "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
            "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
        };
        
        int wordCount = sizeof(basicWords) / sizeof(basicWords[0]);
        for (int i = 0; i < wordCount; i++) {
            insertWord(t, basicWords[i]);
        }
        return;
    }
    
    char word[100];
    while (fscanf(file, "%s", word) != EOF) {
        // Remove punctuation and convert to lowercase
        int len = strlen(word);
        for (int i = 0; i < len; i++) {
            if (!isalpha(word[i])) {
                word[i] = '\0';
                break;
            }
            word[i] = tolower(word[i]);
        }
        if (strlen(word) > 0) {
            insertWord(t, word);
        }
    }
    
    fclose(file);
    printf("Dictionary loaded successfully.\n");
}

