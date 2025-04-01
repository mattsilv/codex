#!/bin/bash

echo "Starting simplified Codex backend for OAuth testing..."

mkdir -p .wrangler/state/d1
mkdir -p .wrangler/state/r2
mkdir -p .wrangler/state/kv

# Start with simplified worker
npx wrangler dev worker-config.js --port 8787 --local