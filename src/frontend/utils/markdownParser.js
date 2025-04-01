import { marked } from 'marked';

// Configure marked for safe rendering
marked.setOptions({
  gfm: true,
  breaks: true,
  sanitize: true,
});

export function parseMarkdown(markdown) {
  if (!markdown) return '';
  return marked.parse(markdown);
}

export function sanitizeHtml(html) {
  // Simple sanitization for MVP
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, 'nojavascript:');
}
