/**
 * MarkdownPreview Component - Handles rendering of markdown content
 *
 * @param {string} rawContent - Raw text/markdown content
 * @param {string} renderedContent - HTML from rendered markdown
 * @param {boolean} isMarkdown - Whether content should be treated as markdown
 * @param {boolean} isEditing - Whether in editing mode (shows textarea)
 * @param {function} onChange - Change handler for textarea in edit mode
 * @param {string} error - Error message to display
 * @param {string} size - Size variant: 'small', 'medium', 'large'
 * @param {boolean} compact - Whether to use compact spacing
 */
export default function MarkdownPreview({
  rawContent,
  renderedContent,
  isMarkdown,
  isEditing = false,
  onChange,
  error,
  size = 'medium',
  compact = false,
}) {
  // Create class names based on size and compact props
  const markdownClassName = `markdown-preview${
    size === 'small'
      ? ' markdown-small'
      : size === 'large'
        ? ' markdown-large'
        : ''
  }${compact ? ' markdown-compact' : ''}`;

  return (
    <>
      {isEditing && !isMarkdown ? (
        <textarea
          name="content"
          value={rawContent}
          onChange={onChange}
          rows={10}
          placeholder="Paste your response here..."
          required
          aria-invalid={error ? 'true' : 'false'}
          className="content-textarea"
        ></textarea>
      ) : isEditing && isMarkdown ? (
        <>
          <textarea
            name="content"
            value={rawContent}
            onChange={onChange}
            rows={10}
            placeholder="Paste your response here..."
            required
            aria-invalid={error ? 'true' : 'false'}
            className="content-textarea mb-md"
          ></textarea>
          <div className={markdownClassName}>
            <h4 className="preview-heading">Preview:</h4>
            <div
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            ></div>
          </div>
        </>
      ) : isMarkdown ? (
        <div className={markdownClassName}>
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          ></div>
        </div>
      ) : (
        <div className={markdownClassName} style={{ whiteSpace: 'pre-wrap' }}>
          {rawContent}
        </div>
      )}

      {error && <small className="error">{error}</small>}
    </>
  );
}
