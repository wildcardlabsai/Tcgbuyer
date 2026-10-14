import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, DealerOrganisation, DealerMembership } from '../lib/database.types';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  organisation: DealerOrganisation | null;
  membership: DealerMembership | null;
  loading: boolean;
  isAdmin: boolean;
  isDealer: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    organisation: null,
    membership: null,
    loading: true,
    isAdmin: false,
    isDealer: false,
  });

  async function loadProfile(userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    let organisation: DealerOrganisation | null = null;
    let membership: DealerMembership | null = null;

    if (profile) {
      const { data: mem } = await supabase
        .from('dealer_memberships')
        .select('*, dealer_organisations(*)')
        .eq('user_id', userId)
        .limit(1)
        .single();

      if (mem) {
        membership = mem as unknown as DealerMembership;
        organisation = (mem as Record<string, unknown>).dealer_organisations as unknown as DealerOrganisation;
      }
    }

    return { profile, organisation, membership };
  }

  async function refreshProfile() {
    if (!state.user) return;
    const { profile, organisation, membership } = await loadProfile(state.user.id);
    setState(prev => ({
      ...prev,
      profile,
      organisation,
      membership,
      isAdmin: profile?.role === 'platform_admin',
      isDealer: ['dealer_owner', 'dealer_manager', 'dealer_staff'].includes(profile?.role || ''),
    }));
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { profile, organisation, membership } = await loadProfile(session.user.id);
        setState({
          user: session.user,
          session,
          profile,
          organisation,
          membership,
          loading: false,
          isAdmin: profile?.role === 'platform_admin',
          isDealer: ['dealer_owner', 'dealer_manager', 'dealer_staff'].includes(profile?.role || ''),
        });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { profile, organisation, membership } = await loadProfile(session.user.id);
        setState({
          user: session.user,
          session,
          profile,
          organisation,
          membership,
          loading: false,
          isAdmin: profile?.role === 'platform_admin',
          isDealer: ['dealer_owner', 'dealer_manager', 'dealer_staff'].includes(profile?.role || ''),
        });
      } else {
        setState({
          user: null,
          session: null,
          profile: null,
          organisation: null,
          membership: null,
          loading: false,
          isAdmin: false,
          isDealer: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error as Error | null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
