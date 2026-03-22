import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Baby, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login, resetApp } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    const success = login(email.trim(), password);
    if (success) {
      navigate('/home');
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="onboarding">
      <div className="onboarding-header">
        <div className="logo-mark">
          <Baby size={40} />
        </div>
        <h1>BabyBoo</h1>
        <p className="tagline">Welcome back!</p>
      </div>

      <div className="onboarding-card">
        <div className="step">
          <h2>Log In</h2>
          <p>Enter your credentials to continue</p>

          {error && (
            <div className="login-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="input-with-icon">
            <Mail size={18} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              autoFocus
            />
          </div>

          <div className="input-with-icon">
            <Lock size={18} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button
            className="btn-primary full-width"
            onClick={handleLogin}
            style={{ marginTop: 8 }}
          >
            Log In <ArrowRight size={18} />
          </button>

          <button
            className="btn-text"
            onClick={() => { resetApp(); navigate('/'); }}
            style={{ marginTop: 16 }}
          >
            Create a new account instead
          </button>
        </div>
      </div>
    </div>
  );
}
