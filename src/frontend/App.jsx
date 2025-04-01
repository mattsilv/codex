import { Router } from 'preact-router';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';

// Layout components
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Page components
import Home from './pages/Home';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import PromptCreate from './pages/PromptCreate';
import PromptDetail from './pages/PromptDetail';
import Settings from './pages/Settings';
import SharedPrompt from './pages/SharedPrompt';
import Verify from './pages/Verify';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppProvider>
          <Router>
            <Home path="/" />
            <AuthLayout path="/auth" component={Auth} />
            <AuthLayout path="/auth/callback" component={AuthCallback} />
            <AuthLayout path="/verify" component={Verify} />
            <AuthLayout path="/verify/:email" component={Verify} />
            <MainLayout path="/dashboard" component={Dashboard} />
            <MainLayout path="/prompt/create" component={PromptCreate} />
            <MainLayout path="/prompt/:id" component={PromptDetail} />
            <MainLayout path="/settings" component={Settings} />
            <SharedPrompt path="/shared/:id" />
            <NotFound default />
          </Router>
        </AppProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
