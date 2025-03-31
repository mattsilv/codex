import { useState } from 'preact/hooks';
import Button from '../ui/Button';
import Input from '../ui/Input';
import MarkdownPreview from './MarkdownPreview';
import { LoadingSpinner } from '../ui/LoadingState';
import useResponses from '../../hooks/useResponses';
import useMarkdown from '../../hooks/useMarkdown';
import '../../styles/loading.css';

export default function ResponseForm({ promptId, onSuccess }) {
  const { createResponse, responses } = useResponses(promptId);
  const [formData, setFormData] = useState({
    modelName: '',
    customModelName: '',
    rawContent: '',
    isMarkdown: false,
    webEnabled: false
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
    'Claude 3.7 Sonnet',
    'Claude 3.7 Sonnet thinking',
    'ChatGPT 4.5',
    'ChatGPT 01 Pro mode',
    'ChatGPT-03 deep research',
    'GPT-4-O',
    'Gemini 2.5 Pro experimental',
    'Gemini 2.0 Flash thinking',
    'Gemini 2.0 deep research',
    'Perplexity deep research',
    'Other'
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for selecting "Other" in the dropdown
    if (name === 'modelName' && value === 'Other') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } 
    // Normal handling for all other changes
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (name === 'rawContent') {
      updateContent(value);
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.modelName) {
      newErrors.modelName = 'Model name is required';
    }
    
    if (formData.modelName === 'Other' && !formData.customModelName?.trim()) {
      newErrors.customModelName = 'Custom model name is required';
    }
    
    // Check for duplicate model
    const modelNameToCheck = formData.modelName === 'Other' 
      ? formData.customModelName 
      : formData.modelName;
      
    const isDuplicate = responses.some(response => 
      response.modelName.toLowerCase() === modelNameToCheck.toLowerCase()
    );
    
    if (isDuplicate) {
      newErrors.modelName = `A response with model "${modelNameToCheck}" already exists for this prompt`;
    }
    
    if (!formData.rawContent.trim()) {
      newErrors.rawContent = 'Response content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Use the custom model name if "Other" is selected
      const modelNameToUse = formData.modelName === 'Other' 
        ? formData.customModelName 
        : formData.modelName;
        
      // Create the response
      const newResponse = await createResponse({
        modelName: modelNameToUse,
        rawContent: rawContent,
        cleanContent: renderedContent,
        isMarkdown: isMarkdown,
        wasAutoDetected: true,
        webEnabled: formData.webEnabled
      });
      
      // Automatically close the modal and refresh the view
      onSuccess(newResponse);
    } catch (error) {
      console.error('Error creating response:', error);
      setErrors({
        form: error.message || 'Failed to create response. Please try again.'
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
        
        {/* Check if all standard models are used */}
        {modelOptions.filter(model => model !== 'Other').every(model => 
          responses.some(response => response.modelName.toLowerCase() === model.toLowerCase())
        ) && (
          <div style={{ 
            padding: '0.5rem', 
            marginBottom: '0.5rem', 
            backgroundColor: 'rgba(var(--primary-rgb), 0.1)', 
            borderRadius: '0.25rem',
            fontSize: '0.875rem'
          }}>
            All standard models have been used for this prompt. 
            Select "Other" to add a custom model.
          </div>
        )}
        
        <select
          id="modelName"
          name="modelName"
          value={formData.modelName}
          onChange={handleChange}
          required
          aria-invalid={errors.modelName ? 'true' : 'false'}
        >
          <option value="" disabled>Select a model</option>
          {modelOptions.map(model => {
            // Check if this model already has a response
            const isUsed = model !== 'Other' && responses.some(response => 
              response.modelName.toLowerCase() === model.toLowerCase()
            );
            
            return (
              <option 
                key={model} 
                value={model} 
                disabled={isUsed}
                style={isUsed ? { color: 'var(--muted-color)' } : {}}
              >
                {model} {isUsed ? '(already used)' : ''}
              </option>
            );
          })}
        </select>
        
        {formData.modelName === 'Other' && (
          <div style={{ marginTop: '0.5rem' }}>
            <Input
              type="text"
              id="customModelName"
              name="customModelName"
              value={formData.customModelName || ''}
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({ ...prev, customModelName: value }));
                
                // Clear any previous custom model error when typing
                if (errors.customModelName) {
                  setErrors(prev => ({
                    ...prev,
                    customModelName: null
                  }));
                }
              }}
              placeholder="Enter custom model name"
              required
              aria-invalid={errors.customModelName ? 'true' : 'false'}
            />
            {errors.customModelName && <small className="error">{errors.customModelName}</small>}
            
            <small style={{ display: 'block', marginTop: '0.25rem', color: 'var(--muted-color)' }}>
              Note: Custom model names must be unique for this prompt
            </small>
          </div>
        )}
        {errors.modelName && <small className="error">{errors.modelName}</small>}
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="webEnabled"
            name="webEnabled"
            checked={formData.webEnabled}
            onChange={(e) => setFormData(prev => ({ ...prev, webEnabled: e.target.checked }))}
          />
          <label htmlFor="webEnabled" style={{ margin: 0 }}>Web Search Enabled</label>
        </div>
      </div>

      <div className="mb-lg">
        <div className="flex-between mb-xs">
          <label htmlFor="rawContent">Response Content</label>
          <Button 
            type="button" 
            onClick={toggleMarkdown} 
            variant="outline"
            className="btn-sm"
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
          size="small"
        />
      </div>
      
      <div className="action-buttons gap-md">
        <Button type="submit" disabled={isSubmitting} className="btn-md">
          {isSubmitting ? (
            <span style="display: flex; align-items: center; gap: 0.5rem;">
              <LoadingSpinner size="small" /> Saving...
            </span>
          ) : 'Save Response'}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess} className="btn-md" disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}