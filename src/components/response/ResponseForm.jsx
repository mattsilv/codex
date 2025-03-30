import { useState } from 'preact/hooks';
import Button from '../ui/Button';
import Input from '../ui/Input';
import MarkdownPreview from './MarkdownPreview';
import useResponses from '../../hooks/useResponses';
import useMarkdown from '../../hooks/useMarkdown';

export default function ResponseForm({ promptId, onSuccess }) {
  const { createResponse } = useResponses(promptId);
  const [formData, setFormData] = useState({
    modelName: '',
    rawContent: '',
    isMarkdown: false,
  });
  const { 
    rawContent, 
    renderedContent, 
    isMarkdown, 
    updateContent, 
    toggleMarkdown 
  } = useMarkdown(formData.rawContent);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const modelOptions = [
    'Claude 3 Haiku',
    'Claude 3 Sonnet',
    'Claude 3 Opus',
    'GPT-4',
    'GPT-4 Turbo',
    'GPT-3.5 Turbo',
    'Gemini Pro',
    'Gemini Ultra',
    'LLaMA 3 8B',
    'LLaMA 3 70B',
    'Other'
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'rawContent') {
      updateContent(value);
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.modelName) {
      newErrors.modelName = 'Model name is required';
    }
    
    if (!formData.rawContent.trim()) {
      newErrors.rawContent = 'Response content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      createResponse({
        modelName: formData.modelName,
        rawContent: rawContent,
        cleanContent: renderedContent,
        isMarkdown: isMarkdown,
        wasAutoDetected: true,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating response:', error);
      setErrors({
        form: 'Failed to create response. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {errors.form && (
        <div className="error">{errors.form}</div>
      )}
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="modelName">LLM Model</label>
        <select
          id="modelName"
          name="modelName"
          value={formData.modelName}
          onChange={handleChange}
          required
          aria-invalid={errors.modelName ? 'true' : 'false'}
        >
          <option value="" disabled>Select a model</option>
          {modelOptions.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
        {errors.modelName && <small className="error">{errors.modelName}</small>}
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label htmlFor="rawContent">Response Content</label>
          <Button 
            type="button" 
            onClick={toggleMarkdown} 
            variant="outline"
            style={{ fontSize: '0.75rem' }}
          >
            {isMarkdown ? 'View Raw' : 'View Rendered'}
          </Button>
        </div>
        
        <MarkdownPreview 
          rawContent={rawContent}
          renderedContent={renderedContent}
          isMarkdown={isMarkdown}
          isEditing={true}
          onChange={e => handleChange({
            target: { name: 'rawContent', value: e.target.value }
          })}
          error={errors.rawContent}
        />
      </div>
      
      <div className="action-buttons" style={{ display: 'flex', gap: '1rem' }}>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Response'}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
      </div>
    </form>
  );
}