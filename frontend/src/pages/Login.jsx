import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login, isAuthenticated, loading, error, clearError } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
       try {
         await login(formData.email, formData.password);
       } catch {
         // Error is handled by AuthContext
       }
  };

  return (
    <main className="auth-screen">
      <section className="auth-layout">
        <aside className="auth-aside">
          <Link className="auth-brand" to="/login" aria-label="CHAT App home">
            <span className="auth-brand-mark" aria-hidden="true">c</span>
            <span>CHAT APP</span>
          </Link>
          <div className="auth-aside-copy">
            <p className="auth-eyebrow">YOUR SPACE TO TALK</p>
            <h2>Good conversations, without the noise.</h2>
            <p>Pick up where you left off and stay close to the people who matter.</p>
          </div>
          <p className="auth-aside-footer"><span aria-hidden="true" /> PRIVATE / REAL-TIME</p>
        </aside>

        <div className="auth-panel">
          <header className="auth-heading">
            <p className="auth-eyebrow">WELCOME BACK</p>
            <h1>Sign in</h1>
            <p>Enter your details to continue to your chats.</p>
          </header>

          {error && <div className="auth-alert" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="auth-submit">
                 {loading ? 'Signing in...' : 'Sign in'}
                 <span aria-hidden="true">-&gt;</span>
            </button>
          </form>

          <p className="auth-switch">
            New to CHAT APP? <Link to="/register">Create an account <span aria-hidden="true">-&gt;</span></Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;
