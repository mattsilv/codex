import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import Button from '../ui/Button';
import ShareButton from '../ui/ShareButton';
import CopyButton from '../ui/CopyButton';

export default function PromptCard({ prompt }) {
  const { id, title, content, isPublic, createdAt, updatedAt } = prompt;
  const [responseCount, setResponseCount] = useState(0);

  useEffect(() => {
    // Get response count from localStorage
    const storedResponses = localStorage.getItem('responses');
    if (storedResponses) {
      const parsedResponses = JSON.parse(storedResponses);
      const count = parsedResponses.filter(
        (response) => response.promptId === id
      ).length;
      setResponseCount(count);
    }
  }, [id]);

  // Use title if available, otherwise truncate content
  const displayTitle =
    title || (content.length > 50 ? `${content.substring(0, 50)}...` : content);

  // Truncate long prompt content
  const truncatedContent =
    content.length > 150 ? `${content.substring(0, 150)}...` : content;

  // Format date for display
  const formattedDate = new Date(createdAt).toLocaleDateString();

  const handleDuplicate = (e) => {
    e.stopPropagation();
    // Duplicate functionality will be implemented later
    console.log('Duplicate prompt:', id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    // Delete functionality will be implemented later
    console.log('Delete prompt:', id);
  };

  return (
    <article
      className="card prompt-card"
      onClick={() => route(`/prompt/${id}`)}
    >
      <header className="prompt-card-header">
        <div className="prompt-meta flex-start gap-sm">
          <span className={`status-badge ${isPublic ? 'public' : 'private'}`}>
            {isPublic ? 'Public' : 'Private'}
          </span>
          <span className="prompt-date text-xs text-muted">
            {formattedDate}
          </span>
        </div>

        <h3 className="prompt-title">{displayTitle}</h3>
      </header>

      <div className="prompt-preview">{truncatedContent}</div>

      <footer className="prompt-card-footer">
        <div className="prompt-stats">
          <span className="response-count">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {responseCount}
          </span>
        </div>

        <div className="action-buttons">
          <CopyButton content={content} className="action-button" />

          {isPublic && <ShareButton id={id} className="action-button" />}

          <button
            className="action-button"
            onClick={handleDuplicate}
            aria-label="Duplicate prompt"
            title="Duplicate prompt"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 16L12 20L4 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 12L12 16L4 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 8L12 12L4 8L12 4L20 8Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            className="action-button action-delete"
            onClick={handleDelete}
            aria-label="Delete prompt"
            title="Delete prompt"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 6H5H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </footer>
    </article>
  );
}
