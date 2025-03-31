// API endpoints
export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://codex.silv.app/api'
  : 'http://localhost:8787/api';

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'codex_token',
  USER: 'codex_user',
  PROMPTS: 'prompts',  // legacy key for localStorage
  RESPONSES: 'responses', // legacy key for localStorage
};

// Default LLM models
export const DEFAULT_MODELS = [
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