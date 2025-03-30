import { Router } from 'preact-router';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

// Layout components
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Page components
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import PromptCreate from './pages/PromptCreate';
import PromptDetail from './pages/PromptDetail';
import SharedPrompt from './pages/SharedPrompt';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Home path="/" />
          <AuthLayout path="/auth" component={Auth} />
          <MainLayout path="/dashboard" component={Dashboard} />
          <MainLayout path="/prompt/create" component={PromptCreate} />
          <MainLayout path="/prompt/:id" component={PromptDetail} />
          <SharedPrompt path="/shared/:id" />
          <NotFound default />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}