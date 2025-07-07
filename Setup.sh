#!/bin/zsh

# Change to the directory where the script is located
cd "$(dirname "$0")"

echo "Installing dependencies..."
npm install

echo "Setup complete. You can now run RunCFBDM.sh to start the app."
