import { useState, useEffect, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ShareButton from '../components/ui/ShareButton';
import CopyButton from '../components/ui/CopyButton';
import ResponseForm from '../components/response/ResponseForm';
import ResponseList from '../components/response/ResponseList';
import MarkdownPreview from '../components/response/MarkdownPreview';
import { LoadingSpinner, LoadingOverlay, ErrorMessage } from '../components/ui/LoadingState';
import usePrompts from '../hooks/usePrompts';
import useResponses from '../hooks/useResponses';
import useMarkdown from '../hooks/useMarkdown';
import { AppContext } from '../context/AppContext';
import useAuth from '../hooks/useAuth';
import { detectMarkdown } from '../utils/markdownDetector';
import { marked } from 'marked';
import '../styles/loading.css';

export default function PromptDetail({ id }) {
  const { getPrompt, updatePrompt, deletePrompt } = usePrompts();
  const { responses, loading: responsesLoading, error: responsesError } = useResponses(id);
  const { showToast } = useContext(AppContext);
  const { user } = useAuth();
  
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingResponse, setIsAddingResponse] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [viewMarkdown, setViewMarkdown] = useState(true);
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [renderedContent, setRenderedContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: ''
  });
  
  useEffect(() => {
    loadPrompt();
  }, [id]);
  
  const loadPrompt = async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedPrompt = await getPrompt(id);
      if (loadedPrompt) {
        setPrompt(loadedPrompt);
        setIsPublic(loadedPrompt.isPublic);
        
        // Set edit form data
        setEditFormData({
          title: loadedPrompt.title || '',
          content: loadedPrompt.content || ''
        });
        
        // Check if prompt content is markdown
        const contentIsMarkdown = detectMarkdown(loadedPrompt.content);
        setIsMarkdown(contentIsMarkdown);
        
        if (contentIsMarkdown) {
          setRenderedContent(marked.parse(loadedPrompt.content));
        } else {
          setRenderedContent(loadedPrompt.content);
        }
      } else {
        setError('Prompt not found');
        showToast('Prompt not found', 'error');
      }
    } catch (err) {
      console.error('Error loading prompt:', err);
      setError(err.message || 'Failed to load prompt');
      showToast('Failed to load prompt', 'error');
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
  
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    // Reset form data to current prompt values
    setEditFormData({
      title: prompt.title || '',
      content: prompt.content || ''
    });
    setIsEditing(false);
  };
  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveEdit = async () => {
    try {
      const updatedPrompt = updatePrompt(id, {
        title: editFormData.title,
        content: editFormData.content
      });
      
      setPrompt(updatedPrompt);
      
      // Re-check if content is markdown after update
      const contentIsMarkdown = detectMarkdown(updatedPrompt.content);
      setIsMarkdown(contentIsMarkdown);
      
      if (contentIsMarkdown) {
        setRenderedContent(marked.parse(updatedPrompt.content));
      } else {
        setRenderedContent(updatedPrompt.content);
      }
      
      setIsEditing(false);
      showToast('Prompt updated successfully', 'success');
    } catch (error) {
      console.error('Error updating prompt:', error);
      showToast('Failed to update prompt', 'error');
    }
  };
  
  if (loading) {
    return (
      <div className="loading-container" style="display: flex; justify-content: center; padding: 3rem 0;">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div>
        <ErrorMessage message={error} onRetry={loadPrompt} />
        <Button onClick={() => route('/dashboard')} style="margin-top: 1rem;">Back to Dashboard</Button>
      </div>
    );
  }
  
  if (!prompt) {
    return (
      <div className="error-state">
        <h2>Prompt not found</h2>
        <p>The prompt you're looking for could not be found.</p>
        <Button onClick={() => route('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }
  
  return (
    <div>
      <header className="mb-md">
        {isEditing ? (
          <div className="mb-md">
            <input
              type="text"
              name="title"
              value={editFormData.title}
              onChange={handleEditChange}
              placeholder="Prompt Title"
              style={{ marginBottom: '0.5rem', width: '100%' }}
            />
          </div>
        ) : (
          <h1 className="mb-md">{prompt.title || "Prompt Details"}</h1>
        )}
        
        <div className="header-actions">
          <div className="page-actions">
            {!isEditing ? (
              <>
                <Button onClick={handleEditClick} variant="outline" className="btn-sm">Edit</Button>
                <Button onClick={() => setIsConfirmingDelete(true)} variant="outline" className="btn-sm">Delete</Button>
                {isPublic && <ShareButton id={id} />}
              </>
            ) : (
              <>
                <Button onClick={handleSaveEdit} variant="primary" className="btn-sm">Save</Button>
                <Button onClick={handleCancelEdit} variant="outline" className="btn-sm">Cancel</Button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <div className="prompt-content card mb-lg">
        <div className="flex-between mb-md">
          <div className="flex-start gap-xs">
            <h3 style={{ color: 'var(--primary)', margin: 0 }}>Prompt:</h3>
            {!isEditing && (
              <>
                <CopyButton content={prompt.content} />
                <label className="public-toggle flex-start gap-xs">
                  <input 
                    type="checkbox" 
                    role="switch"
                    checked={isPublic}
                    onChange={handleTogglePublic}
                  />
                  <span>{isPublic ? 'Public' : 'Private'}</span>
                </label>
              </>
            )}
          </div>
          
          {isMarkdown && !isEditing && (
            <Button 
              onClick={toggleMarkdownView} 
              variant="outline" 
              className="btn-sm"
            >
              {viewMarkdown ? 'View Raw' : 'View Rendered'}
            </Button>
          )}
        </div>
        
        {isEditing ? (
          <div>
            <textarea
              name="content"
              value={editFormData.content}
              onChange={handleEditChange}
              rows={15}
              style={{ width: '100%', marginBottom: '1rem' }}
              placeholder="Enter prompt content..."
            ></textarea>
            
            {detectMarkdown(editFormData.content) && (
              <div className="markdown-preview" style={{ marginTop: '1rem', border: '1px dashed var(--primary-focus)' }}>
                <h4 style={{ color: 'var(--primary)', marginTop: 0 }}>Preview:</h4>
                <MarkdownPreview 
                rawContent={editFormData.content} 
                renderedContent={marked.parse(editFormData.content)}
                isMarkdown={true}
                size="small"
                compact={true}
              />
              </div>
            )}
          </div>
        ) : (
          <div className="prompt-markdown-container" style={{ 
            border: isMarkdown ? '1px dashed var(--primary-focus)' : 'none',
            borderRadius: '4px',
            padding: isMarkdown ? '1rem' : '0',
            backgroundColor: isMarkdown ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
          }}>
            <MarkdownPreview
              rawContent={prompt.content}
              renderedContent={renderedContent}
              isMarkdown={isMarkdown && viewMarkdown}
              size="small"
            />
          </div>
        )}
      </div>
      
      <div className="flex-between mb-md">
        <h2>Responses ({responses.length})</h2>
        <Button onClick={() => setIsAddingResponse(true)} className="btn-md">Add Response</Button>
      </div>
      
      <ErrorMessage message={responsesError} />
      
      {responsesLoading ? (
        <div className="loading-container" style="display: flex; justify-content: center; padding: 2rem 0;">
          <LoadingSpinner size="medium" />
        </div>
      ) : responses.length === 0 ? (
        <div className="empty-state">
          <p>No responses yet. Add your first response to this prompt.</p>
          <Button onClick={() => setIsAddingResponse(true)}>Add Response</Button>
        </div>
      ) : (
        <LoadingOverlay loading={responsesLoading}>
          <ResponseList responses={responses} promptId={id} />
        </LoadingOverlay>
      )}
      
      {/* Add Response Modal */}
      <Modal
        isOpen={isAddingResponse}
        onClose={() => setIsAddingResponse(false)}
        title="Add Response"
      >
        <ResponseForm
          promptId={id}
          onSuccess={(newResponse) => {
            // Close the modal
            setIsAddingResponse(false);
            
            // Refresh responses list
            loadResponses();
            
            // Show success message
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