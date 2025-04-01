// Environment detection helper function
export const isProduction: boolean = (function () {
  // Check hostname directly for production domains
  const hostname =
    typeof window !== 'undefined' ? window.location.hostname : '';

  // Check for ENVIRONMENT in Cloudflare Workers context
  let isEnvProduction = false;
  if (typeof self !== 'undefined') {
    try {
      // Safely access potentially undefined property
      const env = self as { ENVIRONMENT?: string };
      isEnvProduction = env.ENVIRONMENT === 'production';
    } catch (error) {
      // Silently fail if property isn't accessible
    }
  }

  // Explicitly check for production domains
  return (
    hostname === 'codex.silv.app' ||
    hostname.includes('codex-abq.pages.dev') ||
    (isEnvProduction &&
      hostname !== 'localhost' &&
      !hostname.includes('127.0.0.1') &&
      !hostname.includes('.local'))
  );
})();

// API endpoints
export const API_URL: string = (function () {
  // Use production API for production environments
  if (isProduction) {
    return 'https://api.codex.silv.app';
  }

  // Default to localhost for development
  return 'http://localhost:8787/api';
})();

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'codex_token',
  USER: 'codex_user',
  PROMPTS: 'prompts', // legacy key for localStorage
  RESPONSES: 'responses', // legacy key for localStorage
};

// Default LLM models
export const DEFAULT_MODELS: string[] = [
  'GPT-3.5 Turbo',
  'GPT-4',
  'GPT-4 Turbo',
  'GPT-4o',
  'Claude 3 Opus',
  'Claude 3 Sonnet',
  'Claude 3 Haiku',
  'Claude 3.5 Sonnet',
  'Llama 3 70B',
  'Llama 3 8B',
  'Gemini Pro',
  'Gemini Ultra',
  'Mistral Large',
  'Mistral Medium',
  'Mistral Small',
];
