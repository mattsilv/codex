import { useState, useEffect } from 'preact/hooks';
import { marked } from 'marked';
import { detectMarkdown } from '../utils/markdownDetector';

export interface UseMarkdownReturn {
  rawContent: string;
  renderedContent: string;
  isMarkdown: boolean;
  updateContent: (newContent: string) => void;
  toggleMarkdown: () => void;
}

export default function useMarkdown(content: string = ''): UseMarkdownReturn {
  const [rawContent, setRawContent] = useState<string>(content);
  const [isMarkdown, setIsMarkdown] = useState<boolean>(false);
  const [renderedContent, setRenderedContent] = useState<string>('');

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

  const updateContent = (newContent: string): void => {
    setRawContent(newContent);
    const isDetectedMarkdown = detectMarkdown(newContent);
    setIsMarkdown(isDetectedMarkdown);

    if (isDetectedMarkdown) {
      setRenderedContent(marked.parse(newContent));
    } else {
      setRenderedContent(newContent);
    }
  };

  const toggleMarkdown = (): void => {
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
