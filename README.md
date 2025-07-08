# Ma Nouvelle Mission - Site Web Corrigé

## 🎯 Problèmes résolus

✅ **Variables d'environnement Supabase** - Configuration corrigée avec fallback  
✅ **Code dupliqué** - Fichiers nettoyés et optimisés  
✅ **Gestion d'erreurs** - Application robuste même sans Supabase  
✅ **Configuration Netlify** - Déploiement optimisé  
✅ **Build de production** - Génération de pages statiques fonctionnelle  
✅ **SEO** - Métadonnées et sitemap automatique  

## 🚀 Déploiement sur Netlify

### 1. Préparer le repository GitHub

```bash
# Initialiser le repository Git
git init
git add .
git commit -m "Initial commit - Site corrigé"

# Ajouter votre repository GitHub
git remote add origin https://github.com/votre-username/ma-nouvelle-mission.git
git push -u origin main
```

### 2. Configurer Netlify

1. **Connecter le repository** :
   - Allez sur [netlify.com](https://netlify.com)
   - Cliquez sur "New site from Git"
   - Sélectionnez votre repository GitHub

2. **Configuration de build** :
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
   - Node version: `18` ou plus récent

3. **Variables d'environnement** (optionnel) :
   - Allez dans Site Settings → Environment variables
   - Ajoutez (si vous avez Supabase) :
     ```
     VITE_SUPABASE_URL=https://votre-projet.supabase.co
     VITE_SUPABASE_ANON_KEY=votre-clé-anon-supabase
     ```

### 3. Déployer

Le site se déploiera automatiquement ! 🎉

## 🔧 Développement local

### Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

### Variables d'environnement locales

Créez un fichier `.env.local` (optionnel) :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon-supabase
```

## 📋 Fonctionnalités

### ✅ Mode démonstration
- L'application fonctionne **sans Supabase** avec des données de démonstration
- Affichage d'un message informatif en mode démonstration
- 3 missions d'exemple pré-configurées

### ✅ Fonctionnalités complètes
- 🔍 Recherche en temps réel
- 🏷️ Filtres par type, localisation, salaire
- 📱 Design responsive (mobile/desktop)
- 🌙 Mode sombre/clair
- 📧 Formulaires de candidature (Netlify Forms)
- 🔐 Authentification admin (si Supabase configuré)
- 📊 Gestion des missions (si Supabase configuré)

### ✅ SEO optimisé
- 🗺️ Sitemap automatique
- 🤖 robots.txt
- 📄 Pages statiques pour chaque mission
- 🏷️ Métadonnées Open Graph et Twitter Cards
- 📊 Structured Data pour Google Jobs

## 🗂️ Structure du projet

```
ma-nouvelle-mission-fixed/
├── src/
│   ├── components/          # Composants React
│   ├── contexts/           # Contextes (Auth)
│   ├── services/           # Services (Jobs, Supabase)
│   ├── lib/               # Utilitaires
│   ├── App.jsx            # Composant principal
│   └── main.jsx           # Point d'entrée
├── scripts/
│   └── generate-static-pages.js  # Génération SEO
├── public/                # Assets statiques
├── dist/                  # Build de production
├── netlify.toml          # Configuration Netlify
├── package.json          # Dépendances
└── vite.config.js        # Configuration Vite
```

## 🔧 Configuration Supabase (optionnel)

Si vous souhaitez activer la base de données :

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et la clé anonyme

### 2. Créer les tables

```sql
-- Table des missions
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  salary VARCHAR(100) NOT NULL,
  salary_type VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  benefits TEXT[],
  slug VARCHAR(255) UNIQUE,
  featured BOOLEAN DEFAULT FALSE,
  applicants INTEGER DEFAULT 0,
  posted_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des administrateurs
CREATE TABLE admin_users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fonction pour incrémenter les candidatures
CREATE OR REPLACE FUNCTION increment_applicants(p_job_id INTEGER)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  UPDATE jobs 
  SET applicants = applicants + 1 
  WHERE id = p_job_id;
  
  IF FOUND THEN
    result := '{"success": true, "message": "Candidature enregistrée"}'::JSON;
  ELSE
    result := '{"success": false, "message": "Mission non trouvée"}'::JSON;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

### 3. Configurer les politiques RLS

```sql
-- Activer RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique pour les jobs
CREATE POLICY "Jobs are viewable by everyone" ON jobs
  FOR SELECT USING (true);

-- Politique d'écriture pour les admins uniquement
CREATE POLICY "Jobs are editable by admins only" ON jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );
```

## 🐛 Dépannage

### Le site ne se charge pas
- Vérifiez que le build s'est bien passé dans Netlify
- Consultez les logs de déploiement
- Vérifiez la configuration du `netlify.toml`

### Les formulaires ne fonctionnent pas
- Vérifiez que Netlify Forms est activé
- Le formulaire doit être présent dans le HTML statique (c'est fait)

### Mode sombre ne fonctionne pas
- Videz le cache du navigateur
- Vérifiez la console pour les erreurs JavaScript

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs de build Netlify
2. Consultez la console du navigateur
3. L'application fonctionne en mode démonstration même sans Supabase

## 🎉 Fonctionnalités bonus

- **Progressive Web App** ready
- **Optimisations de performance** (lazy loading, code splitting)
- **Accessibilité** (ARIA labels, navigation clavier)
- **Analytics** ready (ajoutez votre code de tracking)

---

**Développé avec ❤️ pour Ma Nouvelle Mission**

