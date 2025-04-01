# Codex Project Tasks

## HIGH PRIORITY

### DNS & Production Setup (COMPLETE ✅)

- [x] Create production R2 bucket in Cloudflare dashboard
- [x] Configure custom domain in Cloudflare dashboard for Worker
- [x] Set CNAME record for codex.silv.app pointing to Cloudflare Pages
- [x] Set CNAME record for api.codex.silv.app pointing to Cloudflare Workers
- [x] Create Pages project named "codex" in Cloudflare dashboard
- [x] Deploy frontend to Cloudflare Pages
- [x] Verify cross-origin communication between domains

### New Layout & UI Improvements

- [x] Implement Tailwind CSS in the project
  - [x] Install Tailwind CSS and dependencies
  - [x] Create tailwind.config.js
  - [x] Set up PostCSS configuration
  - [x] Add Tailwind directives to CSS
  - [x] Convert layout components to Tailwind (Header, Footer, MainLayout, Sidebar)
- [x] Convert UI components to Tailwind
  - [x] Button.jsx - Base button component
  - [x] Input.jsx - Form input component
  - [x] Toast.jsx - Notification component
  - [x] Modal.jsx - Dialog component
  - [x] ToggleSwitch.jsx - Toggle UI component
  - [x] CopyButton.jsx - Clipboard functionality
  - [x] ShareButton.jsx - Share functionality
  - [x] LoadingState.jsx - Loading indicators
  - [x] MigrationBanner.jsx - Data migration UI
- [x] Convert form components to Tailwind
  - [x] LoginForm.jsx - User login form
  - [x] RegisterForm.jsx - User registration form
  - [x] ResponseForm.jsx - LLM response form
- [x] Create responsive prompt detail view
- [x] Create improved empty state visuals for lists

### Critical Backend Issues

- [x] Fix backend server startup issues with Cloudflare Workers
- [x] Test all API endpoints with the debug-navigation.ts script
- [x] Verify D1 database migrations apply correctly

### New Critical Issues

- [x] Fix authentication issues with JWT in Cloudflare Workers environment
- [x] Implement proper error handling for API endpoints
- [x] Create service layer for business logic separation
- [x] Standardize error handling across the application

## MEDIUM PRIORITY

### Cloudflare Workers Migration

- [x] Migrate backend code to be fully Cloudflare Workers compatible
- [x] Add .js extensions to all import statements
- [x] Replace bcryptjs with Web Crypto API for authentication
- [x] Fix R2 storage access using proper env bindings
- [ ] Test each endpoint incrementally

### Authentication System

- [x] Create simplified password hashing function for Workers environment
- [x] Test JWT token generation in Workers environment
- [x] Update login/registration forms to work with the new backend
- [x] Implement secure password hashing with salt
- [x] Add password complexity requirements
- [x] Implement rate limiting for login attempts
- [ ] Implement secure session management
- [ ] Add email verification for new accounts
- [ ] Implement CSRF protection
- [ ] Add security headers (Content-Security-Policy, X-XSS-Protection)
- [ ] Create password reset functionality
- [ ] Add terms of service and privacy policy to registration
- [ ] Implement proper JWT secret management for production

### Data Migration

- [x] Implement localStorage to backend database migration (/src/frontend/utils/migrateLegacyData.js)
- [x] Add progress indicators for migration process (/src/frontend/components/ui/MigrationBanner.jsx)
- [x] Ensure proper error handling for migration failures
- [x] Add migration completion notifications in the UI (/src/frontend/components/ui/Toast.jsx)
- [x] Create detailed migration logs for troubleshooting (/src/frontend/utils/migrateLegacyData.ts)
- [ ] Test migration functionality once login is working

## LOW PRIORITY

### TypeScript Migration

