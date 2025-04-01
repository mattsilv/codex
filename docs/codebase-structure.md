# Codex Codebase Structure

This document explains the structure of the Codex codebase after reorganization.

## Directory Structure

The main directories in the codebase are:

- `/src/frontend` - Frontend application (Preact)
- `/src/backend` - Backend application (Cloudflare Workers)
- `/src/shared` - Shared code between frontend and backend

## Frontend Structure

The frontend follows a component-based architecture:

- `components/` - UI components organized by feature
  - `layout/` - Page layouts and structural components
  - `auth/` - Authentication-related components
  - `prompt/` - Prompt management components
  - `response/` - Response components
  - `ui/` - Generic UI elements
- `pages/` - Top-level route components
- `hooks/` - Custom React hooks for shared logic
- `context/` - React context providers for state management
- `utils/` - Utility functions
- `styles/` - CSS stylesheets

## Backend Structure

The backend is organized as follows:

- `api/` - API route handlers
- `db/` - Database schemas and clients
- `middleware/` - Express-like middleware
- `utils/` - Utility functions

## Build System

- The application uses Vite for bundling
- The entry point is `/src/index.jsx` which imports from the frontend directory
- Cloudflare Workers are used for the backend
- Cloudflare Pages are used for the frontend

## Deployment

- Frontend deployment: `./deploy-frontend.sh`
- Backend deployment: `npm run deploy:backend`
