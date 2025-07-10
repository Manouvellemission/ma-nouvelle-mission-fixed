// src/services/jobService.js - Service de gestion des emplois avec fallback
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Données de fallback si Supabase n'est pas configuré
const FALLBACK_JOBS = [
  {
    id: 1,
    title: "Développeur Full Stack React/Node.js",
    company: "TechCorp Innovation",
    location: "Paris",
    type: "Mission",
    salary: "650",
    salary_type: "TJM",
    description: `Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe sur un projet innovant de plateforme e-commerce.

Vous travaillerez sur le développement d'une application web moderne utilisant React pour le frontend et Node.js pour le backend, avec une base de données PostgreSQL.

Le projet implique la création de fonctionnalités avancées comme un système de paiement intégré, un tableau de bord administrateur, et une API REST robuste.

Vous collaborerez étroitement avec notre équipe de designers UX/UI et participerez aux décisions techniques importantes.`,
    requirements: [
      "5+ années d'expérience en développement web",
      "Maîtrise de React et de l'écosystème JavaScript moderne",
      "Expérience avec Node.js et Express",
      "Connaissance de PostgreSQL et des ORM (Prisma, Sequelize)",
      "Familiarité avec Git et les méthodologies Agile",
      "Capacité à travailler en équipe et à communiquer efficacement"
    ],
    benefits: [
      "Télétravail partiel (3 jours/semaine)",
      "Mutuelle d'entreprise prise en charge à 100%",
      "Formation continue et budget formation",
      "Équipement informatique fourni",
      "Tickets restaurant",
      "Ambiance de travail décontractée"
    ],
    posted_date: new Date().toISOString().split('T')[0],
    applicants: 12,
    featured: true,
    slug: "developpeur-full-stack-react-nodejs-paris"
  },
  {
    id: 2,
    title: "Expert Cybersécurité",
    company: "SecureIT Solutions",
    location: "Lyon",
    type: "CDI",
    salary: "65K-75K",
    salary_type: "Annuel",
    description: `Rejoignez notre équipe de cybersécurité en tant qu'expert pour protéger nos infrastructures et celles de nos clients.

Vous serez responsable de l'analyse des vulnérabilités, de la mise en place de solutions de sécurité, et de la formation des équipes aux bonnes pratiques.

Mission passionnante dans un secteur en pleine croissance avec des défis techniques stimulants.`,
    requirements: [
      "Master en cybersécurité ou équivalent",
      "Certifications CISSP, CEH ou similaires",
      "Expérience en pentesting et audit de sécurité",
      "Maîtrise des outils de sécurité (Nessus, Metasploit, etc.)",
      "Connaissance des normes ISO 27001",
      "Capacité à rédiger des rapports techniques"
    ],
    benefits: [
      "Salaire attractif avec primes",
      "Formation continue certifiante",
      "Matériel de pointe fourni",
      "Participation aux conférences sécurité",
      "Télétravail possible",
      "Mutuelle premium"
    ],
    posted_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    applicants: 8,
    featured: false,
    slug: "expert-cybersecurite-lyon"
  },
  {
    id: 3,
    title: "DevOps Engineer",
    company: "CloudTech Startup",
    location: "Marseille",
    type: "Mission",
    salary: "600",
    salary_type: "TJM",
    description: `Nous cherchons un DevOps Engineer pour optimiser notre infrastructure cloud et automatiser nos processus de déploiement.

Vous travaillerez avec des technologies modernes comme Kubernetes, Docker, et Terraform pour créer une infrastructure scalable et robuste.

Environnement startup dynamique avec beaucoup d'autonomie et d'opportunités d'apprentissage.`,
    requirements: [
      "3+ années d'expérience DevOps",
      "Maîtrise de Docker et Kubernetes",
      "Expérience avec AWS/Azure/GCP",
      "Connaissance de Terraform et Ansible",
      "Scripting Bash/Python",
      "Expérience CI/CD (Jenkins, GitLab CI)"
    ],
    benefits: [
      "Équipe jeune et dynamique",
      "Technologies de pointe",
      "Possibilité de télétravail",
      "Formation sur les nouvelles technologies cloud",
      "Environnement startup dynamique"
    ],
    posted_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    applicants: 5,
    featured: true,
    slug: "devops-engineer-marseille"
  }
];

