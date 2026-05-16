import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getDemoAuthConfig } from './demoAuth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInAsGuest: () => void;
  userRole: 'user' | 'admin';
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const demoAuth = getDemoAuthConfig(import.meta.env);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');

  useEffect(() => {
    let isMounted = true;

    const resolveRole = async (nextUser: User | null) => {
      if (!nextUser) {
        if (isMounted) {
          setUserRole('user');
        }
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', nextUser.id)
        .single();

      if (!isMounted) return;
      if (profile) {
        setUserRole(profile.role as 'user' | 'admin');
      } else if (nextUser.email?.endsWith('@admin.com')) {
        setUserRole('admin');
      } else {
        setUserRole('user');
      }
    };

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await resolveRole(session.user);
      } else {
        setUserRole('user');
      }

      if (isMounted) setLoading(false);
    }).catch(err => {
      console.warn("Auth initialization failed (expected in demo mode):", err);
      if (isMounted) setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(true);
      await resolveRole(session?.user ?? null);
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInAsGuest = () => {
    const guestUser = {
      id: 'demo-guest-user',
      email: demoAuth.email || 'guest@demo.com',
      user_metadata: { avatar_url: '', full_name: 'Demo Guest' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;
    setUser(guestUser);
    setSession({ user: guestUser } as unknown as Session);
    setUserRole('user');
  };

  const signOut = async () => {
    if (demoAuth.enabled && user?.id === 'demo-guest-user') {
      setUser(null);
      setSession(null);
      setUserRole('user');
      return;
    }
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    signInAsGuest,
    userRole,
    isDemoMode: demoAuth.enabled,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
