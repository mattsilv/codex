import { route } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import { JSX } from 'preact/jsx-runtime';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';

// Define the props interface
interface NotFoundProps {
  url: string; // Assuming url is passed by the router as a string
}

export default function NotFound({ url }: NotFoundProps): JSX.Element {
  const [attempted, setAttempted] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  useEffect(() => {
    // Record the URL that caused the 404
    setAttempted((prev) => [...prev, url]);
    setCurrentUrl(window.location.href);
  }, [url]);

  return (
    <div>
      <Header />
      <main
        className="container"
        style={{ textAlign: 'center', padding: '4rem 0' }}
      >
        <h1>404 - Page Not Found</h1>
        <p>Sorry, the page you are looking for doesn&apos;t exist.</p>

        <div
          style={{
            margin: '2rem 0',
            textAlign: 'left',
            background: '#f5f5f5',
            padding: '1rem',
            borderRadius: '4px',
          }}
        >
          <h3>Debug Information:</h3>
          <p>
            <strong>Current URL:</strong> {currentUrl}
          </p>
          <p>
            <strong>Attempted path:</strong> {url}
          </p>
          <p>
            <strong>Previous attempts:</strong>
          </p>
          <ul>
            {attempted.map((path: string, index: number) => (
              <li key={index}>{path}</li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button onClick={() => route('/')}>Go Home</Button>
          <Button onClick={() => route('/dashboard')}>Go to Dashboard</Button>
          <Button onClick={() => route('/auth')}>Go to Auth</Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
