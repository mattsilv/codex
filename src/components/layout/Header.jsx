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
    <header className="container">
      <nav>
        <ul>
          <li><strong><a href="/">Codex</a></strong></li>
        </ul>
        <ul>
          {isAuthenticated ? (
            <>
              <li><a href="/dashboard">Dashboard</a></li>
              <li>
                <details role="list" dir="rtl">
                  <summary aria-haspopup="listbox" role="button">{user?.username || 'User'}</summary>
                  <ul role="listbox">
                    <li><a href="/prompt/create">New Prompt</a></li>
                    <li><a onClick={handleLogout}>Logout</a></li>
                  </ul>
                </details>
              </li>
            </>
          ) : (
            <li><a href="/auth">Login</a></li>
          )}
        </ul>
      </nav>
    </header>
  );
}