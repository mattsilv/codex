import { useEffect } from 'preact/hooks';
import { route } from 'preact-router';

export default function Auth() {
  // Always redirect to dashboard, since we're always authenticated now
  useEffect(() => {
    route('/dashboard');
  }, []);

  return (
    <div className="container">
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Redirecting to dashboard...</p>
      </div>
    </div>
  );
}