import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import '../styles/Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Navigate only after isAuthenticated is truly set in context
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(credentials);
    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Left branding panel */}
      <div className="login-panel-left">
        <div className="login-brand">
          <img
            src="/logo.png"
            alt="Arvind Vidya Mandir"
            style={{ width: 130, height: 130, objectFit: 'contain', marginBottom: '1.25rem', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.3))' }}
          />
          <h1>Arvind Vidya Mandir</h1>
          <p style={{ fontSize: '0.95rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
            Naveen Nagar, Kakadeo, Kanpur
          </p>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Est. 1970 &nbsp;|&nbsp; तमसो माँ ज्योतिर्गमय
          </p>

          <div className="login-features">
            {[
              'Student & Teacher Management',
              'Attendance Tracking',
              'Fee Collection & Reports',
              'Report Cards & Academic Years',
            ].map(f => (
              <div className="login-feature-item" key={f}>
                <div className="login-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-panel-right">
        <div className="login-form-box">
          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label>Email address</label>
              <div className="login-input-wrap">
                <FiMail size={16} />
                <input
                  type="email"
                  placeholder="you@school.com"
                  value={credentials.email}
                  onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-field">
              <label>Password</label>
              <div className="login-input-wrap">
                <FiLock size={16} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Signing in…' : <>Sign in <FiArrowRight size={16} /></>}
            </button>
          </form>

          <p className="login-footer-note">
            Contact your administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
