#!/bin/bash

# Navigate to the project directory
cd "$HOME/Desktop/CFB-Dynasty-Manager-v2026" || {
  echo "Folder not found on Desktop."
  exit 1
}

echo "Starting the app in development mode..."
echo "To stop the app, press Ctrl+C in this terminal."

npm run electron-dev
