import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import Button from '../components/ui/Button';
import PromptList from '../components/prompt/PromptList';
import usePrompts from '../hooks/usePrompts';
import useAuth from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const { prompts, loading, refresh } = usePrompts();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Refresh prompts when dashboard loads
    refresh();
  }, []);

  const filteredPrompts = filter === 'all'
    ? prompts
    : filter === 'public'
      ? prompts.filter(p => p.isPublic)
      : prompts.filter(p => !p.isPublic);

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Your Prompts</h1>
        <Button onClick={() => route('/prompt/create')}>New Prompt</Button>
      </header>

      <div style={{ marginBottom: '2rem' }}>
        <div className="filter-tabs" style={{ display: 'flex', gap: '1rem' }}>
          <Button 
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'public' ? 'primary' : 'outline'}
            onClick={() => setFilter('public')}
          >
            Public
          </Button>
          <Button 
            variant={filter === 'private' ? 'primary' : 'outline'}
            onClick={() => setFilter('private')}
          >
            Private
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Loading prompts...</p>
      ) : filteredPrompts.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any {filter !== 'all' ? filter : ''} prompts yet.</p>
          <Button onClick={() => route('/prompt/create')}>Create First Prompt</Button>
        </div>
      ) : (
        <PromptList prompts={filteredPrompts} />
      )}
    </div>
  );
}