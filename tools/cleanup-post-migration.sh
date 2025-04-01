#!/bin/bash

# Cleanup script after successful migration to frontend structure
echo "Codex Post-Migration Cleanup"
echo "============================"
echo ""

# Check if migration was successful
if ! grep -q "const USE_FRONTEND_STRUCTURE = true" "/Users/m/gh/codex/src/index.jsx"; then
  echo "ERROR: Migration doesn't appear to be complete!"
  echo "The entry point is not using the frontend structure."
  echo "Please complete the migration before cleanup."
  exit 1
fi

# Create backup directory
mkdir -p /Users/m/gh/codex/tools/final-backup

# Backup original files
echo "Backing up original files..."
cp -r /Users/m/gh/codex/src/components /Users/m/gh/codex/tools/final-backup/
cp -r /Users/m/gh/codex/src/context /Users/m/gh/codex/tools/final-backup/
cp -r /Users/m/gh/codex/src/pages /Users/m/gh/codex/tools/final-backup/
cp -r /Users/m/gh/codex/src/utils /Users/m/gh/codex/tools/final-backup/
cp -r /Users/m/gh/codex/src/styles /Users/m/gh/codex/tools/final-backup/
cp -r /Users/m/gh/codex/src/hooks /Users/m/gh/codex/tools/final-backup/
cp /Users/m/gh/codex/src/App.jsx /Users/m/gh/codex/tools/final-backup/

# Simplify entry point
echo "Simplifying entry point..."
cat > "/Users/m/gh/codex/src/index.jsx" << EOL
import { render } from 'preact';
import '@picocss/pico';
import './frontend/styles/custom.css';
import App from './frontend/App';

render(<App />, document.getElementById('app'));
EOL

# Remove duplicated directories
echo "Removing duplicate files..."
rm -rf /Users/m/gh/codex/src/components
rm -rf /Users/m/gh/codex/src/context
rm -rf /Users/m/gh/codex/src/pages
rm -rf /Users/m/gh/codex/src/utils
rm -rf /Users/m/gh/codex/src/styles
rm -rf /Users/m/gh/codex/src/hooks
rm -f /Users/m/gh/codex/src/App.jsx

echo ""
echo "Cleanup complete!"
echo "The codebase now uses only the /src/frontend structure."
echo "Backups of the removed files are in /Users/m/gh/codex/tools/final-backup/"
echo ""
echo "Next steps:"
echo "1. Build and deploy the application again"
echo "2. Verify everything is working correctly"
echo "3. If needed, restore from backup using the following command:"
echo "   cp -r /Users/m/gh/codex/tools/final-backup/* /Users/m/gh/codex/src/"