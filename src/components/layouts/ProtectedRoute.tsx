import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireDealer?: boolean;
}

export const ProtectedRoute: React.FC<Props> = ({ children, requireAdmin, requireDealer }) => {
  const { user, profile, loading, isAdmin, isDealer } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" />
          <p style={{ marginTop: '16px', color: 'var(--color-text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireDealer && !isDealer && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
