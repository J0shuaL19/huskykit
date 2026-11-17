import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import './Navigation.css';

function Navigation() {
  const { user, loading, error: sessionError, logout } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function signOut() {
    setBusy(true);
    setError('');
    try {
      await logout();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-header__brand" to="/">
          <span className="site-header__brand-mark" aria-hidden="true">
            H
          </span>
          HuskyKit
        </Link>
        <nav className="site-header__nav" aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/campus">Campus Life</NavLink>
          <NavLink to="/academic">Academic</NavLink>
          {!loading &&
            (user ? (
              <>
                <span className="site-header__user">{user.displayName}</span>
                <button type="button" disabled={busy} onClick={signOut}>
                  {busy ? 'Logging out...' : 'Log out'}
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">Log in</NavLink>
                <NavLink to="/register">Register</NavLink>
              </>
            ))}
        </nav>
      </div>
      {(error || sessionError) && (
        <p className="site-header__error" role="alert">
          {error || sessionError}
        </p>
      )}
    </header>
  );
}

Navigation.propTypes = {};

export default Navigation;
