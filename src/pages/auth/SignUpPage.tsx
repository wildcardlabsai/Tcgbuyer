import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';

export const SignUpPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)', padding: '16px',
      }}>
        <div style={{
          width: '100%', maxWidth: '420px', background: 'var(--color-white)',
          borderRadius: '16px', border: '1px solid var(--color-border)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)', padding: '40px', textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: '#dcfce7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '1.5rem',
          }}>✓</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>Check your email</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            We&rsquo;ve sent a confirmation link to <strong>{email}</strong>.
            Click the link to activate your account.
          </p>
          <Link
            to="/login"
            style={{
              display: 'inline-block', marginTop: '24px', padding: '10px 24px',
              background: 'var(--color-blue)', color: '#fff', borderRadius: '8px',
              fontWeight: 600, fontSize: '0.92rem', textDecoration: 'none',
            }}
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)', padding: '16px',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px', background: 'var(--color-white)',
        borderRadius: '16px', border: '1px solid var(--color-border)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)', padding: '40px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-block', marginBottom: '24px' }}>
            <Logo height={28} />
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Create an account</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Sign up to get started
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
            padding: '12px 16px', marginBottom: '20px', color: '#dc2626', fontSize: '0.88rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>Full name</label>
            <input
              type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              placeholder="Your full name"
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              placeholder="you@example.com"
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>Password</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              minLength={8}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              placeholder="At least 8 characters"
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', background: 'var(--color-blue)', color: '#fff',
            border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 700,
            cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-blue)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};
