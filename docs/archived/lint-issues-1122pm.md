# Lint Issues Overview

This document provides a consolidated view of the remaining 523 ESLint warnings in the codebase, primarily falling into three categories: `no-console`, `@typescript-eslint/no-unused-vars`, and `@typescript-eslint/no-explicit-any`.

## Warnings by File

### `debug-navigation.ts` (54 warnings)
- `no-explicit-any`: Lines 16, 20, 99, 102
- `no-console`: Lines 128, 130, 150, 153, 154, 173, 178, 183, 199, 204, 216, 227, 232, 240, 245, 260, 265, 273, 278, 287, 290, 300, 316, 324, 339, 343, 349, 361, 364, 374, 388, 403, 407, 414, 427, 452, 453, 485, 486, 489, 492, 495, 498, 508
- `no-unused-vars`: Line 205 ('registrationResponse')

### `scripts/setup/seed-data.js` (12 warnings)
- `no-console`: Lines 4, 7, 10, 13, 14, 15, 16, 17, 21, 22, 23, 24

### `scripts/test-api.js` (7 warnings)
- `no-console`: Lines 5, 16, 17, 24, 26, 53, 60

### `src/backend/api/auth.js` (12 warnings)
- `no-console`: Lines 31, 51, 64, 65, 74, 109, 577, 667, 668, 735
- `no-unused-vars`: Line 61 ('ctx'), Line 834 ('deletedEmailPattern')

### `src/backend/index.ts` (9 warnings)
- `no-explicit-any`: Lines 35, 36, 39, 46, 103, 155, 203, 221
- `no-console`: Line 73

### `src/backend/local-test.js` (7 warnings)
- `no-console`: Lines 122, 395, 401, 414, 437, 438, 440

### `src/backend/middleware/cors.js` (1 warning)
- `no-console`: Line 66

### `src/backend/utils/auth.ts` (1 warning)
- `no-explicit-any`: Line 167

### `src/backend/utils/emailService.js` (1 warning)
- `no-console`: Line 49

### `src/backend/utils/seedTestData.js` (8 warnings)
- `no-unused-vars`: Line 1 ('eq')
- `no-console`: Lines 12, 20, 47, 95, 99, 171, 177

### Frontend Component Warnings
- `src/frontend/components/auth/LoginForm.jsx`: 1 warning (`no-console`: Line 61)
- `src/frontend/components/auth/LoginForm.tsx`: 2 warnings (`no-unused-vars`: Line 1 ('h'), `no-console`: Line 77)
- `src/frontend/components/auth/RegisterForm.jsx`: 1 warning (`no-console`: Line 66)
- `src/frontend/components/layout/Sidebar.jsx`: 1 warning (`no-unused-vars`: Line 6 ('user'))
- `src/frontend/components/prompt/PromptCard.jsx`: 4 warnings (`no-unused-vars`: Lines 3, 8; `no-console`: Lines 37, 43)
- `src/frontend/components/ui/Button.tsx`: 1 warning (`no-explicit-any`: Line 56)
- `src/frontend/components/ui/Input.tsx`: 1 warning (`no-unused-vars`: Line 1 ('h'))
- `src/frontend/components/ui/LoadingState.jsx`: 1 warning (`no-unused-vars`: Line 1 ('h'))
- `src/frontend/components/ui/MigrationBanner.tsx`: 2 warnings (`no-unused-vars`: Lines 1, 8)
- `src/frontend/components/ui/Modal.tsx`: 1 warning (`no-unused-vars`: Line 1 ('h'))
- `src/frontend/components/ui/Toast.tsx`: 1 warning (`no-unused-vars`: Line 1 ('h'))

### Context Warnings
- `src/frontend/context/AppContext.tsx`: 1 warning (`no-unused-vars`: Line 1 ('h'))
- `src/frontend/context/AuthContext.jsx`: 14 warnings (13 `no-console`, 1 `no-unused-vars`)
- `src/frontend/context/AuthContext.tsx`: 15 warnings (1 `no-unused-vars`: Line 1, 1 `no-explicit-any`, 13 `no-console`)
- `src/frontend/context/ToastContext.tsx`: 1 warning (`no-unused-vars`: Line 1 ('h'))

### Hooks Warnings
- `src/frontend/hooks/usePrompts.ts`: 2 warnings (`no-explicit-any`: Lines 12, 19)
- `src/frontend/hooks/useResponses.js`: 1 warning (`no-unused-vars`: Line 5 ('user'))
- `src/frontend/hooks/useResponses.ts`: 3 warnings (`no-explicit-any`: Lines 11, 17; `no-unused-vars`: Line 34)

### Pages Warnings
- `src/frontend/pages/Auth.tsx`: 12 warnings (6 `no-unused-vars`, 6 `no-console`)
- `src/frontend/pages/Dashboard.jsx`: 1 warning (`no-unused-vars`: Line 10 ('user'))
- `src/frontend/pages/PromptDetail.jsx`: 3 warnings (`no-unused-vars`: Lines 12, 22, 412)
- `src/frontend/pages/Settings.jsx`: 1 warning (`no-unused-vars`: Line 10 ('login'))

### Utils Warnings
- `src/frontend/test-helpers.js`: 19 warnings (all `no-console`)
- `src/frontend/utils/api.ts`: 2 warnings (`no-explicit-any`: Lines 35, 62)
- `src/frontend/utils/auth.ts`: 1 warning (`no-explicit-any`: Line 7)
- `src/frontend/utils/dataMigration.js`: 2 warnings (`no-console`: Lines 55, 86)
- `src/frontend/utils/dataMigration.ts`: 8 warnings (6 `no-explicit-any`, 2 `no-console`)
- `src/frontend/utils/migrateLegacyData.ts`: 8 warnings (2 `no-explicit-any`, 6 `no-console`)

### Shared and Root Warnings
- `src/shared/constants.ts`: 1 warning (`no-explicit-any`: Line 12)
- `test-api.js`: 18 warnings (all `no-console`)
- `worker.js`: 3 warnings (1 `no-unused-vars`, 2 `no-console`)
- `worker.ts`: 1 warning (`no-unused-vars`: Line 40 ('ctx'))

### Test Warnings
- Multiple test files with primarily `no-console` warnings
- `tests/debug/debug-backend.js`: 12 warnings
- `tests/e2e/test-registration-login.js`: 78 warnings
- `tests/integration/test-account.js`: 34 warnings
- `tests/integration/test-create-user.js`: 44 warnings
- `tests/unit/simple-test.js`: 24 warnings

## Recommended Approach

1. Fix `no-unused-vars` warnings by removing unused imports or prefixing with underscore
2. Fix `no-explicit-any` warnings by adding proper type definitions
3. Address `no-console` warnings by:
   - Removing debug logs in production code
   - Using proper logging utilities
   - Adding ESLint exceptions for test/debug files