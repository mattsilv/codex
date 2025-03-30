import { useState, useEffect, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ShareButton from '../components/ui/ShareButton';
import ResponseForm from '../components/response/ResponseForm';
import ResponseList from '../components/response/ResponseList';
import MarkdownPreview from '../components/response/MarkdownPreview';
import usePrompts from '../hooks/usePrompts';
import useResponses from '../hooks/useResponses';
import useMarkdown from '../hooks/useMarkdown';
import { AppContext } from '../context/AppContext';
import useAuth from '../hooks/useAuth';
import { detectMarkdown } from '../utils/markdownDetector';
import { marked } from 'marked';

export default function PromptDetail({ id }) {
  const { getPrompt, updatePrompt, deletePrompt } = usePrompts();
  const { responses, loading: responsesLoading } = useResponses(id);
  const { showToast } = useContext(AppContext);
  const { user } = useAuth();
  
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddingResponse, setIsAddingResponse] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [viewMarkdown, setViewMarkdown] = useState(true);
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [renderedContent, setRenderedContent] = useState('');
  
  useEffect(() => {
    loadPrompt();
  }, [id]);
  
  const loadPrompt = async () => {
    setLoading(true);
    try {
      const loadedPrompt = getPrompt(id);
      if (loadedPrompt) {
        setPrompt(loadedPrompt);
        setIsPublic(loadedPrompt.isPublic);
        
        // Check if prompt content is markdown
        const contentIsMarkdown = detectMarkdown(loadedPrompt.content);
        setIsMarkdown(contentIsMarkdown);
        
        if (contentIsMarkdown) {
          setRenderedContent(marked.parse(loadedPrompt.content));
        } else {
          setRenderedContent(loadedPrompt.content);
        }
      } else {
        showToast('Prompt not found', 'error');
        route('/dashboard');
      }
    } catch (error) {
      console.error('Error loading prompt:', error);
      showToast('Failed to load prompt', 'error');
      route('/dashboard');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTogglePublic = async () => {
    try {
      const updatedPrompt = updatePrompt(id, { 
        isPublic: !isPublic 
      });
      setPrompt(updatedPrompt);
      setIsPublic(updatedPrompt.isPublic);
      showToast(`Prompt is now ${updatedPrompt.isPublic ? 'public' : 'private'}`, 'success');
    } catch (error) {
      console.error('Error updating prompt:', error);
      showToast('Failed to update prompt', 'error');
    }
  };
  
  const handleDelete = async () => {
    try {
      await deletePrompt(id);
      showToast('Prompt deleted successfully', 'success');
      route('/dashboard');
    } catch (error) {
      console.error('Error deleting prompt:', error);
      showToast('Failed to delete prompt', 'error');
      setIsConfirmingDelete(false);
    }
  };
  
  const toggleMarkdownView = () => {
    setViewMarkdown(!viewMarkdown);
  };
  
  if (loading) {
    return <div>Loading prompt...</div>;
  }
  
  if (!prompt) {
    return <div>Prompt not found</div>;
  }
  
  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h1>{prompt.title || "Prompt Details"}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span className={`status-badge ${isPublic ? 'public' : 'private'}`}
                  style={{ 
                    backgroundColor: isPublic ? 'var(--primary)' : 'var(--muted-color)', 
                    color: 'white', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem' 
                  }}>
              {isPublic ? 'Public' : 'Private'}
            </span>
            <Button onClick={handleTogglePublic} variant="outline" style={{ fontSize: '0.75rem' }}>
              Make {isPublic ? 'Private' : 'Public'}
            </Button>
            {isPublic && <ShareButton id={id} />}
          </div>
        </div>
        <Button onClick={() => setIsConfirmingDelete(true)} variant="outline">Delete</Button>
      </header>
      
      <div className="prompt-content card" style={{ marginBottom: '2rem', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: 'var(--primary)', margin: 0 }}>Prompt:</h3>
          
          {isMarkdown && (
            <Button 
              onClick={toggleMarkdownView} 
              variant="outline" 
              style={{ fontSize: '0.75rem' }}
            >
              {viewMarkdown ? 'View Raw' : 'View Rendered'}
            </Button>
          )}
        </div>
        
        <div className="prompt-markdown-container" style={{ 
          border: isMarkdown ? '1px dashed var(--primary-focus)' : 'none',
          borderRadius: '4px',
          padding: isMarkdown ? '1rem' : '0',
          backgroundColor: isMarkdown ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
        }}>
          {isMarkdown && viewMarkdown ? (
            <div 
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          ) : (
            <div style={{ whiteSpace: 'pre-wrap' }}>{prompt.content}</div>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Responses ({responses.length})</h2>
        <Button onClick={() => setIsAddingResponse(true)}>Add Response</Button>
      </div>
      
      {responsesLoading ? (
        <p>Loading responses...</p>
      ) : responses.length === 0 ? (
        <div className="empty-state">
          <p>No responses yet. Add your first response to this prompt.</p>
          <Button onClick={() => setIsAddingResponse(true)}>Add Response</Button>
        </div>
      ) : (
        <ResponseList responses={responses} promptId={id} />
      )}
      
      {/* Add Response Modal */}
      <Modal
        isOpen={isAddingResponse}
        onClose={() => setIsAddingResponse(false)}
        title="Add Response"
      >
        <ResponseForm
          promptId={id}
          onSuccess={() => {
            setIsAddingResponse(false);
            showToast('Response added successfully', 'success');
          }}
        />
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        title="Confirm Delete"
      >
        <div>
          <p>Are you sure you want to delete this prompt and all its responses? This action cannot be undone.</p>
          <div className="action-buttons" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button onClick={handleDelete} variant="contrast">Delete Permanently</Button>
            <Button onClick={() => setIsConfirmingDelete(false)} variant="outline">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}