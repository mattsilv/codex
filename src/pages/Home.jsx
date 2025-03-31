import { useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';

export default function Home() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div>
      <Header />
      <main className="container">
        <section className="hero" style={{ textAlign: 'center', padding: '3rem 0' }}>
          <h1>Compare LLM Responses to the Same Prompts</h1>
          <p>
            Codex is a tool for collecting, storing, and comparing responses from different Large
            Language Models to the same prompts.
          </p>
          <div style={{ marginTop: '2rem' }}>
            {isAuthenticated ? (
              <Button onClick={() => route('/dashboard')}>Go to Dashboard</Button>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Button onClick={() => route('/auth')}>Login</Button>
                <Button variant="outline" onClick={() => route('/auth')}>Register</Button>
              </div>
            )}
          </div>
        </section>

        <section style={{ margin: '4rem 0' }}>
          <h2>Why use Codex?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className="feature-card card">
              <h3>Build a Prompt Library</h3>
              <p>Save your most effective prompts and their outcomes in one place.</p>
            </div>
            <div className="feature-card card">
              <h3>Compare LLM Outputs</h3>
              <p>See how different LLMs respond to identical prompts side by side.</p>
            </div>
            <div className="feature-card card">
              <h3>Share with Others</h3>
              <p>Share your prompt collections publicly with a simple link.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}