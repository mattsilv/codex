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
    <div className="flex items-center justify-between w-full h-full px-6">
      <div className="text-xl font-bold mr-8">
        <a
          href="/"
          className="text-gray-800 hover:text-blue-600 transition-colors"
        >
          <strong>Codex</strong>
        </a>
      </div>

      <div className="flex-1 mx-8">
        <input
          type="search"
          placeholder="Search prompts..."
          aria-label="Search prompts"
          className="w-full px-4 py-2 rounded-full bg-gray-100 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded-full hover:bg-gray-100 text-gray-700 hover:text-blue-600 transition-colors"
          aria-label="Create new prompt"
          onClick={() => route('/prompt/create')}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {isAuthenticated ? (
          <div className="relative">
            <div className="group">
              <button className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  {user?.username?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              </button>

              <div className="absolute right-0 mt-2 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48 z-50">
                <a
                  href="/dashboard"
                  className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                >
                  Dashboard
                </a>
                <a
                  href="/settings"
                  className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                >
                  Settings
                </a>
                <a
                  href="#"
                  onClick={handleLogout}
                  className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                >
                  Logout
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <a
              href="/auth"
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              Login
            </a>
            <a
              href="/auth"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm font-medium"
            >
              Register
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
