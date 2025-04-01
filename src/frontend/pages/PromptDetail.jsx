import { useState, useEffect, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ShareButton from '../components/ui/ShareButton';
import CopyButton from '../components/ui/CopyButton';
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
  const [isEditing, setIsEditing] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
  });

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

        // Set edit form data
        setEditFormData({
          title: loadedPrompt.title || '',
          content: loadedPrompt.content || '',
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
        isPublic: !isPublic,
      });
      setPrompt(updatedPrompt);
      setIsPublic(updatedPrompt.isPublic);
      showToast(
        `Prompt is now ${updatedPrompt.isPublic ? 'public' : 'private'}`,
        'success'
      );
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
    setShowMobileMenu(false);
  };

  const handleCancelEdit = () => {
    // Reset form data to current prompt values
    setEditFormData({
      title: prompt.title || '',
      content: prompt.content || '',
    });
    setIsEditing(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      const updatedPrompt = updatePrompt(id, {
        title: editFormData.title,
        content: editFormData.content,
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

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading prompt details...</p>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <h2>Prompt Not Found</h2>
        <p>We couldn&apos;t find the prompt you&apos;re looking for.</p>
        <Button onClick={() => route('/dashboard')} variant="primary">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="prompt-detail-container">
      <header className="prompt-detail-header">
        <div className="prompt-title-container">
          {isEditing ? (
            <div className="edit-title-container">
              <input
                type="text"
                name="title"
                value={editFormData.title}
                onChange={handleEditChange}
                placeholder="Prompt Title"
                className="edit-title-input"
              />
            </div>
          ) : (
            <h1 className="prompt-title">{prompt.title || 'Prompt Details'}</h1>
          )}

          {/* Mobile menu toggle button */}
          <button
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle actions menu"
          >
            ⋮
          </button>
        </div>

        {/* Desktop action buttons */}
        <div className="header-actions desktop-actions">
          {!isEditing ? (
            <>
              <Button
                onClick={handleEditClick}
                variant="outline"
                className="btn-sm"
              >
                Edit
              </Button>
              <Button
                onClick={() => setIsConfirmingDelete(true)}
                variant="outline"
                className="btn-sm"
              >
                Delete
              </Button>
              {isPublic && <ShareButton id={id} />}
            </>
          ) : (
            <>
              <Button
                onClick={handleSaveEdit}
                variant="primary"
                className="btn-sm"
              >
                Save
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                className="btn-sm"
              >
                Cancel
              </Button>
            </>
          )}
        </div>

        {/* Mobile action menu */}
        {showMobileMenu && (
          <div className="mobile-actions-menu">
            {!isEditing ? (
              <>
                <Button
                  onClick={handleEditClick}
                  variant="outline"
                  className="btn-block"
                >
                  Edit Prompt
                </Button>
                <Button
                  onClick={() => {
                    setIsConfirmingDelete(true);
                    setShowMobileMenu(false);
                  }}
                  variant="outline"
                  className="btn-block"
                >
                  Delete Prompt
                </Button>
                {isPublic && <ShareButton id={id} className="btn-block" />}
              </>
            ) : (
              <>
                <Button
                  onClick={handleSaveEdit}
                  variant="primary"
                  className="btn-block"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="btn-block"
                >
                  Cancel Editing
                </Button>
              </>
            )}
          </div>
        )}
      </header>

      <div className="prompt-content-card">
        <div className="prompt-content-header">
          <div className="prompt-content-label">
            <h3 className="prompt-label">Prompt</h3>
            {!isEditing && (
              <div className="prompt-actions">
                <CopyButton content={prompt.content} />
                <label className="public-toggle">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={isPublic}
                    onChange={handleTogglePublic}
                  />
                  <span className="toggle-label">
                    {isPublic ? 'Public' : 'Private'}
                  </span>
                </label>
              </div>
            )}
          </div>

          {isMarkdown && !isEditing && (
            <Button
              onClick={toggleMarkdownView}
              variant="outline"
              className="markdown-toggle-btn"
            >
              {viewMarkdown ? 'View Raw' : 'View Rendered'}
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="edit-content-container">
            <textarea
              name="content"
              value={editFormData.content}
              onChange={handleEditChange}
              rows={15}
              className="content-textarea"
              placeholder="Enter prompt content..."
            ></textarea>

            {detectMarkdown(editFormData.content) && (
              <div className="markdown-preview-container">
                <h4 className="preview-label">Preview</h4>
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
          <div
            className={`prompt-content-display ${isMarkdown ? 'markdown-content' : ''}`}
          >
            <MarkdownPreview
              rawContent={prompt.content}
              renderedContent={renderedContent}
              isMarkdown={isMarkdown && viewMarkdown}
              size="small"
            />
          </div>
        )}
      </div>

      <div className="responses-header">
        <h2 className="responses-title">Responses ({responses.length})</h2>
        <Button
          onClick={() => setIsAddingResponse(true)}
          className="add-response-btn"
        >
          Add Response
        </Button>
      </div>

      {responsesLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading responses...</p>
        </div>
      ) : responses.length === 0 ? (
        <div className="empty-responses-container">
          <div className="empty-state-icon">📝</div>
          <h3>No Responses Yet</h3>
          <p>
            This prompt doesn&apos;t have any responses yet. Add your first
            response to get started.
          </p>
          <Button onClick={() => setIsAddingResponse(true)} variant="primary">
            Add First Response
          </Button>
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
          onSuccess={(newResponse) => {
            // Close the modal
            setIsAddingResponse(false);

            // Refresh responses list
            loadPrompt();

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
        <div className="delete-confirmation">
          <p className="delete-warning">
            Are you sure you want to delete this prompt and all its responses?
            This action can&apos;t be undone.
          </p>
          <div className="delete-actions">
            <Button
              onClick={handleDelete}
              variant="contrast"
              className="delete-btn"
            >
              Delete Permanently
            </Button>
            <Button
              onClick={() => setIsConfirmingDelete(false)}
              variant="outline"
              className="cancel-btn"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
