import { useContext, useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

export default function MainLayout({ component: Component, ...props }) {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  console.log('MainLayout render - isAuthenticated:', isAuthenticated, 'user:', user?.email);

  useEffect(() => {
    // Log auth state changes
    console.log('MainLayout useEffect - Auth state change detected:');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('loading:', loading);
    console.log('user:', user?.email);
    
    if (!loading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      route('/auth');
    }
  }, [isAuthenticated, loading, user]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via the useEffect
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="h-16 border-b border-gray-200 sticky top-0 bg-white z-20 shadow-sm">
        <div className="h-full flex items-center">
          <button
            className="md:hidden p-2 mx-2 rounded-lg hover:bg-gray-100 text-gray-700"
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <Header toggleSidebar={toggleSidebar} />
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={`w-64 bg-gray-50 border-r border-gray-200 fixed h-[calc(100vh-4rem)] top-16 left-0 overflow-y-auto transition-transform z-10 shadow-md md:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          <Sidebar />
        </aside>

        <main
          className={`flex-1 p-6 transition-all ${sidebarOpen ? 'md:ml-64' : ''}`}
        >
          <div className="max-w-6xl mx-auto">
            <Component {...props} />
          </div>
        </main>
      </div>

      <footer className="h-12 border-t border-gray-200 bg-white">
        <Footer />
      </footer>
    </div>
  );
}
