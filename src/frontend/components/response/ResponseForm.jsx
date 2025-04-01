import { useState } from 'preact/hooks';
import Button from '../ui/Button';
import Input from '../ui/Input';
import MarkdownPreview from './MarkdownPreview';
import useResponses from '../../hooks/useResponses';
import useMarkdown from '../../hooks/useMarkdown';

export default function ResponseForm({ promptId, onSuccess }) {
  const { createResponse, responses } = useResponses(promptId);
  const [formData, setFormData] = useState({
    modelName: '',
    customModelName: '',
    rawContent: '',
    isMarkdown: false,
    webEnabled: false,
  });
  const {
    rawContent,
    renderedContent,
    isMarkdown,
    updateContent,
    toggleMarkdown,
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
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for selecting "Other" in the dropdown
    if (name === 'modelName' && value === 'Other') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // Normal handling for all other changes
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
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
    const modelNameToCheck =
      formData.modelName === 'Other'
        ? formData.customModelName
        : formData.modelName;

    const isDuplicate = responses.some(
      (response) =>
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Use the custom model name if "Other" is selected
      const modelNameToUse =
        formData.modelName === 'Other'
          ? formData.customModelName
          : formData.modelName;

      // Create the response
      const newResponse = createResponse({
        modelName: modelNameToUse,
        rawContent: rawContent,
        cleanContent: renderedContent,
        isMarkdown: isMarkdown,
        wasAutoDetected: true,
        webEnabled: formData.webEnabled,
      });

      // Automatically close the modal and refresh the view
      onSuccess(newResponse);
    } catch (error) {
      console.error('Error creating response:', error);
      setErrors({
        form: 'Failed to create response. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200">
          {errors.form}
        </div>
      )}

      <div className="mb-6">
        <label
          htmlFor="modelName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          LLM Model
        </label>

        {/* Check if all standard models are used */}
        {modelOptions
          .filter((model) => model !== 'Other')
          .every((model) =>
            responses.some(
              (response) =>
                response.modelName.toLowerCase() === model.toLowerCase()
            )
          ) && (
          <div className="p-2 mb-2 bg-blue-50 text-blue-700 rounded text-sm">
            All standard models have been used for this prompt. Select
            &quot;Other&quot; to add a custom model.
          </div>
        )}

        <select
          id="modelName"
          name="modelName"
          value={formData.modelName}
          onChange={handleChange}
          required
          aria-invalid={errors.modelName ? 'true' : 'false'}
          className={`w-full px-3 py-2 border ${errors.modelName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
        >
          <option value="" disabled>
            Select a model
          </option>
          {modelOptions.map((model) => {
            // Check if this model already has a response
            const isUsed =
              model !== 'Other' &&
              responses.some(
                (response) =>
                  response.modelName.toLowerCase() === model.toLowerCase()
              );

            return (
              <option
                key={model}
                value={model}
                disabled={isUsed}
                className={isUsed ? 'text-gray-400' : ''}
              >
                {model} {isUsed ? '(already used)' : ''}
              </option>
            );
          })}
        </select>

        {formData.modelName === 'Other' && (
          <div className="mt-3">
            <Input
              type="text"
              id="customModelName"
              name="customModelName"
              value={formData.customModelName || ''}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({ ...prev, customModelName: value }));

                // Clear any previous custom model error when typing
                if (errors.customModelName) {
                  setErrors((prev) => ({
                    ...prev,
                    customModelName: null,
                  }));
                }
              }}
              placeholder="Enter custom model name"
              required
              error={errors.customModelName}
            />

            <p className="mt-1 text-xs text-gray-500">
              Note: Custom model names must be unique for this prompt
            </p>
          </div>
        )}
        {errors.modelName && (
          <p className="mt-1 text-sm text-red-600">{errors.modelName}</p>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="webEnabled"
            name="webEnabled"
            checked={formData.webEnabled}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, webEnabled: e.target.checked }))
            }
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="webEnabled"
            className="text-sm font-medium text-gray-700"
          >
            Web Search Enabled
          </label>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label
            htmlFor="rawContent"
            className="block text-sm font-medium text-gray-700"
          >
            Response Content
          </label>
          <Button
            type="button"
            onClick={toggleMarkdown}
            variant="outline"
            className="text-sm py-1 px-2"
          >
            {isMarkdown ? 'View Raw' : 'View Rendered'}
          </Button>
        </div>

        <MarkdownPreview
          rawContent={rawContent}
          renderedContent={renderedContent}
          isMarkdown={isMarkdown}
          isEditing={true}
          onChange={(e) =>
            handleChange({
              target: { name: 'rawContent', value: e.target.value },
            })
          }
          error={errors.rawContent}
          size="small"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter &quot;MARKDOWN&quot; to format response as Markdown.
        </p>
      </div>

      <div className="flex gap-4 justify-end">
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
