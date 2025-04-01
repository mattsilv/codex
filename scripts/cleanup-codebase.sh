#!/bin/bash

echo "Cleaning up duplicate codebases in the repository..."

# Verify that the frontend directory contains what we need
if [ ! -d "/Users/m/gh/codex/src/frontend" ]; then
    echo "ERROR: Frontend directory doesn't exist!"
    exit 1
fi

# Make backups of affected directories
echo "Making backups..."
mkdir -p /Users/m/gh/codex/backups
if [ -d "/Users/m/gh/codex/src/components" ]; then
    cp -r /Users/m/gh/codex/src/components /Users/m/gh/codex/backups/
fi
if [ -d "/Users/m/gh/codex/src/context" ]; then
    cp -r /Users/m/gh/codex/src/context /Users/m/gh/codex/backups/
fi
if [ -d "/Users/m/gh/codex/src/pages" ]; then
    cp -r /Users/m/gh/codex/src/pages /Users/m/gh/codex/backups/
fi
if [ -d "/Users/m/gh/codex/src/utils" ]; then
    cp -r /Users/m/gh/codex/src/utils /Users/m/gh/codex/backups/
fi
if [ -d "/Users/m/gh/codex/src/styles" ]; then
    cp -r /Users/m/gh/codex/src/styles /Users/m/gh/codex/backups/
fi
if [ -d "/Users/m/gh/codex/src/hooks" ]; then
    cp -r /Users/m/gh/codex/src/hooks /Users/m/gh/codex/backups/
fi

# Backup the main App.jsx file
if [ -f "/Users/m/gh/codex/src/App.jsx" ]; then
    cp /Users/m/gh/codex/src/App.jsx /Users/m/gh/codex/backups/
fi

# Remove outdated directories
echo "Removing outdated directories..."
rm -rf /Users/m/gh/codex/src/components
rm -rf /Users/m/gh/codex/src/context
rm -rf /Users/m/gh/codex/src/pages
rm -rf /Users/m/gh/codex/src/utils
rm -rf /Users/m/gh/codex/src/styles
rm -rf /Users/m/gh/codex/src/hooks
rm -f /Users/m/gh/codex/src/App.jsx

echo "Cleanup complete!"
echo "The following directories were moved to backup:"
echo " - /Users/m/gh/codex/backups/"
echo ""
echo "Now run build and deploy to verify everything still works."