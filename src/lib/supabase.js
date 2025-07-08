// src/lib/supabase.js - Configuration Supabase sécurisée
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug en mode développement uniquement
if (import.meta.env.DEV) {
  console.log('🔐 Configuration Supabase:');
  console.log('URL:', supabaseUrl || '❌ MANQUANTE');
  console.log('Key:', supabaseAnonKey ? '✅ Présente' : '❌ MANQUANTE');
}

// Message d'erreur clair en développement
if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(`
    ⚠️ ATTENTION: Variables Supabase manquantes!
    
    Pour le développement local, créez un fichier .env.local:
    VITE_SUPABASE_URL=https://votre-projet.supabase.co
    VITE_SUPABASE_ANON_KEY=votre-clé-anon
    
    Pour Netlify, configurez dans Dashboard:
    1. Site configuration → Environment variables
    2. Ajoutez:
       - VITE_SUPABASE_URL = https://votre-projet.supabase.co
       - VITE_SUPABASE_ANON_KEY = votre-clé-anon
    3. Redéployez le site
    
    Variables actuelles:
    - URL: ${supabaseUrl || 'NON DÉFINIE'}
    - Key: ${supabaseAnonKey ? 'DÉFINIE' : 'NON DÉFINIE'}
  `);
}

// Client avec fallback pour éviter les erreurs
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper pour vérifier si Supabase est configuré
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabase);
};

// Fonction pour vérifier si un utilisateur est admin
export const checkIsAdmin = async (userId) => {
  if (!userId || !supabase) return false;
  
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', userId)
      .single();
    
    return !!data && !error;
  } catch (error) {
    console.error('Erreur checkIsAdmin:', error);
    return false;
  }
};

