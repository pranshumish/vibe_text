# Compiler settings
CC = emcc
CFLAGS = -O3 -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","getValue","setValue"]'

# Directories
SRC_DIR = src/c
DIST_DIR = src/wasm

# Source files
SOURCES = $(wildcard $(SRC_DIR)/*.c)
TARGETS = $(patsubst $(SRC_DIR)/%.c,$(DIST_DIR)/%.js,$(SOURCES))

# Create dist directory if it doesn't exist
$(shell mkdir -p $(DIST_DIR))

# Default target
all: $(TARGETS)

# Compile each C file to WASM
$(DIST_DIR)/stack.js: $(SRC_DIR)/stack.c
	$(CC) $(CFLAGS) \
		-s EXPORTED_FUNCTIONS='["_stack_init","_stack_push","_stack_pop","_stack_peek","_stack_is_empty","_stack_size","_stack_get_at","_malloc","_free"]' \
		$< -o $@

$(DIST_DIR)/linkedlist.js: $(SRC_DIR)/linkedlist.c
	$(CC) $(CFLAGS) \
		-s EXPORTED_FUNCTIONS='["_list_init","_list_insert_front","_list_insert_back","_list_delete","_list_search","_list_get_size","_list_get_at","_malloc","_free"]' \
		$< -o $@

$(DIST_DIR)/hashmap.js: $(SRC_DIR)/hashmap.c
	$(CC) $(CFLAGS) \
		-s EXPORTED_FUNCTIONS='["_hashmap_init","_hashmap_insert","_hashmap_get","_hashmap_delete","_hashmap_get_bucket_key","_hashmap_get_bucket_value","_hashmap_get_bucket_size","_hash_function","_malloc","_free"]' \
		$< -o $@

$(DIST_DIR)/trie.js: $(SRC_DIR)/trie.c
	$(CC) $(CFLAGS) \
		-s EXPORTED_FUNCTIONS='["_trie_init","_trie_insert","_trie_search","_trie_starts_with","_trie_has_child","_trie_is_word_end","_malloc","_free"]' \
		$< -o $@

$(DIST_DIR)/graph.js: $(SRC_DIR)/graph.c
	$(CC) $(CFLAGS) \
		-s EXPORTED_FUNCTIONS='["_graph_init","_graph_add_edge","_graph_add_edge_undirected","_graph_has_edge","_graph_get_num_vertices","_graph_get_neighbor","_graph_get_degree","_graph_reset_visited","_graph_dfs_util","_graph_is_visited","_malloc","_free"]' \
		$< -o $@

$(DIST_DIR)/huffman.js: $(SRC_DIR)/huffman.c
	$(CC) $(CFLAGS) \
		$< -o $@

# Clean build artifacts
clean:
	rm -rf $(DIST_DIR)/*

# Rebuild everything
rebuild: clean all

.PHONY: all clean rebuild