// Cache pour les jobs
let jobsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const jobService = {
  // Récupérer toutes les missions avec cache et timeout
  async fetchJobs() {
    // Vérifier le cache d'abord
    if (jobsCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      console.log('Utilisation du cache pour les jobs');
      return jobsCache;
    }

    if (!isSupabaseConfigured()) {
      console.warn('Supabase non configuré, utilisation des données de fallback');
      jobsCache = FALLBACK_JOBS;
      cacheTimestamp = Date.now();
      return FALLBACK_JOBS;
    }

    try {
      // Timeout pour éviter les blocages
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 30000)
      );

      const supabasePromise = supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await Promise.race([supabasePromise, timeoutPromise]);

      if (error) {
        console.error('Erreur Supabase:', error);
        // Retourner le cache si disponible, sinon fallback
        return jobsCache || FALLBACK_JOBS;
      }

      // Mettre à jour le cache
      jobsCache = data || FALLBACK_JOBS;
      cacheTimestamp = Date.now();
      
      return jobsCache;
    } catch (error) {
      console.error('Erreur lors de la récupération des jobs:', error);
      // Retourner le cache si disponible, sinon fallback
      return jobsCache || FALLBACK_JOBS;
    }
  },

  // Invalider le cache
  clearCache() {
    jobsCache = null;
    cacheTimestamp = null;
  },

  // Créer une nouvelle mission
 async createJob(jobData) {
  if (!isSupabaseConfigured()) {
    throw new Error('Service de base de données non disponible. Veuillez contacter l\'administrateur.');
  }

  console.log('[jobService.createJob] Début création:', {
    title: jobData.title,
    timestamp: new Date().toISOString()
  });

  // Format propre
  const cleanData = {
    ...jobData,
    requirements: Array.isArray(jobData.requirements)
      ? jobData.requirements
      : jobData.requirements.split('\n').filter(r => r.trim()),
    benefits: Array.isArray(jobData.benefits)
      ? jobData.benefits
      : jobData.benefits.split('\n').filter(b => b.trim()),
    applicants: jobData.applicants || 0,
    created_at: new Date().toISOString()
  };

  // Log du slug + taille du payload
  const payloadSize = new Blob([JSON.stringify(cleanData)]).size;
  console.log(`[jobService.createJob] Slug: ${cleanData.slug}`);
  console.log(`[jobService.createJob] Taille du payload: ${payloadSize} octets`);

  // Vérif duplication slug
  const { data: existingSlug, error: slugCheckError } = await supabase
    .from('jobs')
    .select('id')
    .eq('slug', cleanData.slug);

  if (slugCheckError) {
    console.error('[jobService.createJob] Erreur vérif slug:', slugCheckError);
  }

  if (existingSlug && existingSlug.length > 0) {
    throw new Error('Une mission avec ce titre (slug) existe déjà.');
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    console.log('[jobService.createJob] Envoi de la requête Supabase...');
    const { data, error } = await supabase
      .from('jobs')
      .insert([cleanData])
      .select()
      .abortSignal(controller.signal);

    clearTimeout(timeout);

    if (error) {
      console.error('[jobService.createJob] Erreur Supabase:', error);
      if (error.code === '23505') {
        throw new Error('Duplicata : une mission identique existe déjà');
      } else if (error.code === '23502') {
        throw new Error('Champs obligatoires manquants');
      } else if (error.message?.includes('JWT')) {
        throw new Error('Session expirée. Veuillez vous reconnecter');
      }
      throw new Error(error.message || 'Erreur inconnue lors de la création');
    }

    if (!data || data.length === 0) {
      throw new Error('Aucune donnée retournée après insertion');
    }

    this.clearCache();
    console.log('[jobService.createJob] Mission créée avec succès');
    return { success: true, data: data[0] };

  } catch (error) {
    console.error('[jobService.createJob] Erreur finale:', error);
    if (error.name === 'AbortError') {
      throw new Error('La requête Supabase a été annulée (délai dépassé)');
    }
    throw error;
  }
},

  // Mettre à jour une mission
  async updateJob(id, jobData) {
    if (!isSupabaseConfigured()) {
      throw new Error('Service de base de données non disponible. Veuillez contacter l\'administrateur.');
    }

    console.log('[jobService.updateJob] Début mise à jour:', {
      id,
      title: jobData.title,
      timestamp: new Date().toISOString()
    });

    try {
      // S'assurer que les données sont correctement formatées
      const cleanData = {
        ...jobData,
        requirements: Array.isArray(jobData.requirements) 
          ? jobData.requirements 
          : jobData.requirements.split('\n').filter(r => r.trim()),
        benefits: Array.isArray(jobData.benefits)
          ? jobData.benefits
          : jobData.benefits.split('\n').filter(b => b.trim()),
        updated_at: new Date().toISOString()
      };

      console.log('[jobService.updateJob] Données préparées, envoi à Supabase...');

      // Créer une promesse avec timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La requête Supabase prend trop de temps')), 30000);
      });

      const supabasePromise = supabase
        .from('jobs')
        .update(cleanData)
        .eq('id', id)
        .select();

      console.log('[jobService.updateJob] Requête envoyée, attente de la réponse...');

      const { data, error } = await Promise.race([supabasePromise, timeoutPromise]);

      console.log('[jobService.updateJob] Réponse reçue:', { data, error });

      if (error) {
        console.error('[jobService.updateJob] Erreur Supabase:', error);
        console.error('[jobService.updateJob] Détails erreur:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        
        if (error.code === '23502') {
          throw new Error('Données manquantes. Veuillez remplir tous les champs obligatoires');
        } else if (error.message?.includes('JWT')) {
          throw new Error('Session expirée. Veuillez vous reconnecter');
        }
        
        throw new Error(error.message || 'Erreur lors de la mise à jour de la mission');
      }

      if (!data || data.length === 0) {
        console.error('[jobService.updateJob] Pas de données retournées');
        throw new Error('Mission non trouvée ou non modifiée');
      }

      console.log('[jobService.updateJob] Mise à jour réussie:', data);

      // Invalider le cache
      this.clearCache();
      
      console.log('[jobService.updateJob] Cache invalidé, retour des données');
      
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('[jobService.updateJob] Erreur finale:', error);
      console.error('[jobService.updateJob] Stack:', error.stack);
      throw error;
    }
  },

  // Supprimer une mission
  async deleteJob(id) {
    if (!isSupabaseConfigured()) {
      throw new Error('Service de base de données non disponible. Veuillez contacter l\'administrateur.');
    }

    console.log('[jobService.deleteJob] Suppression job:', id);

    try {
      // Créer une promesse avec timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La requête Supabase prend trop de temps')), 30000);
      });

      const supabasePromise = supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      console.log('[jobService.deleteJob] Requête envoyée, attente de la réponse...');

      const { error } = await Promise.race([supabasePromise, timeoutPromise]);

      if (error) {
        console.error('[jobService.deleteJob] Erreur Supabase:', error);
        
        if (error.message?.includes('JWT')) {
          throw new Error('Session expirée. Veuillez vous reconnecter');
        }
        
        throw new Error(error.message || 'Erreur lors de la suppression de la mission');
      }

      console.log('[jobService.deleteJob] Suppression réussie');

      // Invalider le cache
      this.clearCache();
      
      return { success: true };
    } catch (error) {
      console.error('[jobService.deleteJob] Erreur finale:', error);
      console.error('[jobService.deleteJob] Stack:', error.stack);
      throw error;
    }
  },

  // Incrémenter le nombre de candidatures
  async incrementApplicants(jobId) {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Service de base de données non disponible' };
    }

    try {
      // Créer une promesse avec timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 30000);
      });

      // Récupérer le nombre actuel
      const { data, error } = await Promise.race([
        supabase.from('jobs').select('applicants').eq('id', jobId).single(),
        timeoutPromise
      ]);

      if (error) {
        console.error('Erreur lors de la récupération:', error);
        return { success: false, message: 'Mission non trouvée' };
      }

      const newCount = (data.applicants || 0) + 1;

      // Mettre à jour le compteur
      const { error: updateError } = await Promise.race([
        supabase.from('jobs').update({ applicants: newCount }).eq('id', jobId),
        timeoutPromise
      ]);

      if (updateError) {
        console.error('Erreur lors de la mise à jour:', updateError);
        return { success: false, message: 'Erreur lors de la mise à jour' };
      }

      // Invalider le cache
      this.clearCache();
      return { success: true, newCount };
    } catch (error) {
      console.error('Erreur incrementApplicants:', error);
      return { success: false, message: 'Erreur technique' };
    }
  }
};

