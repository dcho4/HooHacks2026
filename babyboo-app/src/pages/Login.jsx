import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Baby, Mail, Lock, ArrowRight, AlertCircle, Star } from 'lucide-react';

export default function Login() {
  const { login, loginWithAuth0, hasAuth0, startNewAccount } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (hasAuth0) {
      loginWithAuth0();
      return;
    }
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    const success = login(email.trim(), password);
    if (success) navigate('/home');
    else setError('Invalid email or password.');
  };

  const handleSignUp = () => {
    if (hasAuth0) {
      loginWithAuth0({ authorizationParams: { screen_hint: 'signup' } });
    } else {
      startNewAccount();
      navigate('/');
    }
  };

  return (
    <div className="onboarding">
      <div className="onboarding-header">
        <div className="logo-mark"><Baby size={40} /></div>
        <h1>BabyBoo</h1>
        <p className="tagline">Your calm companion for the first 1000 days</p>
      </div>

      <div className="onboarding-card">
        <div className="step">
          {hasAuth0 ? (
            <>
              <h2>Welcome</h2>
              <p>Sign in or create an account to get started</p>
              <button className="btn-primary full-width" onClick={handleLogin} style={{ marginBottom: 12 }}>
                <Star size={18} /> Log In
              </button>
              <button className="btn-secondary full-width" onClick={handleSignUp}>
                Create Account
              </button>
            </>
          ) : (
            <>
              <h2>Log In</h2>
              <p>Enter your credentials to continue</p>

              {error && (
                <div className="login-error"><AlertCircle size={16} />{error}</div>
              )}

              <div className="input-with-icon">
                <Mail size={18} />
                <input type="email" placeholder="Email address" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }} autoFocus />
              </div>
              <div className="input-with-icon">
                <Lock size={18} />
                <input type="password" placeholder="Password" value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              </div>

              <button className="btn-primary full-width" onClick={handleLogin} style={{ marginTop: 8 }}>
                Log In <ArrowRight size={18} />
              </button>
              <button className="btn-text" onClick={handleSignUp} style={{ marginTop: 16 }}>
                Create a new account instead
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
