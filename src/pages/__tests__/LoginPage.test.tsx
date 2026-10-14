import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import '../../test/mocks/supabase';
import { renderWithProviders } from '../../test/helpers';
import { LoginPage } from '../auth/LoginPage';

describe('LoginPage', () => {
  it('renders sign-in form', () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('has link to apply page', () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    expect(screen.getByText('Apply here')).toHaveAttribute('href', '/apply');
  });

  it('has link to forgot password', () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    expect(screen.getByText('Forgot password?')).toHaveAttribute('href', '/forgot-password');
  });

  it('disables button while loading', async () => {
    const { mockSupabase } = await import('../../test/mocks/supabase');
    mockSupabase.auth.signInWithPassword.mockImplementation(
      () => new Promise(() => {}),
    );
    renderWithProviders(<LoginPage />, { route: '/login' });

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
    });
  });
});
