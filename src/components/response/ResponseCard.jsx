import { useState, useContext } from 'preact/hooks';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import MarkdownPreview from './MarkdownPreview';
import useResponses from '../../hooks/useResponses';
import { AppContext } from '../../context/AppContext';

export default function ResponseCard({ response, promptId }) {
  const { deleteResponse } = useResponses(promptId);
  const { showToast } = useContext(AppContext);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState(response.isMarkdown ? 'rendered' : 'raw');
  
  const { id, modelName, rawContent, cleanContent, isMarkdown } = response;
  
  const handleDelete = async () => {
    try {
      await deleteResponse(id);
      showToast('Response deleted successfully', 'success');
      setIsConfirmingDelete(false);
    } catch (error) {
      console.error('Error deleting response:', error);
      showToast('Failed to delete response', 'error');
    }
  };
  
  const toggleViewMode = () => {
    setViewMode(viewMode === 'raw' ? 'rendered' : 'raw');
  };
  
  return (
    <article className="card" style={{ padding: '1rem' }}>
      <div className="model-label">{modelName}</div>
      
      <div 
        className={`content-preview ${isExpanded ? 'expanded' : ''}`} 
        style={{ 
          overflow: 'hidden',
          maxHeight: isExpanded ? 'none' : '150px',
          marginBottom: '1rem',
          position: 'relative'
        }}
      >
        <MarkdownPreview
          rawContent={rawContent}
          renderedContent={cleanContent}
          isMarkdown={isMarkdown && viewMode === 'rendered'}
        />
        
        {!isExpanded && (
          <div style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            height: '50px', 
            background: 'linear-gradient(transparent, var(--card-background-color))' 
          }}></div>
        )}
      </div>
      
      <div className="action-buttons">
        <Button 
          onClick={() => setIsExpanded(!isExpanded)} 
          variant="outline" 
          style={{ fontSize: '0.875rem' }}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </Button>
        
        {isMarkdown && (
          <Button 
            onClick={toggleViewMode} 
            variant="outline" 
            style={{ fontSize: '0.875rem' }}
          >
            {viewMode === 'rendered' ? 'Show Raw' : 'Show Rendered'}
          </Button>
        )}
        
        <Button 
          onClick={() => setIsFullscreen(true)} 
          variant="outline" 
          style={{ fontSize: '0.875rem' }}
        >
          Fullscreen
        </Button>
        
        <Button 
          onClick={() => setIsConfirmingDelete(true)} 
          variant="outline" 
          style={{ fontSize: '0.875rem' }}
        >
          Delete
        </Button>
      </div>
      
      {/* Fullscreen Modal */}
      <Modal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        title={`${modelName} Response`}
      >
        <div style={{ marginBottom: '1rem' }}>
          {isMarkdown && (
            <Button 
              onClick={toggleViewMode} 
              variant="outline"
            >
              {viewMode === 'rendered' ? 'Show Raw' : 'Show Rendered'}
            </Button>
          )}
        </div>
        
        <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
          <MarkdownPreview
            rawContent={rawContent}
            renderedContent={cleanContent}
            isMarkdown={isMarkdown && viewMode === 'rendered'}
          />
        </div>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        title="Confirm Delete"
      >
        <div>
          <p>Are you sure you want to delete this response? This action cannot be undone.</p>
          <div className="action-buttons" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button onClick={handleDelete} variant="contrast">Delete</Button>
            <Button onClick={() => setIsConfirmingDelete(false)} variant="outline">Cancel</Button>
          </div>
        </div>
      </Modal>
    </article>
  );
}