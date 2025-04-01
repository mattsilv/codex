#!/bin/bash
# Script to open the seed data HTML page in the default browser

FILEPATH=$(pwd)/seed-data.html
echo "Opening $FILEPATH in your default browser..."

# On macOS use open
if [[ "$OSTYPE" == "darwin"* ]]; then
  open "$FILEPATH"
# On Linux you might use xdg-open
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  xdg-open "$FILEPATH"
# On Windows use start
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
  start "$FILEPATH"
else
  echo "Couldn't determine how to open the browser on your OS."
  echo "Please manually open this file in your browser:"
  echo "$FILEPATH"
fi

echo ""
echo "Instructions:"
echo "1. Click the 'Seed Test Data' button on the webpage"
echo "2. If successful, you'll see user details for alice@example.com and bob@example.com"
echo "3. Use these credentials to log into your Codex application"
echo ""
echo "Note: Ensure your Wrangler dev server is running with 'npm run dev:worker'"