import { route } from 'preact-router';
import Button from '../ui/Button';
import ShareButton from '../ui/ShareButton';

export default function PromptCard({ prompt }) {
  const { id, title, content, isPublic, createdAt, updatedAt } = prompt;
  
  // Use title if available, otherwise truncate content
  const displayTitle = title || (content.length > 50 ? `${content.substring(0, 50)}...` : content);
  
  // Truncate long prompt content
  const truncatedContent = content.length > 150
    ? `${content.substring(0, 150)}...`
    : content;
    
  // Format date for display
  const formattedDate = new Date(createdAt).toLocaleDateString();
  
  return (
    <article className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div>
          {isPublic ? (
            <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
              Public
            </span>
          ) : (
            <span style={{ backgroundColor: 'var(--muted-color)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
              Private
            </span>
          )}
        </div>
        <small>Created: {formattedDate}</small>
      </div>
      
      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>{displayTitle}</h3>
      
      <p style={{ marginBottom: '1rem', color: 'var(--muted-color)' }}>{truncatedContent}</p>
      
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button 
          onClick={() => route(`/prompt/${id}`)}
          variant="primary"
        >
          View
        </Button>
        
        {isPublic && (
          <ShareButton id={id} />
        )}
      </div>
    </article>
  );
}