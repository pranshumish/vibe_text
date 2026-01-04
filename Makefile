# Makefile for Simple Text Editor
# Compiles all source files into a single executable

CC = gcc
CFLAGS = -Wall -Wextra -std=c99
TARGET = text_editor
SOURCES = main.c editor.c stack.c queue.c trie.c deque.c
OBJECTS = $(SOURCES:.c=.o)

# Default target
all: $(TARGET)

# Link object files to create executable
$(TARGET): $(OBJECTS)
	$(CC) $(CFLAGS) -o $(TARGET) $(OBJECTS)
	@echo "Build successful! Run ./$(TARGET) to start the editor."

# Compile source files to object files
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# Clean build files
clean:
	rm -f $(OBJECTS) $(TARGET)
	@echo "Clean complete."

# Run the program
run: $(TARGET)
	./$(TARGET)

.PHONY: all clean run

