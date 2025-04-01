import { useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import Button from '../components/ui/Button';
import PromptList from '../components/prompt/PromptList';
import MigrationBanner from '../components/ui/MigrationBanner';
import usePrompts from '../hooks/usePrompts';
import useAuth from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const { prompts, loading, refresh } = usePrompts();

  useEffect(() => {
    // Refresh prompts when dashboard loads
    refresh();
  }, []);

  return (
    <article>
      <header>
        <div className="grid">
          <div>
            <h1>Your Prompts</h1>
          </div>
          <div style="text-align: right;">
            <Button onClick={() => route('/prompt/create')}>New Prompt</Button>
          </div>
        </div>
      </header>

      <MigrationBanner />

      {loading ? (
        <p aria-busy="true">Loading prompts...</p>
      ) : prompts.length === 0 ? (
        <div className="empty-state">
          <p>You don&apos;t have any prompts yet.</p>
          <Button onClick={() => route('/prompt/create')} className="mt-4">
            Create Your First Prompt
          </Button>
        </div>
      ) : (
        <PromptList prompts={prompts} />
      )}
    </article>
  );
}
