# Emscripten Setup Guide

## Installing Emscripten

Emscripten is required to compile C code to WebAssembly. Follow these steps:

### Option 1: Using Homebrew (Recommended for macOS)

```bash
# Install Emscripten via Homebrew
brew install emscripten

# Verify installation
emcc --version
```

### Option 2: Manual Installation

```bash
# Clone the emsdk repository
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk

# Install the latest SDK tools
./emsdk install latest

# Activate the latest SDK
./emsdk activate latest

# Add to your shell profile
source ./emsdk_env.sh

# Verify installation
emcc --version
```

### After Installation

Once Emscripten is installed, run:

```bash
cd /Users/pranshumishra/Desktop/new_proj/dsa_proj
make all
```

This will compile all C files to WebAssembly.

## Next Steps

After installing Emscripten, let me know and I'll continue with the integration!
