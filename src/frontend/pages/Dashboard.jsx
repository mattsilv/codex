import { useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import Button from '../components/ui/Button';
import PromptList from '../components/prompt/PromptList';
import MigrationBanner from '../components/ui/MigrationBanner';
import { LoadingSpinner, ErrorMessage } from '../components/ui/LoadingState';
import usePrompts from '../hooks/usePrompts';
import useAuth from '../hooks/useAuth';
import '../styles/loading.css';

export default function Dashboard() {
  const { user } = useAuth();
  const { prompts, loading, error, refresh } = usePrompts();

  useEffect(() => {
    // Refresh prompts when dashboard loads
    refresh();
  }, []);

  return (
    <article>
      <header>
        <div class="grid">
          <div>
            <h1>Your Prompts</h1>
          </div>
          <div style="text-align: right;">
            <Button onClick={() => route('/prompt/create')}>New Prompt</Button>
          </div>
        </div>
      </header>
      
      <MigrationBanner />

      <ErrorMessage message={error} onRetry={refresh} />
      
      {loading ? (
        <div class="loading-container" style="display: flex; justify-content: center; padding: 2rem 0;">
          <LoadingSpinner size="large" />
        </div>
      ) : prompts.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any prompts yet.</p>
          <Button onClick={() => route('/prompt/create')}>Create First Prompt</Button>
        </div>
      ) : (
        <PromptList prompts={prompts} />
      )}
    </article>
  );
}