- [x] Configure ESLint for TypeScript (/.eslintrc.json)
- [x] Create types for database schema (/src/backend/utils/auth.ts)
- [x] Add type definitions for API responses (/src/frontend/utils/api.ts)
- [x] Improve tsconfig.json configuration (/tsconfig.json)
- [x] Create TypeScript versions of key utility files:
  - [x] /src/shared/constants.ts
  - [x] /src/frontend/utils/api.ts
  - [x] /src/frontend/utils/migrateLegacyData.ts
- [x] Start migrating frontend components to TypeScript (.jsx -> .tsx)
  - [x] Convert Auth component (/src/frontend/pages/Auth.jsx -> Auth.tsx)
  - [x] Convert Button component (/src/frontend/components/ui/Button.jsx -> Button.tsx)
  - [x] Convert Input component (/src/frontend/components/ui/Input.jsx -> Input.tsx)
  - [x] Convert LoginForm component (/src/frontend/components/auth/LoginForm.jsx -> LoginForm.tsx)
  - [x] Convert MigrationBanner component (/src/frontend/components/ui/MigrationBanner.jsx -> MigrationBanner.tsx)
  - [x] Convert Toast components and context:
    - [x] Toast.jsx -> Toast.tsx
    - [x] ToastContext.jsx -> ToastContext.tsx
    - [x] useToast.js -> useToast.ts
  - [ ] Convert remaining UI components:
    - [x] Modal.jsx -> Modal.tsx
    - [ ] Header.jsx -> Header.tsx
    - [ ] Footer.jsx -> Footer.tsx
    - [ ] Sidebar.jsx -> Sidebar.tsx
- [ ] Start migrating backend code to TypeScript (.js -> .ts)
  - [ ] Convert auth API (/src/backend/api/auth.js -> auth.ts)
  - [ ] Convert prompts API (/src/backend/api/prompts.js -> prompts.ts)
  - [ ] Convert responses API (/src/backend/api/responses.js -> responses.ts)
- [ ] Create TypeScript interfaces for database models (/src/backend/db/schema.ts)
- [ ] Create shared type definitions file for common types (/src/shared/types.ts)

### Development Environment

- [ ] Create TypeScript-aware development workflow
- [ ] Add linting and type checking to pre-commit hooks
- [ ] Document development environment setup process

### Testing

- [ ] Implement end-to-end testing strategy
- [ ] Create API test suite with debug-navigation.js
- [ ] Set up frontend component testing with TypeScript
- [ ] Create integration tests for critical user flows
- [ ] Implement CI/CD pipeline for automatic testing

### Cloudflare Workers Best Practices

- [ ] Ensure all backend code follows Cloudflare Workers best practices
- [ ] Avoid Node.js-specific features and APIs
- [ ] Use Web APIs for crypto, storage, and other utilities
- [ ] Implement proper error handling for Workers environment

## Gemini 2.5 TODO

### High Priority Tasks

1. **Fix Linting & Type Issues**
   - [x] Fix TypeScript `any` types in `src/frontend/utils/api.ts` (lines 35:14, 62:14)
   - [x] Fix TypeScript `any` type in `src/frontend/utils/auth.ts` (line 7:18)
   - [x] Fix TypeScript error in `src/shared/constants.ts` (safe access to self.ENVIRONMENT property)
   - [ ] Run console log fix script: `node /Users/m/gh/codex/scripts/fix-console-logs.js`
   - [ ] Fix TypeScript `any` types in `src/frontend/utils/dataMigration.ts` (lines 7:47, 10:69, 19:18, 26:18, 53:18, 62:18)
   - [ ] Fix TypeScript `any` types in `src/frontend/utils/migrateLegacyData.ts` (lines 20:14, 322:19)
   - [ ] Add more strict type definitions in backend files by creating proper interfaces

2. **Fix Code Quality Issues**
   - [ ] Fix unused variables with underscore prefix in components:
     - `src/frontend/pages/Dashboard.jsx` - Line 10:11: 'user' → '_user'
     - `src/frontend/pages/PromptDetail.jsx` - Line 12:8: 'useMarkdown' → '_useMarkdown'
     - `src/frontend/pages/PromptDetail.jsx` - Line 22:11: 'user' → '_user'
     - `src/frontend/pages/PromptDetail.jsx` - Line 412:23: 'newResponse' → '_newResponse'
     - `src/frontend/pages/Settings.jsx` - Line 10:17: 'login' → '_login'
   - [ ] Address remaining warnings in integration test files

