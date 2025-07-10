// src/contexts/AuthContext.jsx - VERSION CORRIGÉE SANS BOUCLE INFINIE
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const [sessionExpired, setSessionExpired] = useState(false);

  // ✅ FONCTION POUR RAFRAÎCHIR LA SESSION
  const refreshSession = useCallback(async () => {
    if (!isSupabaseConfigured()) return false;

    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Erreur lors du rafraîchissement de session:', error);
        setSessionExpired(true);
        return false;
      }
      
      if (data.session) {
        setUser(data.session.user);
        const adminStatus = await checkIsAdmin(data.session.user.id);
        setIsAdmin(adminStatus);
        setSessionExpired(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      setSessionExpired(true);
      return false;
    }
  }, []);

  // ✅ FONCTION POUR VÉRIFIER SI LA SESSION EST VALIDE
  const isSessionValid = useCallback(async () => {
    if (!isSupabaseConfigured()) return false;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        setSessionExpired(true);
        return false;
      }

      // Vérifier si le token expire bientôt (dans les 5 prochaines minutes)
      const expiresAt = session.expires_at * 1000; // Convertir en millisecondes
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (expiresAt - now < fiveMinutes) {
        console.log('Token expire bientôt, rafraîchissement automatique...');
        return await refreshSession();
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification de session:', error);
      setSessionExpired(true);
      return false;
    }
  }, [refreshSession]);

  // ✅ FONCTION POUR EXÉCUTER UNE ACTION AVEC VÉRIFICATION DE SESSION
  const executeWithValidSession = useCallback(async (action) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Service d\'authentification non disponible');
    }

    // Vérifier et rafraîchir la session si nécessaire
    const sessionValid = await isSessionValid();
    if (!sessionValid) {
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }

    try {
      return await action();
    } catch (error) {
      // Si l'erreur indique une session expirée, essayer de rafraîchir
      if (error.message?.includes('JWT') || error.message?.includes('expired') || error.status === 401) {
        console.log('Tentative de rafraîchissement de session après erreur...');
        const refreshed = await refreshSession();
        if (refreshed) {
          // Réessayer l'action après rafraîchissement
          return await action();
        } else {
          setSessionExpired(true);
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
      }
      throw error;
    }
  }, [isSessionValid, refreshSession]);

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
        setSessionExpired(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ USEEFFECT PRINCIPAL - SANS BOUCLE INFINIE
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
          setSessionExpired(false);
        } else {
          setUser(null);
          setIsAdmin(false);
          if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
            setSessionExpired(false);
          }
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []); // ✅ TABLEAU DE DÉPENDANCES VIDE

  // ✅ USEEFFECT SÉPARÉ POUR LE RAFRAÎCHISSEMENT AUTOMATIQUE
  useEffect(() => {
    if (!user || !isAdmin) return;

    console.log('Configuration du rafraîchissement automatique de session...');
    
    const refreshInterval = setInterval(async () => {
      console.log('Rafraîchissement automatique de session...');
      await refreshSession();
    }, 45 * 60 * 1000); // 45 minutes

    return () => {
      console.log('Nettoyage du rafraîchissement automatique');
      clearInterval(refreshInterval);
    };
  }, [user, isAdmin]); // ✅ PAS refreshSession dans les dépendances

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
        setSessionExpired(false);
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
      setSessionExpired(false);
      
      return { error: null };
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      return { error };
    }
  };

  // ✅ FONCTION POUR RÉINITIALISER L'ÉTAT DE SESSION EXPIRÉE
  const clearSessionExpired = useCallback(() => {
    setSessionExpired(false);
  }, []);

  const value = {
    user,
    isAdmin,
    loading,
    sessionExpired,
    signIn,
    signOut,
    refreshSession,
    executeWithValidSession,
    clearSessionExpired,
    isSupabaseConfigured: isSupabaseConfigured(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

