import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import React from 'react';

vi.mock('../../lib/supabase', () => ({
  supabase: {},
  supabaseConfigured: true,
}));

vi.mock('../../contexts/AuthContext');

import { useAuth } from '../../contexts/AuthContext';
import { ProtectedRoute } from '../layouts/ProtectedRoute';

const mockedUseAuth = vi.mocked(useAuth);

function renderRoute(requireAdmin = false, requireDealer = false) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/" element={<p>Home</p>} />
        <Route path="/login" element={<p>Login page</p>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute requireAdmin={requireAdmin} requireDealer={requireDealer}>
              <p>Protected content</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

const baseAuth = {
  session: null,
  profile: null,
  organisation: null,
  membership: null,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  refreshProfile: vi.fn(),
};

describe('ProtectedRoute', () => {
  it('shows loading state while auth is loading', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuth, user: null, loading: true, isAdmin: false, isDealer: false,
    });
    renderRoute();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to login when no user', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuth, user: null, loading: false, isAdmin: false, isDealer: false,
    });
    renderRoute();
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('shows content for authenticated user', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuth, user: { id: '1' } as any, loading: false, isAdmin: false, isDealer: false,
    });
    renderRoute();
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects non-admin from admin route', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuth, user: { id: '1' } as any, loading: false, isAdmin: false, isDealer: false,
    });
    renderRoute(true);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('allows admin through admin route', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuth, user: { id: '1' } as any, loading: false, isAdmin: true, isDealer: false,
    });
    renderRoute(true);
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects non-dealer from dealer route', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuth, user: { id: '1' } as any, loading: false, isAdmin: false, isDealer: false,
    });
    renderRoute(false, true);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('allows dealer through dealer route', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuth, user: { id: '1' } as any, loading: false, isAdmin: false, isDealer: true,
    });
    renderRoute(false, true);
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});
