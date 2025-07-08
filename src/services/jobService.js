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

Vous serez responsable de l'analyse des menaces, de la mise en place de solutions de sécurité, et de la formation des équipes aux bonnes pratiques.

Le poste implique également la réalisation d'audits de sécurité, la gestion des incidents, et la veille technologique sur les nouvelles menaces.`,
    requirements: [
      "Master en cybersécurité ou équivalent",
      "Certifications CISSP, CEH ou équivalent",
      "Expérience avec les outils SIEM",
      "Connaissance des frameworks de sécurité (ISO 27001, NIST)",
      "Maîtrise des tests de pénétration",
      "Anglais technique courant"
    ],
    benefits: [
      "CDI avec période d'essai de 3 mois",
      "13ème mois + prime de performance",
      "Formation certifiante prise en charge",
      "Télétravail 2 jours/semaine",
      "Participation aux conférences de sécurité",
      "Plan d'épargne entreprise"
    ],
    posted_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    applicants: 8,
    featured: false,
    slug: "expert-cybersecurite-lyon"
  },
  {
    id: 3,
    title: "DevOps Engineer",
    company: "CloudFirst",
    location: "Marseille",
    type: "Mission",
    salary: "700",
    salary_type: "TJM",
    description: `Mission de 6 mois pour accompagner la transformation DevOps d'une entreprise en pleine croissance.

Vous serez en charge de la mise en place d'une infrastructure cloud scalable, de l'automatisation des déploiements, et de l'amélioration des processus CI/CD.

Le projet inclut la migration vers AWS, la containerisation avec Docker/Kubernetes, et la mise en place de monitoring avancé.`,
    requirements: [
      "3+ années d'expérience DevOps",
      "Maîtrise d'AWS ou Azure",
      "Expérience avec Docker et Kubernetes",
      "Connaissance de Terraform et Ansible",
      "Maîtrise des pipelines CI/CD (GitLab CI, Jenkins)",
      "Scripting Bash/Python"
    ],
    benefits: [
      "Mission longue durée (6 mois renouvelable)",
      "Équipe technique de haut niveau",
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

export const jobService = {
  async fetchJobs() {
    if (!isSupabaseConfigured()) {
      console.warn('jobService: Supabase non configuré - Utilisation des données de fallback');
      return FALLBACK_JOBS;
    }

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erreur fetchJobs:', error);
        return FALLBACK_JOBS;
      }
      
      return data || FALLBACK_JOBS;
    } catch (error) {
      console.error('Erreur critique fetchJobs:', error);
      return FALLBACK_JOBS;
    }
  },

  async createJob(jobData) {
    if (!isSupabaseConfigured()) {
      throw new Error('Service de base de données non disponible. Veuillez contacter l\'administrateur.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Vous devez être connecté pour créer une annonce');
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert([jobData])
      .select()
      .single();
    
    if (error) {
      console.error('Erreur createJob:', error);
      if (error.code === '42501') {
        throw new Error('Vous n\'avez pas les permissions pour créer une annonce');
      }
      throw new Error(error.message || 'Erreur lors de la création de l\'annonce');
    }
    
    return data;
  },

  async updateJob(id, jobData) {
    if (!isSupabaseConfigured()) {
      throw new Error('Service de base de données non disponible. Veuillez contacter l\'administrateur.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Vous devez être connecté pour modifier une annonce');
    }

    const { data, error } = await supabase
      .from('jobs')
      .update(jobData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur updateJob:', error);
      if (error.code === '42501') {
        throw new Error('Vous n\'avez pas les permissions pour modifier cette annonce');
      }
      throw new Error(error.message || 'Erreur lors de la modification de l\'annonce');
    }
    
    return data;
  },

  async deleteJob(id) {
    if (!isSupabaseConfigured()) {
      throw new Error('Service de base de données non disponible. Veuillez contacter l\'administrateur.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Vous devez être connecté pour supprimer une annonce');
    }

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erreur deleteJob:', error);
      if (error.code === '42501') {
        throw new Error('Vous n\'avez pas les permissions pour supprimer cette annonce');
      }
      throw new Error(error.message || 'Erreur lors de la suppression de l\'annonce');
    }
  },

  async incrementApplicants(jobId) {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Service de base de données non disponible' };
    }

    try {
      const { data, error } = await supabase
        .rpc('increment_applicants', { p_job_id: jobId });
      
      if (error) {
        console.error('Erreur incrementApplicants:', error);
        throw error;
      }
      
      return data || { success: true, message: 'Candidature enregistrée' };
    } catch (error) {
      console.error('Erreur:', error);
      return { 
        success: false, 
        message: 'Erreur lors de l\'enregistrement de la candidature' 
      };
    }
  }
};

