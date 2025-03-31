import { useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../../context/AuthContext';

export default function Header() {
  const { user } = useContext(AuthContext);

  // Switch accounts by creating a new session
  const handleNewSession = () => {
    // This will trigger the creation of a new default user
    localStorage.removeItem('user');
    // Force refresh the page to apply changes
    window.location.reload();
  };

  return (
    <nav className="container">
      <ul>
        <li><strong><a href="/">Codex</a></strong></li>
      </ul>
      <ul>
        <li><a href="/dashboard">Dashboard</a></li>
        <li>
          <details class="dropdown">
            <summary>{user?.name || 'Default User'}</summary>
            <ul dir="rtl">
              <li><a href="/prompt/create">New Prompt</a></li>
              <li><a href="/settings">Settings</a></li>
              <li><a onClick={handleNewSession}>New Session</a></li>
            </ul>
          </details>
        </li>
      </ul>
    </nav>
  );
}