// ✅ NOUVELLES FONCTIONS POUR LA PAGINATION ET L'ACCUEIL

// Récupérer 6 missions pour l'accueil
export const fetchJobsHome = async () => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase non configuré, utilisation des données de fallback (6 premières)');
    return FALLBACK_JOBS.slice(0, 6);
  }

  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 30000)
    );

    const { data, error } = await Promise.race([
      supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6),
      timeoutPromise
    ]);

    if (error) {
      console.error('Erreur fetchJobsHome:', error);
      return FALLBACK_JOBS.slice(0, 6);
    }
    
    return data || FALLBACK_JOBS.slice(0, 6);
  } catch (error) {
    console.error('Erreur fetchJobsHome:', error);
    return FALLBACK_JOBS.slice(0, 6);
  }
};

// Récupérer les missions avec pagination
export const fetchJobsPaginated = async (page = 1, limit = 12) => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase non configuré, utilisation des données de fallback avec pagination simulée');
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedJobs = FALLBACK_JOBS.slice(start, end);
    
    return {
      jobs: paginatedJobs,
      totalCount: FALLBACK_JOBS.length,
      totalPages: Math.ceil(FALLBACK_JOBS.length / limit),
      currentPage: page
    };
  }

  try {
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 30000)
    );

    const { data, error, count } = await Promise.race([
      supabase
        .from('jobs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end),
      timeoutPromise
    ]);

    if (error) {
      console.error('Erreur fetchJobsPaginated:', error);
      // Fallback avec pagination simulée
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedJobs = FALLBACK_JOBS.slice(start, end);
      
      return {
        jobs: paginatedJobs,
        totalCount: FALLBACK_JOBS.length,
        totalPages: Math.ceil(FALLBACK_JOBS.length / limit),
        currentPage: page
      };
    }
    
    return {
      jobs: data || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page
    };
  } catch (error) {
    console.error('Erreur fetchJobsPaginated:', error);
    // Fallback avec pagination simulée
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedJobs = FALLBACK_JOBS.slice(start, end);
    
    return {
      jobs: paginatedJobs,
      totalCount: FALLBACK_JOBS.length,
      totalPages: Math.ceil(FALLBACK_JOBS.length / limit),
      currentPage: page
    };
  }
};
