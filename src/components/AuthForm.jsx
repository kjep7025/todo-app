import { useState } from 'react';
import { signIn, signUp } from '../lib/supabase';
import './AuthForm.css';

function AuthForm({ onAuthSuccess, error: globalError }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Show global error if passed down
  const displayError = error || globalError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password);
        if (result.error) throw result.error;
        setError('Check your email for the confirmation link!');
        setIsSignUp(false);
      } else {
        result = await signIn(email, password);
        if (result.error) throw result.error;
        onAuthSuccess(result.data.user);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>{isSignUp ? 'Sign Up' : 'Sign In'}</h1>
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            autoFocus
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            required
            minLength={6}
          />
        </label>

        {displayError && <div className="error-message">{displayError}</div>}

        <div className="auth-actions">
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </div>
      </form>

      <p className="auth-toggle">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button 
          type="button" 
          className="link-button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
          }}
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
}

export default AuthForm;