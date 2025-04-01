#!/bin/bash

# Migration script to move the codebase to the /src/frontend structure
echo "Codex Frontend Migration Tool"
echo "============================"
echo ""

# Create directories if they don't exist
mkdir -p /Users/m/gh/codex/tools/backup

# Function to sync changes from src to frontend
sync_changes() {
  SOURCE_DIR="/Users/m/gh/codex/src/$1"
  TARGET_DIR="/Users/m/gh/codex/src/frontend/$1"
  
  echo "Syncing $1 directory..."
  
  # Create target directory if it doesn't exist
  mkdir -p "$TARGET_DIR"
  
  # For each file in the source directory
  for file in "$SOURCE_DIR"/*; do
    if [ -f "$file" ]; then
      filename=$(basename "$file")
      target_file="$TARGET_DIR/$filename"
      
      # Check if target file exists
      if [ -f "$target_file" ]; then
        # Compare files
        if ! cmp -s "$file" "$target_file"; then
          echo " - Updating $filename (files differ)"
          # Backup existing file
          cp "$target_file" "/Users/m/gh/codex/tools/backup/$filename.bak"
          # Copy new version
          cp "$file" "$target_file"
        fi
      else
        echo " - Copying $filename (new file)"
        cp "$file" "$target_file"
      fi
    elif [ -d "$file" ]; then
      # Handle subdirectories
      subdir=$(basename "$file")
      sync_changes "$1/$subdir"
    fi
  done
}

# Function to update imports in a file
update_imports() {
  FILE="$1"
  echo "Updating imports in $FILE"
  
  # Use sed to update import paths
  # 1. Update relative imports to components
  sed -i '.bak' "s|from '\.\./components|from '@/components|g" "$FILE"
  # 2. Update relative imports to context
  sed -i '.bak' "s|from '\.\./context|from '@/context|g" "$FILE"
  # 3. Update relative imports to hooks
  sed -i '.bak' "s|from '\.\./hooks|from '@/hooks|g" "$FILE"
  # 4. Update relative imports to utils
  sed -i '.bak' "s|from '\.\./utils|from '@/utils|g" "$FILE"
  # 5. Update relative imports to pages
  sed -i '.bak' "s|from '\.\./pages|from '@/pages|g" "$FILE"
  # 6. Update relative imports to styles
  sed -i '.bak' "s|from '\.\./styles|from '@/styles|g" "$FILE"
  
  # Remove backup files
  rm "${FILE}.bak"
}

# Update main entry point
create_toggleable_entry() {
  ENTRY_FILE="/Users/m/gh/codex/src/index.jsx"
  
  # Backup the original file
  cp "$ENTRY_FILE" "/Users/m/gh/codex/tools/backup/index.jsx.original"
  
  echo "Creating toggleable entry point..."
  
  cat > "$ENTRY_FILE" << EOL
import { render } from 'preact';
import '@picocss/pico';

// Toggle between frontend and legacy structure
const USE_FRONTEND_STRUCTURE = false;

if (USE_FRONTEND_STRUCTURE) {
  // New structure
  import('./frontend/styles/custom.css');
  import('./frontend/App').then(module => {
    const App = module.default;
    render(<App />, document.getElementById('app'));
  });
} else {
  // Original structure
  import('./styles/custom.css');
  import('./App').then(module => {
    const App = module.default;
    render(<App />, document.getElementById('app'));
  });
}
EOL

  echo "Created toggleable entry point with USE_FRONTEND_STRUCTURE = false"
}

# Main script logic

# 1. Sync all directories
echo "Step 1: Syncing directories..."
sync_changes "components"
sync_changes "context"
sync_changes "hooks"
sync_changes "pages"
sync_changes "utils"
sync_changes "styles"

# 2. Copy App.jsx if needed
if ! cmp -s "/Users/m/gh/codex/src/App.jsx" "/Users/m/gh/codex/src/frontend/App.jsx"; then
  echo "Updating App.jsx..."
  cp "/Users/m/gh/codex/src/App.jsx" "/Users/m/gh/codex/src/frontend/App.jsx"
fi

# 3. Create toggleable entry point
create_toggleable_entry

echo ""
echo "Migration preparation complete!"
echo "To test the frontend structure:"
echo "1. Edit /Users/m/gh/codex/src/index.jsx"
echo "2. Set USE_FRONTEND_STRUCTURE = true"
echo "3. Run the build and deployment process"
echo "4. If successful, you can later clean up the duplicate code"
echo ""