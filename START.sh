#!/bin/bash

# ShoeStore Quick Start Script for macOS/Linux

echo ""
echo "===================================="
echo "    ShoeStore E-Commerce Platform"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please download and install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js is installed:"
node --version
echo ""

echo "Starting Backend Setup..."
echo "===================================="
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    echo ""
fi

echo ""
echo "===================================="
echo "Starting Backend Server..."
echo "===================================="
echo "Backend will run on: http://localhost:5000"
echo ""

npm start &
BACKEND_PID=$!

sleep 3

echo ""
echo "===================================="
echo "Backend started! Now starting Frontend..."
echo "===================================="
echo ""

cd ../frontend

echo ""
echo "Frontend server options:"
echo ""
echo "1. Using Python (if installed)"
echo "   python3 -m http.server 3000"
echo ""
echo "2. Using Node http-server"
echo "   npx http-server -p 3000"
echo ""
echo "3. Using VS Code Live Server extension"
echo "   Right-click index.html and select 'Open with Live Server'"
echo ""
echo "===================================="
echo ""
echo "Starting Frontend with http-server..."
echo "Frontend will run on: http://localhost:3000"
echo ""

npx http-server -p 3000 &
FRONTEND_PID=$!

sleep 2

echo ""
echo "===================================="
echo "Startup Complete!"
echo "===================================="
echo ""
echo "Open your browser and visit:"
echo "http://localhost:3000"
echo ""
echo "To stop the servers, press Ctrl+C"
echo ""

wait
