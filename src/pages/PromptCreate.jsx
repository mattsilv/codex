import { useState, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import usePrompts from '../hooks/usePrompts';
import { AppContext } from '../context/AppContext';
import { detectMarkdown } from '../utils/markdownDetector';

export default function PromptCreate() {
  const { createPrompt } = usePrompts();
  const { showToast } = useContext(AppContext);
  
  const [promptData, setPromptData] = useState({
    title: '',
    content: '',
    isPublic: false
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMarkdown, setIsMarkdown] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPromptData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Check for markdown when content changes
    if (name === 'content') {
      setIsMarkdown(detectMarkdown(value));
    }
  };
  
  const handleTogglePublic = () => {
    setPromptData(prev => ({
      ...prev,
      isPublic: !prev.isPublic
    }));
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!promptData.title.trim()) {
      newErrors.title = 'Prompt title is required';
    }
    
    if (!promptData.content.trim()) {
      newErrors.content = 'Prompt content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const newPrompt = createPrompt(promptData);
      showToast('Prompt created successfully!', 'success');
      route(`/prompt/${newPrompt.id}`);
    } catch (error) {
      console.error('Error creating prompt:', error);
      setErrors({
        form: 'Failed to create prompt. Please try again.'
      });
      showToast('Failed to create prompt', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <h1>Create New Prompt</h1>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
        {errors.form && (
          <div className="error">{errors.form}</div>
        )}
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="title">Prompt Title</label>
          <Input
            id="title"
            name="title"
            value={promptData.title}
            onChange={handleChange}
            placeholder="Enter a title for your prompt..."
            required
            error={errors.title}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="content">Prompt Content</label>
            {isMarkdown && (
              <span style={{ 
                fontSize: '0.75rem', 
                backgroundColor: 'var(--primary-focus)', 
                color: 'var(--primary)', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '4px',
                fontWeight: 'bold'
              }}>
                Markdown Detected
              </span>
            )}
          </div>
          <textarea
            id="content"
            name="content"
            value={promptData.content}
            onChange={handleChange}
            rows={10}
            placeholder="Enter your prompt here... Markdown is supported!"
            required
            aria-invalid={errors.content ? 'true' : 'false'}
            style={{ 
              width: '100%',
              fontFamily: isMarkdown ? 'monospace' : 'inherit' 
            }}
          ></textarea>
          {errors.content && <small className="error">{errors.content}</small>}
          <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--muted-color)' }}>
            Markdown formatting is supported and will be rendered in the prompt view.
          </small>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <ToggleSwitch
            id="isPublic"
            label="Make this prompt public"
            checked={promptData.isPublic}
            onChange={handleTogglePublic}
          />
          <small style={{ display: 'block', marginTop: '0.5rem' }}>
            Public prompts can be shared with anyone via a link
          </small>
        </div>
        
        <div className="action-buttons" style={{ display: 'flex', gap: '1rem' }}>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Prompt'}
          </Button>
          <Button type="button" variant="outline" onClick={() => route('/dashboard')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}