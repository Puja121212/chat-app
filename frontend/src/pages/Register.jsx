import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const { register, isAuthenticated, loading, error, clearError } = useAuth();

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
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password);
    } catch {
      // Error is handled by AuthContext
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-layout">
        <aside className="auth-aside">
          <Link className="auth-brand" to="/register" aria-label="CHAT App home">
            <span className="auth-brand-mark" aria-hidden="true">c</span>
            <span>CHAT APP</span>
          </Link>
          <div className="auth-aside-copy">
            <p className="auth-eyebrow">A LITTLE CLOSER</p>
            <h2>Make room for better conversations.</h2>
            <p>Bring your people together in one calm, private space.</p>
          </div>
          <p className="auth-aside-footer"><span aria-hidden="true" /> PRIVATE / REAL-TIME</p>
        </aside>

        <div className="auth-panel">
          <header className="auth-heading">
            <p className="auth-eyebrow">GET STARTED</p>
            <h1>Create your account</h1>
               <p>A few details and you're ready to chat.</p>
          </header>

          {error && <div className="auth-alert" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
                minLength="3"
                maxLength="30"
              />
            </div>

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
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                minLength="6"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Enter your password again"
                required
                minLength="6"
                aria-invalid={Boolean(formData.confirmPassword && formData.password !== formData.confirmPassword)}
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="auth-field-error">Passwords do not match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || formData.password !== formData.confirmPassword}
              className="auth-submit"
            >
                 {loading ? 'Creating account...' : 'Create account'}
                 <span aria-hidden="true">-&gt;</span>
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in <span aria-hidden="true">-&gt;</span></Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Register;
