// src/contexts/AuthContext.jsx - Contexte d'authentification sécurisé
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, checkIsAdmin, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si Supabase n'est pas configuré, on passe en mode dégradé
    if (!isSupabaseConfigured()) {
      console.warn('AuthProvider: Supabase non configuré - Mode dégradé activé');
      setLoading(false);
      return;
    }

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (session?.user) {
          setUser(session.user);
          const adminStatus = await checkIsAdmin(session.user.id);
          setIsAdmin(adminStatus);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const adminStatus = await checkIsAdmin(session.user.id);
        setIsAdmin(adminStatus);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Service d\'authentification non disponible' } 
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const adminStatus = await checkIsAdmin(data.user.id);
        setIsAdmin(adminStatus);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Service d\'authentification non disponible' } };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsAdmin(false);
      
      return { error: null };
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      return { error };
    }
  };

  const value = {
    user,
    isAdmin,
    loading,
    signIn,
    signOut,
    isSupabaseConfigured: isSupabaseConfigured(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

