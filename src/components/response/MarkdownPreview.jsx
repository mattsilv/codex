export default function MarkdownPreview({
  rawContent,
  renderedContent,
  isMarkdown,
  isEditing = false,
  onChange,
  error
}) {
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
          style={{ width: '100%' }}
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
            style={{ width: '100%', marginBottom: '1rem' }}
          ></textarea>
          <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: renderedContent }}></div>
        </>
      ) : isMarkdown ? (
        <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: renderedContent }}></div>
      ) : (
        <div className="markdown-preview" style={{ whiteSpace: 'pre-wrap' }}>{rawContent}</div>
      )}
      
      {error && <small className="error">{error}</small>}
    </>
  );
}