### Frontend Cleanup

- [ ] Delete legacy Pico CSS file: `src/frontend/styles/custom.css` (Replaced by Tailwind)
- [ ] Delete legacy Pico CSS file: `src/frontend/styles/variables.css` (Replaced by Tailwind)
- [ ] Delete legacy Pico CSS file: `src/frontend/styles/buttons.css` (Replaced by Tailwind)
- [ ] Delete legacy Pico CSS file: `src/frontend/styles/layout.css` (Replaced by Tailwind)
- [ ] Delete legacy Pico CSS file: `src/frontend/styles/forms.css` (Replaced by Tailwind)
- [ ] Delete legacy Pico CSS file: `src/frontend/styles/markdown.css` (Replaced by Tailwind)
- [ ] Delete legacy Pico CSS file: `src/frontend/styles/loading.css` (Replaced by Tailwind)

### Backend Improvements

- [ ] Add `authenticateRequest` function to `src/backend/utils/auth.ts` (To handle token extraction and verification using `verifyToken`)
- [ ] Ensure `src/backend/index.ts` correctly imports `authenticateRequest` from `./utils/auth.js` and resolves linter error.
- [ ] Add robust error handling to all API endpoints following the pattern in `src/backend/api/auth.js`

### Frontend TypeScript Migration & Cleanup

- **Duplicate Files (Delete):**
  - [ ] `src/frontend/context/ToastContext.jsx`
  - [ ] `src/frontend/hooks/useToast.js`
  - [ ] `src/frontend/pages/Auth.jsx`
  - [ ] `src/frontend/utils/api.js`
  - [ ] `src/frontend/utils/migrateLegacyData.js`
- **Context Files (Convert to .tsx):**
  - [ ] `src/frontend/context/AuthContext.jsx`
  - [ ] `src/frontend/context/AppContext.jsx`
- **Hook Files (Convert to .ts):**
  - [ ] `src/frontend/hooks/useResponses.js`
  - [ ] `src/frontend/hooks/usePrompts.js`
  - [ ] `src/frontend/hooks/useMarkdown.js`
  - [ ] `src/frontend/hooks/useAuth.js`
- **Page Files (Convert to .tsx):**
  - [ ] `src/frontend/pages/Verify.jsx`
  - [ ] `src/frontend/pages/PromptDetail.jsx`
  - [ ] `src/frontend/pages/Settings.jsx`
  - [ ] `src/frontend/pages/NotFound.jsx`
  - [ ] `src/frontend/pages/Home.jsx`
  - [ ] `src/frontend/pages/Dashboard.jsx`
  - [ ] `src/frontend/pages/SharedPrompt.jsx`
  - [ ] `src/frontend/pages/PromptCreate.jsx`
- **Utility Files (Convert to .ts):**
  - [ ] `src/frontend/utils/auth.js`
  - [ ] `src/frontend/utils/dataMigration.js`
  - [ ] `src/frontend/utils/markdownParser.js`
  - [ ] `src/frontend/utils/markdownDetector.js`
- **Component Files (Convert to .tsx - Check subdirs):**
  - [ ] `src/frontend/components/layout/Header.jsx` (Example)
  - [ ] `src/frontend/components/layout/Footer.jsx` (Example)
  - [ ] `src/frontend/components/layout/Sidebar.jsx` (Example)
  - [ ] Review and convert components in `response/` and `prompt/` subdirectories
- **Linter Setup:**
  - [ ] Verify/Install ESLint with TypeScript and React plugins
  - [ ] Configure `.eslintrc.json` rules
  - [ ] Integrate Prettier for code formatting
  - [ ] Add linting script to `package.json`
