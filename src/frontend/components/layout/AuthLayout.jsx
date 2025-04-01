import { useContext, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../../context/AuthContext';
import Header from './Header';
import Footer from './Footer';

export default function AuthLayout({ component: Component, ...props }) {
  const { isAuthenticated, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      route('/dashboard');
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (isAuthenticated) {
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
