import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setMockUser: (email: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  setMockUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's a mock user in localStorage
    const storedMockUser = localStorage.getItem('mock_user');
    if (storedMockUser) {
      setUser(JSON.parse(storedMockUser));
      setLoading(false);
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        localStorage.removeItem('mock_user'); // Clear mock if real session exists
      }
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        localStorage.removeItem('mock_user');
      } else if (!localStorage.getItem('mock_user')) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const setMockUser = (email: string) => {
    const mockUser = {
      id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
      email,
      aud: 'authenticated',
      role: 'authenticated',
      user_metadata: { full_name: email.split('@')[0] },
      created_at: new Error().stack,
    } as any;
    
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const signOut = async () => {
    localStorage.removeItem('mock_user');
    setUser(null);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, setMockUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
