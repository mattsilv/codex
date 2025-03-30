import { useState } from 'preact/hooks';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import Button from '../components/ui/Button';

export default function Auth() {
  const [mode, setMode] = useState('login');

  return (
    <div className="auth-container">
      <div className="auth-tabs">
        <Button
          onClick={() => setMode('login')}
          variant={mode === 'login' ? 'primary' : 'outline'}
        >
          Login
        </Button>
        <Button
          onClick={() => setMode('register')}
          variant={mode === 'register' ? 'primary' : 'outline'}
        >
          Register
        </Button>
      </div>
      
      <div className="auth-form">
        {mode === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}