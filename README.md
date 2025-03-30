# Codex - LLM Prompt Tracker

Codex is a web application for collecting, storing, and comparing responses from different Large Language Models (LLMs) to the same prompts. Users can save prompts, add multiple responses from different LLMs, and optionally share their collections publicly.

## Features

- Create and manage prompts
- Add responses from different LLM models
- Toggle between public and private prompts
- Share prompts with others via a link
- Markdown support for responses
- Toggle between raw and rendered markdown views

## Tech Stack

- **Frontend**: Preact, PicoCSS
- **Storage**: LocalStorage (for MVP)
- **Markdown**: Marked for rendering

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```
4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

The project follows a component-based architecture:

- **components/**: Reusable UI components
  - **layout/**: Layout components (Header, Footer, etc.)
  - **auth/**: Authentication related components
  - **prompt/**: Prompt related components
  - **response/**: Response related components
  - **ui/**: Generic UI components
- **pages/**: Top-level page components
- **hooks/**: Custom hooks for business logic
- **utils/**: Utility functions
- **context/**: Context providers for state management

## Development

- **Development**: `pnpm dev`
- **Build**: `pnpm build`
- **Preview Production Build**: `pnpm preview`

## Future Enhancements

- Backend API integration
- User collections and folders
- Analytics and insights
- Collaboration features
- Export/import functionality