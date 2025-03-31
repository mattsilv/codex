# Codex CSS Framework

This document outlines the CSS architecture and patterns used in the Codex application.

## CSS Structure

The CSS is organized in a modular fashion:

- `custom.css` - Main entry point that imports all other CSS files
- `variables.css` - Contains CSS variables for colors, spacing, typography, etc.
- `buttons.css` - Button styles and variants
- `layout.css` - Layout utilities, grid, flex, spacing
- `markdown.css` - Markdown rendering styles with size variations

## Design Variables

### Typography

```css
--font-xxs: 0.65rem;  /* 10px */
--font-xs: 0.75rem;   /* 12px */
--font-sm: 0.875rem;  /* 14px */
--font-base: 1rem;    /* 16px */
--font-md: 1.125rem;  /* 18px */
--font-lg: 1.25rem;   /* 20px */
--font-xl: 1.5rem;    /* 24px */
--font-xxl: 2rem;     /* 32px */
```

### Spacing

```css
--space-xxs: 0.25rem; /* 4px */
--space-xs: 0.5rem;   /* 8px */
--space-sm: 0.75rem;  /* 12px */
--space-md: 1rem;     /* 16px */
--space-lg: 1.5rem;   /* 24px */
--space-xl: 2rem;     /* 32px */
--space-xxl: 3rem;    /* 48px */
```

### Border Radius

```css
--radius-sm: 0.25rem; /* 4px */
--radius-md: 0.5rem;  /* 8px */
--radius-lg: 1rem;    /* 16px */
```

## Markdown Rendering

Markdown rendering is controlled by the `.markdown-preview` class with size variants:

- `.markdown-small` - 50% of normal size (default for responses)
- Default - Default size (controlled by `--markdown-scale`)
- `.markdown-large` - 70% of normal size (used for fullscreen views)

To adjust the overall size of markdown rendering, modify the `--markdown-scale` variable in `variables.css`.

```css
:root {
  --markdown-scale: 0.5; /* Adjust to make all markdown smaller/larger */
}
```

## Utilities

### Flex

- `.flex-between` - Flexbox with space-between
- `.flex-center` - Centered flexbox
- `.flex-start` - Left-aligned flexbox
- `.flex-column` - Column flexbox

### Spacing

- `.gap-xs`, `.gap-sm`, `.gap-md` - For flex/grid gap
- `.mb-xs`, `.mb-sm`, `.mb-md`, `.mb-lg` - Margin bottom utilities

### Buttons

- `.btn-sm` - Small button
- `.btn-md` - Medium button (default)
- `.btn-lg` - Large button

## Examples

### Markdown Preview with Size Variant

```jsx
<MarkdownPreview
  rawContent={content}
  renderedContent={rendered}
  isMarkdown={true}
  size="small" // or "medium" (default) or "large"
  compact={true} // Optional, for tighter spacing
/>
```

### Button with Size Class

```jsx
<Button
  onClick={handleClick}
  variant="outline" // "primary", "secondary", "contrast", "outline"
  className="btn-sm" // "btn-md" (default), "btn-lg" 
>
  Click Me
</Button>
```

### Layout Example

```jsx
<div className="flex-between mb-md">
  <div className="flex-start gap-sm">
    <span className="status-badge public">Public</span>
    <h2>Title</h2>
  </div>
  <div className="action-buttons">
    <Button className="btn-sm">Action</Button>
  </div>
</div>
```