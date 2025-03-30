#!/bin/bash

# Initialize project
pnpm init -y

# Install dependencies
pnpm add preact preact-router @picocss/pico

# Create directory structure
mkdir -p src/components/layout
mkdir -p src/components/auth
mkdir -p src/components/prompt
mkdir -p src/components/response
mkdir -p src/components/ui
mkdir -p src/pages
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/context
mkdir -p src/styles

# Create base files
touch src/index.jsx src/App.jsx src/styles/custom.css

# Create layout components
touch src/components/layout/Header.jsx
touch src/components/layout/Footer.jsx
touch src/components/layout/MainLayout.jsx
touch src/components/layout/AuthLayout.jsx

# Create auth components
touch src/components/auth/LoginForm.jsx
touch src/components/auth/RegisterForm.jsx
touch src/components/auth/PasswordResetForm.jsx

# Create prompt components
touch src/components/prompt/PromptCard.jsx
touch src/components/prompt/PromptForm.jsx
touch src/components/prompt/PromptList.jsx
touch src/components/prompt/PromptDetail.jsx

# Create response components
touch src/components/response/ResponseForm.jsx
touch src/components/response/ResponseCard.jsx
touch src/components/response/ResponseList.jsx
touch src/components/response/MarkdownPreview.jsx

# Create UI components
touch src/components/ui/Button.jsx
touch src/components/ui/Input.jsx
touch src/components/ui/Modal.jsx
touch src/components/ui/Toast.jsx
touch src/components/ui/ShareButton.jsx
touch src/components/ui/ToggleSwitch.jsx

# Create page components
touch src/pages/Home.jsx
touch src/pages/Auth.jsx
touch src/pages/Dashboard.jsx
touch src/pages/PromptCreate.jsx
touch src/pages/PromptDetail.jsx
touch src/pages/SharedPrompt.jsx
touch src/pages/NotFound.jsx

# Create hooks
touch src/hooks/useAuth.js
touch src/hooks/usePrompts.js
touch src/hooks/useResponses.js
touch src/hooks/useMarkdown.js

# Create utility files
touch src/utils/api.js
touch src/utils/auth.js
touch src/utils/markdownDetector.js
touch src/utils/markdownParser.js

# Create context files
touch src/context/AuthContext.jsx
touch src/context/AppContext.jsx

echo "Project scaffolding complete!"