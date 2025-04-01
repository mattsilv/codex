import { route } from 'preact-router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div>
      <Header />
      <main className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h1>404 - Page Not Found</h1>
        <p>Sorry, the page you are looking for doesn't exist.</p>
        <div style={{ marginTop: '2rem' }}>
          <Button onClick={() => route('/')}>Go Home</Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}