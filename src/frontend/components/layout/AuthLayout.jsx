import { useContext, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../../context/AuthContext';
import Header from './Header';
import Footer from './Footer';

export default function AuthLayout({ component: Component, ...props }) {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const isCallbackPage = props.path && props.path.includes('/auth/callback');

  console.log('AuthLayout render - isAuthenticated:', isAuthenticated, 'loading:', loading, 'isCallbackPage:', isCallbackPage);

  useEffect(() => {
    console.log('AuthLayout useEffect - Auth state change:');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('loading:', loading);
    console.log('isCallbackPage:', isCallbackPage);
    
    if (!loading && isAuthenticated && !isCallbackPage) {
      console.log('AuthLayout - User is authenticated, redirecting to dashboard');
      // Use a slight delay to ensure all state updates are processed
      setTimeout(() => {
        route('/dashboard');
      }, 100);
    }
  }, [isAuthenticated, loading, isCallbackPage]);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (isAuthenticated && !isCallbackPage) {
    return null; // Will redirect via the useEffect
  }

  return (
    <div>
      <Header />
      <main className="container">
        <Component {...props} />
      </main>
      <Footer />
    </div>
  );
}
