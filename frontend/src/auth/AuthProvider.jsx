import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from './AuthContext';
import { request } from '../api/request';

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    request('/auth/me', { signal: controller.signal })
      .then((data) => setUser(data.user))
      .catch((failure) => {
        if (failure.name !== 'AbortError') setError(failure.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function authenticate(mode, values) {
    const data = await request('/auth/' + mode, { method: 'POST', body: values });
    setUser(data.user);
    setError('');
  }
  async function logout() {
    await request('/auth/logout', { method: 'POST' });
    setUser(null);
    setError('');
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
AuthProvider.propTypes = { children: PropTypes.node.isRequired };
export default AuthProvider;
