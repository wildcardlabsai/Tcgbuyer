import React from 'react';
import { supabaseConfigured } from '../lib/supabase';

export const ConfigCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!supabaseConfigured) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fefce8', padding: '16px',
      }}>
        <div style={{
          maxWidth: '520px', background: '#fff', borderRadius: '16px',
          border: '1px solid #fde68a', padding: '40px', textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>&#9888;</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '12px', color: '#92400e' }}>
            Configuration Required
          </h1>
          <p style={{ color: '#78716c', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '20px' }}>
            Supabase credentials are not configured. Create a <code style={{ background: '#f5f5f4', padding: '2px 6px', borderRadius: '4px' }}>.env</code> file
            with your project credentials:
          </p>
          <div style={{
            background: '#1e293b', color: '#e2e8f0', borderRadius: '8px', padding: '16px',
            fontSize: '0.82rem', fontFamily: 'monospace', textAlign: 'left', lineHeight: 1.8,
          }}>
            VITE_SUPABASE_URL=https://your-project.supabase.co<br />
            VITE_SUPABASE_ANON_KEY=your-anon-key-here
          </div>
          <p style={{ color: '#a8a29e', fontSize: '0.82rem', marginTop: '16px' }}>
            See DEPLOYMENT.md for full setup instructions.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
