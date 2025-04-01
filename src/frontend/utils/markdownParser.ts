import { marked } from 'marked';

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

export function parseMarkdown(markdown: string | null | undefined): string {
  if (!markdown) return '';
  return marked.parse(markdown);
}

export function sanitizeHtml(html: string): string {
  // Simple sanitization for MVP
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, 'nojavascript:');
}
