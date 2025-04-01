import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import CopyButton from '../components/ui/CopyButton';
import ResponseList from '../components/response/ResponseList';
import { detectMarkdown } from '../utils/markdownDetector';
import { marked } from 'marked';

export default function SharedPrompt({ id }) {
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState(null);
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState(null);
  const [viewMarkdown, setViewMarkdown] = useState(true);
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [renderedContent, setRenderedContent] = useState('');

  useEffect(() => {
    loadSharedPrompt();
  }, [id]);

  const loadSharedPrompt = async () => {
    setLoading(true);

    try {
      // Load prompt from localStorage for MVP
      const storedPrompts = localStorage.getItem('prompts');
      if (storedPrompts) {
        const parsedPrompts = JSON.parse(storedPrompts);
        const foundPrompt = parsedPrompts.find(
          (p) => p.id === id && p.isPublic
        );

        if (foundPrompt) {
          setPrompt(foundPrompt);

          // Check if prompt content is markdown
          const contentIsMarkdown = detectMarkdown(foundPrompt.content);
          setIsMarkdown(contentIsMarkdown);

          if (contentIsMarkdown) {
            setRenderedContent(marked.parse(foundPrompt.content));
          } else {
            setRenderedContent(foundPrompt.content);
          }

          // Load responses
          const storedResponses = localStorage.getItem('responses');
          if (storedResponses) {
            const parsedResponses = JSON.parse(storedResponses);
            setResponses(parsedResponses.filter((r) => r.promptId === id));
          }
        } else {
          setError('Prompt not found or is not public');
        }
      } else {
        setError('Prompt not found');
      }
    } catch (error) {
      console.error('Error loading shared prompt:', error);
      setError('Failed to load prompt');
    } finally {
      setLoading(false);
    }
  };

  const toggleMarkdownView = () => {
    setViewMarkdown(!viewMarkdown);
  };

  return (
    <div>
      <Header />
      <main className="container">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <div>
            <h1>Error</h1>
            <p>{error}</p>
            <button onClick={() => route('/')}>Go Home</button>
          </div>
        ) : (
          <>
            <h1>{prompt.title || 'Shared Prompt'}</h1>

            <div
              className="prompt-content card"
              style={{ marginBottom: '2rem', padding: '1rem' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <h3 style={{ color: 'var(--primary)', margin: 0 }}>
                    Prompt:
                  </h3>
                  <CopyButton content={prompt.content} />
                </div>

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

              <div
                className="prompt-markdown-container"
                style={{
                  border: isMarkdown
                    ? '1px dashed var(--primary-focus)'
                    : 'none',
                  borderRadius: '4px',
                  padding: isMarkdown ? '1rem' : '0',
                  backgroundColor: isMarkdown
                    ? 'rgba(99, 102, 241, 0.05)'
                    : 'transparent',
                }}
              >
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

            <h2>Responses ({responses.length})</h2>
            {responses.length === 0 ? (
              <p>No responses available for this prompt.</p>
            ) : (
              <ResponseList responses={responses} promptId={id} />
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
