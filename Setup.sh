#!/bin/bash

# Navigate to the project directory (assumes user put it on Desktop)
cd "$HOME/Desktop/CFB-Dynasty-Manager-v2026" || {
  echo "Folder not found on Desktop."
  exit 1
}

echo "Installing dependencies..."
npm install

echo "Done. Press Enter to exit."
read
