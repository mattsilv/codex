import { useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../../context/AuthContext';

export default function Header() {
  const { user, logout, isAuthenticated } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    route('/');
  };

  return (
    <nav className="container">
      <ul>
        <li><strong><a href="/">Codex</a></strong></li>
      </ul>
      <ul>
        {isAuthenticated ? (
          <>
            <li><a href="/dashboard">Dashboard</a></li>
            <li>
              <details class="dropdown">
                <summary>{user?.username || user?.email || 'User'}</summary>
                <ul dir="rtl">
                  <li><a href="/prompt/create">New Prompt</a></li>
                  <li><a href="/settings">Settings</a></li>
                  <li><a onClick={handleLogout}>Logout</a></li>
                </ul>
              </details>
            </li>
          </>
        ) : (
          <>
            <li><a href="/auth">Login</a></li>
            <li><a href="/auth">Register</a></li>
          </>
        )}
      </ul>
    </nav>
  );
}