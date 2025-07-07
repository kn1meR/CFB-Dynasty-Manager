#!/bin/zsh

# Change to the directory where the script is located
cd "$(dirname "$0")"

echo "Starting app..."
npm run electron-dev

echo "When done, press Ctrl+C to stop the app."
