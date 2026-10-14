import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Logo } from '../../components/Logo';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {});
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Set new password</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Choose a new password for your account
          </p>
        </div>

        {success ? (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px',
            padding: '16px', textAlign: 'center', color: '#166534', fontSize: '0.92rem', lineHeight: 1.6,
          }}>
            Password updated. Redirecting to sign in...
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
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>New password</label>
                <input
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  minLength={8}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="At least 8 characters"
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>Confirm password</label>
                <input
                  type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                  minLength={8}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Repeat your password"
                />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '12px', background: 'var(--color-blue)', color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
