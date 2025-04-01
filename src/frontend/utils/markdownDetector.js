// Simple utility to detect if a string contains markdown
export function detectMarkdown(text) {
  if (!text) return false;

  // Check for common markdown patterns
  const patterns = [
    /^#+\s/m, // Headers
    /\*\*.*\*\*/, // Bold
    /\*.*\*/, // Italic
    /\[.*\]\(.*\)/, // Links
    /^>\s/m, // Blockquotes
    /^-\s/m, // Lists
    /^\d+\.\s/m, // Ordered lists
    /^```[\s\S]*```/m, // Code blocks
    /`.*`/, // Inline code
    /^\|(.+\|)+$/m, // Tables
    /^\s*---+\s*$/m, // Horizontal rules
  ];

  return patterns.some((pattern) => pattern.test(text));
}
