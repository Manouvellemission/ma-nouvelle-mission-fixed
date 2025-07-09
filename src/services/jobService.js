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

// Ajouter à la fin du fichier, avant l'export
export const fetchJobsPaginated = async (page = 1, limit = 12) => {
  try {
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    const { data, error, count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw error;
    
    return {
      jobs: data || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page
    };
  } catch (error) {
    console.error('Erreur pagination:', error);
    return {
      jobs: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1
    };
  }
};

// Modifier aussi fetchJobs pour limiter à 6 sur l'accueil
export const fetchJobsHome = async () => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6); // Limité à 6 pour l'accueil

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur fetchJobsHome:', error);
    return [];
  }
};

export const jobService = {
  // Récupérer toutes les missions avec cache et timeout
  async fetchJobs() {
    // Vérifier le cache d'abord
    if (jobsCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      console.log('Utilisation du cache pour les jobs');
      return jobsCache;
    }

    if (!isSupabaseConfigured) {
      console.warn('Supabase non configuré, utilisation des données de fallback');
      jobsCache = FALLBACK_JOBS;
      cacheTimestamp = Date.now();
      return FALLBACK_JOBS;
    }

    try {
      // Timeout pour éviter les blocages
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 8000)
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

    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select();

      if (error) {
        console.error('Erreur lors de la création:', error);
        throw new Error('Erreur lors de la création de la mission');
      }

      // Invalider le cache
      this.clearCache();
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Erreur createJob:', error);
      throw error;
    }
  },

  // Mettre à jour une mission
  async updateJob(id, jobData) {
    if (!isSupabaseConfigured()) {
      throw new Error('Service de base de données non disponible. Veuillez contacter l\'administrateur.');
    }

    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(jobData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        throw new Error('Erreur lors de la mise à jour de la mission');
      }

      // Invalider le cache
      this.clearCache();
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Erreur updateJob:', error);
      throw error;
    }
  },

  // Supprimer une mission
  async deleteJob(id) {
    if (!isSupabaseConfigured()) {
      throw new Error('Service de base de données non disponible. Veuillez contacter l\'administrateur.');
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        throw new Error('Erreur lors de la suppression de la mission');
      }

      // Invalider le cache
      this.clearCache();
      return { success: true };
    } catch (error) {
      console.error('Erreur deleteJob:', error);
      throw error;
    }
  },

  // Incrémenter le nombre de candidatures
  async incrementApplicants(jobId) {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Service de base de données non disponible' };
    }

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('applicants')
        .eq('id', jobId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération:', error);
        return { success: false, message: 'Mission non trouvée' };
      }

      const newCount = (data.applicants || 0) + 1;

      const { error: updateError } = await supabase
        .from('jobs')
        .update({ applicants: newCount })
        .eq('id', jobId);

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

