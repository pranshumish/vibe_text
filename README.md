# DSA Text Editor Project

This is a web-based text editor with data structure visualizations.

## Prerequisites
- Node.js (v16 or higher recommended)
- npm (Node Package Manager)

## Setup and Installation

1. Open your terminal to the project directory:
   ```bash
   cd c:\Users\PV\Downloads\dsa_proj\dsa_proj\
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

## Running the Application

To start the development server:

```bash
npm run dev
```

This will give you a local URL (usually `http://localhost:5173`) that you can open in your browser to view the application.

## Building for Production

To build the project for production:

```bash
npm run build
```

## Project Structure
- `src/js`: Contains the JavaScript implementation of the text editor and visualizers.
- `src/c`: Contains C source code for data structures (intended for WASM integration, currently valid C code but not linked to the frontend).
- `index.html`: Main entry point.
