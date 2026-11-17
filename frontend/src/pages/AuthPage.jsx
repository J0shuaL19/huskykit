import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './AuthPage.css';

function AuthPage({ mode }) {
  const { user, loading, authenticate } = useAuth();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next');
  const destination = next && /^\/(academic|campus)(\/|\?|$)/.test(next) ? next : '/academic';
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const registering = mode === 'register';
  const title = registering ? 'Create an account' : 'Welcome back';

  async function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError('');
    try {
      await authenticate(mode, values);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return (
      <p className="page-shell" role="status">
        Checking your session...
      </p>
    );
  if (user) return <Navigate to={destination} replace />;
  return (
    <div className="auth-page page-shell">
      <form className="auth-page__form" onSubmit={submit}>
        <p className="auth-page__eyebrow">HuskyKit community</p>
        <h1>{title}</h1>
        <p>Browse freely. Sign in to share and manage your own experiences.</p>
        {registering && (
          <label>
            Display name
            <input name="displayName" autoComplete="name" required minLength={2} maxLength={60} />
          </label>
        )}
        <label>
          Username
          <input
            name="username"
            autoComplete="username"
            required
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_]+"
            aria-describedby="username-help"
          />
        </label>
        <small id="username-help">3–30 letters, numbers, or underscores.</small>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete={registering ? 'new-password' : 'current-password'}
            required
            minLength={8}
            maxLength={72}
            aria-describedby="password-help"
          />
        </label>
        <small id="password-help">At least 8 characters; at most 72 UTF-8 bytes.</small>
        {error && (
          <p className="auth-page__error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy}>
          {busy ? 'Please wait...' : registering ? 'Create account' : 'Log in'}
        </button>
        <p>
          {registering ? 'Already registered?' : 'New to HuskyKit?'}{' '}
          <Link
            to={(registering ? '/login' : '/register') + '?next=' + encodeURIComponent(destination)}
          >
            {registering ? 'Log in' : 'Create an account'}
          </Link>
        </p>
      </form>
    </div>
  );
}
AuthPage.propTypes = { mode: PropTypes.oneOf(['login', 'register']).isRequired };
export default AuthPage;
