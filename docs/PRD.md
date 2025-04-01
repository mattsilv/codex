# LLM Prompt Tracker MVP - Product Requirements Document

## 1. Product Overview

A web application for collecting, storing, and comparing responses from different Large Language Models (LLMs) to the same prompts. Users can save prompts, add multiple responses from different LLMs, and optionally share their collections publicly.

### 1.1 Core Value Proposition

- Compare how different LLMs respond to identical prompts
- Build a library of effective prompts and their outcomes
- Share prompt-response sets with others (optional)

### 1.2 Target Users

- AI researchers and enthusiasts
- Prompt engineers
- Content creators using LLMs
- Developers evaluating LLM performance

## 2. Technology Stack

### 2.1 Frontend

- **Framework**: Preact (lightweight React alternative)
- **CSS Framework**: PicoCSS (classless, minimal-decision framework)
- **Routing**: Preact Router
- **State Management**: Preact Context API (no Redux for MVP)

### 2.2 Backend

- **API**: RESTful endpoints via serverless functions
- **Authentication**: JWT token-based auth
- **Database**: SQLite (future migration path to Cloudflare D1)
- **Deployment**: Netlify for hosting and serverless functions

## 3. Data Model

### 3.1 User

```
User {
  id: UUID (primary key)
  username: String (unique)
  email: String (unique)
  passwordHash: String
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 3.2 Prompt

```
Prompt {
  id: UUID (primary key)
  userId: UUID (foreign key)
  content: Text
  isPublic: Boolean (default: false)
  createdAt: DateTime
  updatedAt: DateTime
  tags: String[] (underlying storage only, not surfaced in MVP UI)
}
```

### 3.3 Response

```
Response {
  id: UUID (primary key)
  promptId: UUID (foreign key)
  modelName: String (e.g., "LLaMA 3.1", "ChatGPT-4.0", "Gemini 2.5")
  rawContent: Text (exactly as pasted)
  cleanContent: Text (processed markdown)
  isMarkdown: Boolean
  wasAutoDetected: Boolean (whether format was auto-detected)
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 4. Component Architecture

### 4.1 Directory Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── MainLayout.jsx
│   │   └── AuthLayout.jsx
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── PasswordResetForm.jsx
│   ├── prompt/
│   │   ├── PromptCard.jsx
│   │   ├── PromptForm.jsx
│   │   ├── PromptList.jsx
│   │   └── PromptDetail.jsx
│   ├── response/
│   │   ├── ResponseForm.jsx
│   │   ├── ResponseCard.jsx
│   │   ├── ResponseList.jsx
│   │   └── MarkdownPreview.jsx
│   └── ui/
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Modal.jsx
│       ├── Toast.jsx
│       ├── ShareButton.jsx
│       └── ToggleSwitch.jsx
├── pages/
│   ├── Home.jsx
│   ├── Auth.jsx
│   ├── Dashboard.jsx
│   ├── PromptCreate.jsx
│   ├── PromptDetail.jsx
│   ├── SharedPrompt.jsx
│   └── NotFound.jsx
├── hooks/
│   ├── useAuth.js
│   ├── usePrompts.js
│   ├── useResponses.js
│   └── useMarkdown.js
├── utils/
│   ├── api.js
│   ├── auth.js
│   ├── markdownDetector.js
│   └── markdownParser.js
├── context/
│   ├── AuthContext.jsx
│   └── AppContext.jsx
├── styles/
│   └── custom.css (minimal overrides for PicoCSS)
├── App.jsx
└── index.jsx
```

### 4.2 Component Breakdown

#### 4.2.1 Layout Components

- **MainLayout**: Provides structure for authenticated pages
- **AuthLayout**: Provides structure for login/registration pages
- **Header**: Navigation, user info, logout button
- **Footer**: Basic footer with links and copyright

#### 4.2.2 Page Components

- **Home**: Landing page with app description
- **Auth**: Container for login/register forms
- **Dashboard**: Main user dashboard showing prompts
- **PromptCreate**: Form page for creating prompts
- **PromptDetail**: View of prompt with responses
- **SharedPrompt**: Public view of shared prompts
- **NotFound**: 404 page

#### 4.2.3 Core Feature Components

- **PromptCard**: Card display of a prompt in a list
- **PromptForm**: Form for creating/editing prompts
- **PromptList**: List view of user's prompts
- **ResponseForm**: Form for adding responses
- **ResponseCard**: Card display of a response
- **ResponseList**: List of responses for a prompt
- **MarkdownPreview**: Toggle between raw/rendered views

#### 4.2.4 Reusable UI Components

- **Button**: Styled buttons with variants
- **Input**: Form input fields
- **Modal**: Popup dialogs
- **Toast**: Notification messages
- **ShareButton**: For generating/copying share links
- **ToggleSwitch**: For binary options (e.g., public/private)

## 5. User Workflows

### 5.1 Authentication Flow

1. User arrives at landing page
2. User clicks "Login" or "Register"
3. User completes form
4. System authenticates and redirects to dashboard

### 5.2 Prompt Creation Flow

1. From dashboard, user clicks "Create New Prompt"
2. User enters prompt text
3. User toggles public/private status
4. User clicks "Save Prompt"
5. System redirects to prompt detail page

### 5.3 Response Addition Flow

1. From prompt detail page, user clicks "Add Response"
2. User selects LLM model from dropdown
3. User pastes response
4. System auto-detects whether content is markdown or plain text
5. User can preview both raw and rendered versions
6. User clicks "Save Response"
7. System adds response to the prompt detail page

### 5.4 Sharing Flow

1. For public prompts, user clicks "Share" button
2. System generates a shareable link
3. User copies link to clipboard

## 6. API Endpoints

### 6.1 Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/reset-password`

### 6.2 Prompts

- `GET /api/prompts` - List user's prompts
- `POST /api/prompts` - Create new prompt
- `GET /api/prompts/:id` - Get single prompt
- `PUT /api/prompts/:id` - Update prompt
- `DELETE /api/prompts/:id` - Delete prompt
- `GET /api/prompts/shared/:id` - Get shared prompt (no auth)

### 6.3 Responses

- `GET /api/prompts/:promptId/responses` - List responses
- `POST /api/prompts/:promptId/responses` - Add response
- `PUT /api/responses/:id` - Update response
- `DELETE /api/responses/:id` - Delete response

## 7. PicoCSS Integration

### 7.1 Implementation

```javascript
// In index.jsx or equivalent
import '@picocss/pico';
```

### 7.2 Custom Theming

- Minimal custom CSS with variables for branding
- Dark/light mode toggle using data attributes

### 7.3 Form Styling Benefits

- Clean, accessible form controls out of the box
- Consistent styling across all inputs
- Built-in validation states
- Responsive by default

## 8. Markdown Processing

### 8.1 Detection Logic

- Client-side detection of markdown syntax patterns
- Simple function to check for common markdown elements
- Default to treating as markdown if detected

### 8.2 Rendering

- Store both raw and processed content
- Lightweight markdown parser for rendering
- Sanitization of user input

## 9. CEO Decision Points

### 9.1 Brand Identity

- **[DECISION NEEDED]**: Brand colors for minimal theming
- **[DECISION NEEDED]**: Logo/name presentation

### 9.2 Model Selection

- **[DECISION NEEDED]**: Initial list of LLM models to include in dropdown
- **[DECISION NEEDED]**: Categorization structure (if any)

### 9.3 Authentication Strategy

- **[DECISION NEEDED]**: Email verification requirement (yes/no)
- **[DECISION NEEDED]**: Password requirements/complexity

### 9.4 MVP Feature Prioritization

- **[DECISION NEEDED]**: If timelines require further scope reduction, which features to cut first?

## 10. Deployment Strategy

### 10.1 Netlify Configuration

```
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### 10.2 Database Setup

- SQLite for development and initial production
- Migration path to Cloudflare D1 defined but not implemented in MVP

### 10.3 CI/CD

- Automatic deploys from main branch
- Environment variables managed in Netlify dashboard

## 11. MVP Limitations and Future Considerations

### 11.1 MVP Limitations

- No collections/folders for organizing prompts
- No analytics or insights on prompts/responses
- Basic sharing functionality only
- Limited model categorization
- No collaboration features

### 11.2 Future Roadmap (Not MVP)

- Google SSO integration
- Advanced organization with collections and folders
- Analytics dashboard for prompt/response metrics
- Model provider tracking (distinguish between hosts)
- Automated tagging and categorization
- Collaboration features
- Export/import functionality
