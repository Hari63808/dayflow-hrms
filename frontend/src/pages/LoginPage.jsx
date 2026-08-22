import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Mail, Lock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setToast({ message: 'Please enter both email and password.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.success) {
        setToast({ message: 'Login successful! Redirecting...', type: 'success' });
        setTimeout(() => {
          if (res.user.role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 500);
      } else {
        setToast({ message: res.message || 'Login failed', type: 'error' });
      }
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Authentication error. Check your server.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role) => {
    if (role === 'admin') {
      setEmail('admin@dayflow.com');
      setPassword('admin123');
    } else {
      setEmail('employee@dayflow.com');
      setPassword('user123');
    }
  };

  return (
    <div className="glass-card" style={{ padding: '2.5rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Welcome Back 👋
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Sign in to access your Dayflow HRMS workspace.
        </p>
      </div>

      {/* Quick Demo Login Buttons */}
      <div style={{
        backgroundColor: 'var(--bg-app)',
        border: '1px dashed var(--primary)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
          ⚡ Hackathon Quick Login
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => fillDemoAccount('admin')}
            className="btn btn-outline btn-sm"
            style={{ flex: 1, gap: '0.35rem', fontSize: '0.8rem' }}
          >
            <ShieldCheck size={14} color="#8b5cf6" /> Admin Demo
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('employee')}
            className="btn btn-outline btn-sm"
            style={{ flex: 1, gap: '0.35rem', fontSize: '0.8rem' }}
          >
            <UserCheck size={14} color="#6366f1" /> Employee Demo
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="email"
              className="form-input"
              style={{ paddingLeft: '2.75rem' }}
              placeholder="name@dayflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="password"
              className="form-input"
              style={{ paddingLeft: '2.75rem' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.85rem', marginTop: '1rem', fontSize: '0.95rem' }}
        >
          {loading ? 'Authenticating...' : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
          Register Now
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
