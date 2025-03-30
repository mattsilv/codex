# CLAUDE.md: Agent Instructions

## Build Commands
- **Install**: `pnpm install`
- **Dev**: `pnpm dev`
- **Build**: `pnpm build`
- **Preview**: `pnpm preview`
- **Lint**: `pnpm lint`

## Code Style Guidelines
- **Framework**: Preact with functional components
- **CSS**: PicoCSS (minimal customization in styles/custom.css)
- **Storage**: LocalStorage for MVP (simulates API calls)
- **Formatting**: 2-space indentation, single quotes
- **Imports**: Group by: 1) Libraries 2) Components 3) Hooks 4) Utils
- **State Management**: Preact Context API & custom hooks
- **Naming**: Components = PascalCase, functions/variables = camelCase
- **Error Handling**: Try/catch with toast notifications

## Directory Organization
- **components/**: Reusable UI by feature area
  - layout/ - Structural components
  - auth/ - Login/registration
  - prompt/ - Prompt management
  - response/ - Response components
  - ui/ - Generic UI elements
- **pages/**: Top-level route components
- **hooks/**: Shared business logic
- **utils/**: Helper functions
- **context/**: State management providers

## Key Features
- User authentication (localStorage-based for MVP)
- Create public/private prompts
- Add responses from different LLMs
- Markdown detection and rendering
- Sharing public prompts via links