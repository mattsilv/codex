# Frontend Migration Plan

This document outlines the plan to consolidate the Codex codebase structure into the agreed standard format.

## Target Structure

As documented in `docs/codebase-structure.md`, the target structure is:

```
src/
├── frontend/    # Frontend application (Preact)
├── backend/     # Backend application (Cloudflare Workers)
└── shared/      # Shared code between frontend and backend
```

## Current Status

The codebase currently has a duplicate structure with:

1. `/src/*` - Original structure with components, pages, hooks, etc.
2. `/src/frontend/*` - Newer structure with the same components

Both structures are functional, but only one is being used in production (the root `/src/*` structure).

## Migration Strategy

We'll adopt a phased approach:

### Phase 1: Update Entry Point (Complete)

- [x] Ensure `/src/components/layout/Footer.jsx` shows version number

### Phase 2: Prepare Migration Script

- [ ] Create a script to migrate necessary files from `/src/*` to `/src/frontend/*`
- [ ] Create an entry point switch script to toggle between old and new structures

### Phase 3: Update Imports

- [ ] Update all import paths in frontend files to use aliases
- [ ] Test building with both structures

### Phase 4: Switch Entry Point

- [ ] Update entry point to use frontend structure
- [ ] Deploy and test

### Phase 5: Clean Up

- [ ] Once frontend structure is verified working, remove duplicate code
- [ ] Update documentation

## Implementation Details

### File Migration

We'll ensure that any changes made to files in `/src/*` are reflected in `/src/frontend/*` before switching:

1. For each file in `/src/components`, `/src/context`, `/src/hooks`, `/src/pages`, `/src/utils`:
   - Compare with the equivalent file in `/src/frontend/*`
   - Merge any differences (keeping frontend version as base)
   - Ensure all changes (like version numbers) are included

### Import Path Strategy

We'll use Vite's alias feature to make imports work consistently:

```javascript
// vite.config.js
resolve: {
  alias: {
    '@': resolve(__dirname, './src/frontend'),
    '@shared': resolve(__dirname, './src/shared'),
  },
}
```

This will allow imports like:

```javascript
import Button from '@/components/ui/Button';
import { API_URL } from '@shared/constants';
```

## Testing Strategy

1. Create a separate deployment branch for testing
2. Build with both structures to ensure compatibility
3. Deploy to test environment before updating production

## Rollback Plan

1. Keep the entry point toggle script ready
2. If issues arise, immediately switch back to the original structure
3. Fix issues in the frontend structure before trying again

## Timeline

- Phase 1: Done
- Phase 2-3: Day 1
- Phase 4: Day 2 (test deployment)
- Phase 5: Day 3 (production deployment)
