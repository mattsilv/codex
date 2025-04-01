import { useState, useEffect } from 'preact/hooks';
import { marked } from 'marked';
import { detectMarkdown } from '../utils/markdownDetector';

export default function useMarkdown(content = '') {
  const [rawContent, setRawContent] = useState(content);
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [renderedContent, setRenderedContent] = useState('');

  useEffect(() => {
    if (content) {
      setRawContent(content);
      const isDetectedMarkdown = detectMarkdown(content);
      setIsMarkdown(isDetectedMarkdown);

      if (isDetectedMarkdown) {
        setRenderedContent(marked.parse(content));
      } else {
        setRenderedContent(content);
      }
    }
  }, [content]);

  const updateContent = (newContent) => {
    setRawContent(newContent);
    const isDetectedMarkdown = detectMarkdown(newContent);
    setIsMarkdown(isDetectedMarkdown);

    if (isDetectedMarkdown) {
      setRenderedContent(marked.parse(newContent));
    } else {
      setRenderedContent(newContent);
    }
  };

  const toggleMarkdown = () => {
    setIsMarkdown(!isMarkdown);

    if (!isMarkdown) {
      setRenderedContent(marked.parse(rawContent));
    } else {
      setRenderedContent(rawContent);
    }
  };

  return {
    rawContent,
    renderedContent,
    isMarkdown,
    updateContent,
    toggleMarkdown,
  };
}
