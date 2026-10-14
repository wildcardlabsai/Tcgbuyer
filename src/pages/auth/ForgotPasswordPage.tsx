import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Logo } from '../../components/Logo';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Reset password</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Enter your email and we&rsquo;ll send a reset link
          </p>
        </div>

        {sent ? (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px',
            padding: '16px', textAlign: 'center', color: '#166534', fontSize: '0.92rem', lineHeight: 1.6,
          }}>
            If an account exists for <strong>{email}</strong>, you&rsquo;ll receive a password reset link shortly.
          </div>
        ) : (
          <>
            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
                padding: '12px 16px', marginBottom: '20px', color: '#dc2626', fontSize: '0.88rem',
              }}>{error}</div>
            )}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>Email</label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="you@example.com"
                />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '12px', background: 'var(--color-blue)', color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
          <Link to="/login" style={{ color: 'var(--color-blue)', fontWeight: 600 }}>Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};
