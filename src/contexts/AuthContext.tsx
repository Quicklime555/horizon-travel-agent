import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getDemoAuthConfig } from './demoAuth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
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
      } else if (demoAuth.enabled) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: demoAuth.email,
          password: demoAuth.password,
        });

        if (error) {
          console.error('Demo auto sign-in failed:', error.message);
        } else if (data.session?.user) {
          if (!isMounted) return;
          setSession(data.session);
          setUser(data.session.user);
          await resolveRole(data.session.user);
        }
      } else {
        setUserRole('user');
      }

      if (isMounted) setLoading(false);
    }).catch(err => {
      console.error("Auth initialization failed:", err);
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

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signOut,
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
