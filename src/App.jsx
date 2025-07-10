// src/App.jsx - Application principale Ma Nouvelle Mission (VERSION AVEC GESTION DE SESSION)
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Menu, X, Plus, Edit, Trash2, LogIn, LogOut, Building, Euro, Filter, Sparkles, TrendingUp, Users, Moon, Sun, ArrowRight, CheckCircle, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { jobService } from './services/jobService';
import LoadingSpinner from './components/ui/LoadingSpinner';
import SkeletonLoader from './components/ui/SkeletonLoader';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MissionsPage from './components/ui/MissionsPage';
import { fetchJobsHome } from './services/jobService';

// Validation des données
const validateJobData = (jobData) => {
  const errors = {};

  if (!jobData.title || jobData.title.trim().length < 3) {
    errors.title = "Le titre doit contenir au moins 3 caractères";
  }
  if (jobData.title.length > 100) {
    errors.title = "Le titre ne peut pas dépasser 100 caractères";
  }

  if (!jobData.company || jobData.company.trim().length < 2) {
    errors.company = "Le nom de l'entreprise est requis";
  }

  if (!jobData.location || jobData.location.trim().length < 2) {
    errors.location = "La localisation est requise";
  }

  const salaryPattern = /^\d+(\s*-\s*\d+)?$/;
  if (!salaryPattern.test(jobData.salary)) {
    errors.salary = "Format de salaire invalide (ex: 600 ou 600-700)";
  }

  if (!jobData.description || jobData.description.trim().length < 50) {
    errors.description = "La description doit contenir au moins 50 caractères";
  }

  return errors;
};

// Sanitisation des données
const sanitizeInput = (str) => {
  if (!str) return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

const sanitizeJobData = (jobData) => {
  return {
    title: sanitizeInput(jobData.title),
    company: sanitizeInput(jobData.company),
    location: sanitizeInput(jobData.location),
    type: jobData.type,
    salary: sanitizeInput(jobData.salary),
    salary_type: jobData.salary_type,
    description: sanitizeInput(jobData.description),
    requirements: Array.isArray(jobData.requirements) 
      ? jobData.requirements.map(r => sanitizeInput(r))
      : sanitizeInput(jobData.requirements).split('\n').filter(r => r),
    benefits: Array.isArray(jobData.benefits)
      ? jobData.benefits.map(b => sanitizeInput(b))
      : sanitizeInput(jobData.benefits).split('\n').filter(b => b),
    featured: Boolean(jobData.featured),
    posted_date: jobData.posted_date || new Date().toISOString().split('T')[0],
    slug: jobData.slug
  };
};

// Composant principal avec Auth
function JobBoardContent() {
  const { isAdmin, signOut, isSupabaseConfigured, executeWithValidSession, sessionExpired, clearSessionExpired } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    location: 'all',
    salary: 'all'
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  
  // ✅ NOUVEAUX ÉTATS POUR LE FEEDBACK UTILISATEUR
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [isDeletingJob, setIsDeletingJob] = useState(null); // ID du job en cours de suppression
  const [submitMessage, setSubmitMessage] = useState(null); // {type: 'success'|'error', text: '...'}
  
  // Charger les jobs avec gestion améliorée du loading (CORRIGÉ)
const fetchJobs = async (showDataLoading = false) => {
    if (showDataLoading) {
      setDataLoading(true);
    }
    
    try {
      const jobsData = await jobService.fetchJobs(); // Utiliser fetchJobs au lieu de fetchJobsHome
      setJobs(jobsData);
      setFilteredJobs(jobsData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setInitialLoading(false);
      setDataLoading(false);
    }
};

  // Charger les jobs au démarrage
  useEffect(() => {
    fetchJobs();
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  // Ouvrir automatiquement la modal si l'URL contient ?job=X
  useEffect(() => {
    if (jobs.length === 0) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('job');
    
    if (jobId) {
      const job = jobs.find(j => j.id === parseInt(jobId));
      if (job) {
        setSelectedJob(job);
      }
    }
  }, [jobs]);
  
  // Sauvegarder le mode sombre
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // ✅ EFFET POUR MASQUER LES MESSAGES APRÈS 5 SECONDES
  useEffect(() => {
    if (submitMessage) {
      const timer = setTimeout(() => {
        setSubmitMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitMessage]);

  // ✅ GESTION DE LA SESSION EXPIRÉE
  useEffect(() => {
    if (sessionExpired) {
      setSubmitMessage({
        type: 'error',
        text: '🔒 Session expirée. Veuillez vous reconnecter pour continuer.'
      });
      // Fermer les modales ouvertes
      setShowJobForm(false);
      setEditingJob(null);
    }
  }, [sessionExpired]);

  // Filtrage
  useEffect(() => {
    let filtered = [...jobs];
    
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filters.type !== 'all') {
      filtered = filtered.filter(job => job.type === filters.type);
    }
    if (filters.location !== 'all') {
      filtered = filtered.filter(job => job.location.includes(filters.location));
    }
    
    setFilteredJobs(filtered);
  }, [searchTerm, jobs, filters]);

  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Mission',
    salary: '',
    salaryType: 'TJM',
    description: '',
    requirements: '',
    benefits: '',
    featured: false
  });

  const generateSlug = (title, location) => {
    return `${title}-${location}`
      .toLowerCase()
      .replace(/[àáäâ]/g, 'a')
      .replace(/[èéëê]/g, 'e')
      .replace(/[ìíïî]/g, 'i')
      .replace(/[òóöô]/g, 'o')
      .replace(/[ùúüû]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

const handleJobSubmit = async () => {
    setSubmitMessage(null);
    setIsSubmittingJob(true);

    try {
      const jobData = {
        title: jobForm.title,
        company: jobForm.company,
        location: jobForm.location,
        type: jobForm.type,
        salary: jobForm.salary,
        salary_type: jobForm.type === 'CDI' || jobForm.type === 'CDD' ? 'Annuel' : 'TJM',
        description: jobForm.description,
        requirements: jobForm.requirements.split('\n').filter(r => r.trim()),
        benefits: jobForm.benefits.split('\n').filter(b => b.trim()),
        slug: generateSlug(jobForm.title, jobForm.location),
        featured: jobForm.featured,
        posted_date: new Date().toISOString().split('T')[0]
      };

      const errors = validateJobData(jobData);
      if (Object.keys(errors).length > 0) {
        setSubmitMessage({
          type: 'error',
          text: 'Erreurs de validation:\n' + Object.values(errors).join('\n')
        });
        setIsSubmittingJob(false);
        return;
      }

      const sanitizedData = sanitizeJobData(jobData);

      // APPEL DIRECT SANS VERIFICATIONS COMPLEXES
      if (editingJob) {
        await jobService.updateJob(editingJob.id, sanitizedData);
        setSubmitMessage({
          type: 'success',
          text: '✅ Mission mise à jour avec succès !'
        });
      } else {
        await jobService.createJob(sanitizedData);
        setSubmitMessage({
          type: 'success',
          text: '✅ Mission créée avec succès !'
        });
      }
      
      // Attendre et recharger
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchJobs();
      
      // Réinitialiser
      setJobForm({
        title: '',
        company: '',
        location: '',
        type: 'Mission',
        salary: '',
        salaryType: 'TJM',
        description: '',
        requirements: '',
        benefits: '',
        featured: false
      });
      setEditingJob(null);
      
      setTimeout(() => {
        setShowJobForm(false);
      }, 2000);
      
    } catch (error) {
      console.error('Erreur:', error);
      setSubmitMessage({
        type: 'error',
        text: '❌ ' + (error.message || 'Erreur lors de la sauvegarde')
      });
    } finally {
      setIsSubmittingJob(false);
    }
};
  
  // ✅ FONCTION AMÉLIORÉE AVEC GESTION DE SESSION
  const deleteJob = async (id) => {
    // Confirmation avec message plus clair
    const job = jobs.find(j => j.id === id);
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer définitivement la mission "${job?.title}" ?\n\nCette action est irréversible.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeletingJob(id);
    setSubmitMessage(null);

    try {
      // ✅ UTILISER executeWithValidSession POUR GÉRER LA SESSION
      await executeWithValidSession(async () => {
        await jobService.deleteJob(id);
      });
      
      setSubmitMessage({
        type: 'success',
        text: '✅ Mission supprimée avec succès !'
      });
      await fetchJobs();
      if (selectedJob?.id === id) setSelectedJob(null);
    } catch (error) {
      console.error('Erreur:', error);
      
      // ✅ GESTION SPÉCIFIQUE DES ERREURS DE SESSION
      if (error.message?.includes('Session expirée') || error.message?.includes('JWT')) {
        setSubmitMessage({
          type: 'error',
          text: '🔒 Session expirée. Veuillez vous reconnecter pour continuer.'
        });
      } else {
        setSubmitMessage({
          type: 'error',
          text: '❌ ' + (error.message || 'Erreur lors de la suppression')
        });
      }
    } finally {
      setIsDeletingJob(null);
    }
  };

  const incrementApplicants = async (jobId) => {
    try {
      const result = await jobService.incrementApplicants(jobId);
      if (result.success) {
        await fetchJobs();
      } else {
        console.log(result.message);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleAdminLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      setSubmitMessage({
        type: 'success',
        text: '✅ Déconnexion réussie'
      });
      clearSessionExpired(); // Réinitialiser l'état de session expirée
    }
  };

  // ✅ FONCTION POUR GÉRER LA RECONNEXION APRÈS SESSION EXPIRÉE
  const handleReconnect = () => {
    clearSessionExpired();
    setSubmitMessage(null);
    setShowAdminLogin(true);
  };

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  // Afficher le loading spinner initial
  if (initialLoading) {
    return (
      <LoadingSpinner 
        message="Chargement de vos missions..." 
        showDetails={true}
      />
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* ✅ NOTIFICATION DE FEEDBACK UTILISATEUR */}
      {submitMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          submitMessage.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {submitMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span className="font-medium whitespace-pre-line">{submitMessage.text}</span>
            {/* ✅ BOUTON DE RECONNEXION SI SESSION EXPIRÉE */}
            {submitMessage.text.includes('Session expirée') && (
              <button
                onClick={handleReconnect}
                className="ml-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Se reconnecter
              </button>
            )}
          </div>
        </div>
      )}

      {/* ✅ ALERTE DE SESSION EXPIRÉE */}
      {sessionExpired && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm">
                <strong>Session expirée :</strong> Votre session d'administration a expiré. Veuillez vous reconnecter pour continuer à gérer les missions.
              </p>
            </div>
            <div className="ml-3">
              <button
                onClick={handleReconnect}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
              >
                Se reconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Supabase si non configuré */}
      {!isSupabaseConfigured && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                <strong>Mode démonstration :</strong> La base de données n'est pas configurée. Les fonctionnalités d'administration ne sont pas disponibles.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`${bgColor} shadow-lg sticky top-0 z-50`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img 
                src="https://i.postimg.cc/gw453gDP/Manouvellemission.png" 
                alt="Ma Nouvelle Mission" 
                className="h-10 mr-3"
              />
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-blue-600 transition">Accueil</Link>
            <Link to="/missions" className="hover:text-blue-600 transition">Missions</Link>
            <a href="#about" className="hover:text-blue-600 transition">À propos</a>
            <a href="#contact" className="hover:text-blue-600 transition">Contact</a>

              
                  <button
                    onClick={() => fetchJobs(true)}
                    disabled={dataLoading}
                    className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    title="Rafraîchir les annonces"
                  >
                    <RefreshCw className={`w-5 h-5 ${dataLoading ? 'animate-spin' : ''}`} />
                  </button>
              
              {isAdmin && isSupabaseConfigured && !sessionExpired && (
                <button
                  onClick={() => setShowJobForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nouvelle mission
                </button>
              )}
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {isSupabaseConfigured && (
                <button
                  onClick={() => isAdmin ? handleAdminLogout() : setShowAdminLogin(true)}
                  className="hover:text-blue-600 transition flex items-center gap-2"
                >
                  {isAdmin ? <LogOut className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  {isAdmin ? 'Déconnexion' : 'Admin'}
                </button>
              )}
            </nav>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className={`md:hidden ${bgColor} border-t ${borderColor} p-4`}>
            <nav className="flex flex-col space-y-3">
            <Link to="/" className="hover:text-blue-600">Accueil</Link>
            <Link to="/missions" className="hover:text-blue-600">Missions</Link>
            <a href="#about" className="hover:text-blue-600">À propos</a>
            <a href="#contact" className="hover:text-blue-600">Contact</a>

              <button
                onClick={() => {
                  fetchJobs();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Rafraîchir
              </button>
              {isAdmin && isSupabaseConfigured && !sessionExpired && (
                <button
                  onClick={() => {
                    setShowJobForm(true);
                    setMobileMenuOpen(false);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Nouvelle mission
                </button>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {darkMode ? 'Mode clair' : 'Mode sombre'}
              </button>
              {isSupabaseConfigured && (
                <button
                  onClick={() => {
                    isAdmin ? handleAdminLogout() : setShowAdminLogin(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  {isAdmin ? <LogOut className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  {isAdmin ? 'Déconnexion' : 'Admin'}
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Trouvez votre <span className="text-blue-600">prochaine mission freelance</span>
          </h1>
          <p className="text-xl text-center text-gray-600 mb-8 max-w-3xl mx-auto">
            Découvrez des missions exceptionnelles et trouvez votre prochain challenge
          </p>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-2">
              <div className="relative flex items-center">
                <Search className="absolute left-6 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Rechercher par poste, ville ou entreprise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-6 py-4 text-lg rounded-lg focus:outline-none"
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute right-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {showFilters && (
              <div className="mt-4 bg-white rounded-xl shadow-lg p-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    className="px-4 py-2 rounded-lg bg-gray-100"
                  >
                    <option value="all">Tous les types</option>
                    <option value="Mission">Mission</option>
                    <option value="CDI">CDI</option>
                  </select>
                  
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="px-4 py-2 rounded-lg bg-gray-100"
                  >
                    <option value="all">Toutes les villes</option>
                    <option value="Paris">Paris</option>
                    <option value="Lyon">Lyon</option>
                    <option value="Marseille">Marseille</option>
                  </select>
                  
                  <select
                    value={filters.salary}
                    onChange={(e) => setFilters({...filters, salary: e.target.value})}
                    className="px-4 py-2 rounded-lg bg-gray-100"
                  >
                    <option value="all">Tous les tarifs</option>
                    <option value="300-500">300-500€/jour</option>
                    <option value="500-700">500-700€/jour</option>
                    <option value="700-1000">700€+/jour</option>
                    <option value="40-60">40-60K€/an</option>
                    <option value="60-80">60-80K€/an</option>
                    <option value="80-999">80K€+/an</option>
                  </select>
                </div>
              </div>
            )}
            
            <p className="text-center text-gray-600 mt-6">
              <span className="font-bold text-blue-600">{filteredJobs.length}</span> mission{filteredJobs.length > 1 ? 's' : ''} à la une
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-12 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className={`text-3xl font-bold ${textColor} mb-2`}>{jobs.length}+</h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Missions actives</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className={`text-3xl font-bold ${textColor} mb-2`}>20+</h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Entreprises partenaires</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className={`text-3xl font-bold ${textColor} mb-2`}>
                {jobs.reduce((sum, job) => sum + (job.applicants || 0), 50)}+
              </h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Candidatures reçues</p>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs List */}
      <main className="container mx-auto px-4 py-12" id="jobs">
        <h2 className={`text-3xl font-bold text-center mb-12 ${textColor}`}>
          Missions à la une
        </h2>
        
        {dataLoading ? (
          <SkeletonLoader count={6} />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map(job => (
              <article 
                key={job.id}
                className={`mission-card ${cardBg} rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 cursor-pointer`}
                onClick={() => setSelectedJob(job)}
              >
                {job.featured && (
                  <div className="bg-yellow-400 text-xs px-2 py-1 rounded inline-flex items-center mb-3">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Featured
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`job-title text-xl font-semibold ${textColor}`}>{job.title}</h3>
                    <p className={`job-company ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{job.company}</p>
                  </div>
                  {isAdmin && isSupabaseConfigured && !sessionExpired && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingJob(job);
                          setJobForm({
                            title: job.title,
                            company: job.company,
                            location: job.location,
                            type: job.type,
                            salary: job.salary,
                            salaryType: job.salary_type || 'TJM',
                            description: job.description,
                            requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : '',
                            benefits: Array.isArray(job.benefits) ? job.benefits.join('\n') : '',
                            featured: job.featured || false
                          });
                          setShowJobForm(true);
                        }}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                        title="Modifier cette mission"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteJob(job.id);
                        }}
                        disabled={isDeletingJob === job.id}
                        className="text-red-600 hover:bg-red-50 p-2 rounded disabled:opacity-50"
                        title="Supprimer cette mission"
                      >
                        {isDeletingJob === job.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3 text-sm mb-4">
                  <span className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    {job.type}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Euro className="w-4 h-4" />
                    {job.salary_type === 'TJM' ? `${job.salary}€/jour` : `${job.salary}€/an`}
                  </span>
                </div>
                
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}
                   style={{
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                     display: '-webkit-box',
                     WebkitLineClamp: 3,
                     WebkitBoxOrient: 'vertical',
                     wordBreak: 'break-word'
                   }}>
                {job.description}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {new Date(job.posted_date).toLocaleDateString('fr-FR')}
                  </span>
                  {job.applicants > 0 && (
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {job.applicants} candidat{job.applicants > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        
        {!dataLoading && filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Aucune mission ne correspond à votre recherche.</p>
          </div>
        )}

        {/* Bouton Voir toutes les missions - CORRIGÉ */}
        <div className="text-center mt-12">
          <Link 
            to="/missions"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg"
          >
            Voir toutes les missions
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </main>

      {/* SEO Section */}
      <section className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-white'}`} id="about">
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-8 ${textColor}`}>
            Ma Nouvelle Mission - Le partenaire des freelances
          </h2>
          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Sur <strong>manouvellemission.com</strong>, trouvez la mission qui correspond parfaitement à vos compétences et aspirations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${textColor}`}>Recherche Intelligente</h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Trouvez votre nouvelle mission rapidement grâce à notre moteur de recherche.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${textColor}`}>Carrière en Évolution</h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Des missions qui vous permettent de progresser dans votre carrière.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${textColor}`}>Accompagnement Personnalisé</h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Un suivi adapté pour chaque candidat tout au long du processus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img 
                src="https://i.postimg.cc/gw453gDP/Manouvellemission.png" 
                alt="Ma Nouvelle Mission" 
                className="h-12 mb-4"
              />
              <p className="text-gray-400">
                Propulsé par Get in Talent, votre partenaire pour trouver les meilleurs talents.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white">Accueil</Link></li>
              <li><Link to="/missions" className="hover:text-white">Missions</Link></li>
              <li><a href="#about" className="hover:text-white">À propos</a></li>
              <li><a href="#contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>

            
            <div>
              <h4 className="font-semibold mb-4">Nos sites partenaires</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="https://prestationfreelance.fr" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                    prestationfreelance.fr
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://recrutementit.fr" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                    recrutementit.fr
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://tjmfreelance.com" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                    tjmfreelance.com
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
            
            <div id="contact">
              <h4 className="font-semibold mb-4">Contact</h4>
              <address className="text-gray-400 not-italic">
                <p>Email: <a href="mailto:hello@manouvellemission.com" className="hover:text-white">hello@manouvellemission.com</a></p>
                <p>Tél: <a href="tel:+33972328994" className="hover:text-white">+33 9 72 32 89 94</a></p>
                <p>Paris, France</p>
              </address>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Get in Talent - Ma Nouvelle Mission. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Job Modal */}
      {selectedJob && (
        <JobModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
          darkMode={darkMode}
          onApplication={() => incrementApplicants(selectedJob.id)}
        />
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && isSupabaseConfigured && (
        <AdminLoginModal 
          onClose={() => setShowAdminLogin(false)}
          darkMode={darkMode}
        />
      )}

      {/* Job Form Modal */}
      {showJobForm && isSupabaseConfigured && !sessionExpired && (
        <JobFormModal
          jobForm={jobForm}
          setJobForm={setJobForm}
          onSubmit={handleJobSubmit}
          onClose={() => {
            setShowJobForm(false);
            setEditingJob(null);
            setJobForm({
              title: '',
              company: '',
              location: '',
              type: 'Mission',
              salary: '',
              salaryType: 'TJM',
              description: '',
              requirements: '',
              benefits: '',
              featured: false
            });
            setSubmitMessage(null); // ✅ Réinitialiser les messages
          }}
          isEditing={!!editingJob}
          darkMode={darkMode}
          isSubmitting={isSubmittingJob} // ✅ Passer l'état de soumission
          submitMessage={submitMessage} // ✅ Passer les messages
        />
      )}
    </div>
  );
}

// Wrapper pour passer les props à MissionsPage - CORRIGÉ
function MissionsPageWrapper() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    message: '',
    cv: null
  });
  const [darkMode, setDarkMode] = useState(false);

  const handleJobApplication = async (jobId, formData) => {
    // Logique de candidature (copiée de JobBoardContent si nécessaire)
    console.log('Candidature pour:', jobId, formData);
  };

  return (
    <MissionsPage 
      selectedJob={selectedJob}
      setSelectedJob={setSelectedJob}
      showJobModal={showJobModal}
      setShowJobModal={setShowJobModal}
      showApplicationModal={showApplicationModal}
      setShowApplicationModal={setShowApplicationModal}
      applicationData={applicationData}
      setApplicationData={setApplicationData}
      handleJobApplication={handleJobApplication}
      darkMode={darkMode}
    />
  );
}

// Wrapper principal avec AuthProvider
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<JobBoardContent />} />
          <Route path="/missions" element={<MissionsPageWrapper />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Composant Modal Job Details
function JobModal({ job, onClose, darkMode, onApplication }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    cvFile: null
  });

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || formData.name.trim().length < 2) {
      alert('Veuillez entrer votre nom complet');
      return;
    }
    
    if (!validateEmail(formData.email)) {
      alert('Veuillez entrer une adresse email valide');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Créer FormData pour Netlify
      const netlifyData = new FormData();
      
      // IMPORTANT : Le nom du formulaire doit correspondre exactement à celui dans index.html
      netlifyData.append('form-name', 'job-application');
      
      // Ajouter tous les champs
      netlifyData.append('name', formData.name);
      netlifyData.append('email', formData.email);
      netlifyData.append('message', formData.message || 'Pas de message');
      netlifyData.append('jobTitle', job.title);
      netlifyData.append('company', job.company);
      netlifyData.append('location', job.location);
      
      // Ajouter le CV si présent
      if (formData.cvFile) {
        if (formData.cvFile.size > 10 * 1024 * 1024) { // 10MB max pour Netlify
          alert('Le fichier est trop volumineux. Maximum 10MB.');
          setIsSubmitting(false);
          return;
        }
        netlifyData.append('cv', formData.cvFile);
      }

      // Envoyer à Netlify (toujours à la racine "/")
      const response = await fetch('/', {
        method: 'POST',
        body: netlifyData
      });

      if (response.ok) {
        setSubmitStatus('success');
        onApplication();
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setSubmitStatus('error');
        alert('Erreur lors de l\'envoi. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setSubmitStatus('error');
      alert('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 max-w-md text-center`}>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Candidature envoyée !
          </h2>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            Merci pour votre candidature. Nous reviendrons vers vous rapidement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6 flex justify-between items-center`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {job.title}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>{job.company}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {job.type}
              </span>
              <span className="flex items-center gap-1">
                <Euro className="w-4 h-4" />
                {job.salary_type === 'TJM' ? `${job.salary}€/jour` : `${job.salary}€/an`}
              </span>
              {job.applicants > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {job.applicants} candidat{job.applicants > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Description
              </h3>
              <p className={`whitespace-pre-line ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{job.description}</p>
            </div>

            <div>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Compétences requises
              </h3>
              <ul className="space-y-2">
                {Array.isArray(job.requirements) && job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Avantages
              </h3>
              <ul className="space-y-2">
                {Array.isArray(job.benefits) && job.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500 mt-0.5" />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 space-y-4 border-t pt-8">
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Postuler maintenant
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nom complet *"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50'}`}
              />
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50'}`}
              />
            </div>
            
            <textarea
              placeholder="Message de motivation"
              rows="4"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50'}`}
            />
            
            <div>
              <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                CV (PDF - optionnel, max 10MB)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFormData({...formData, cvFile: e.target.files[0]})}
                className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50'}`}
              />
            </div>

            {submitStatus === 'error' && (
              <div className="bg-red-100 text-red-700 p-3 rounded">
                Une erreur s'est produite. Veuillez réessayer.
              </div>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer ma candidature'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant Modal Admin Login avec Supabase Auth
function AdminLoginModal({ onClose, darkMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, clearSessionExpired } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      clearSessionExpired(); // ✅ Réinitialiser l'état de session expirée
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Connexion Admin
        </h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg mb-4 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50'}`}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg mb-4 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50'}`}
            required
          />
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200'}`}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ✅ COMPOSANT MODAL JOB FORM AMÉLIORÉ
function JobFormModal({ jobForm, setJobForm, onSubmit, onClose, isEditing, darkMode, isSubmitting, submitMessage }) {
  const handleTypeChange = (type) => {
    const newSalaryType = (type === 'CDI' || type === 'CDD') ? 'Annuel' : 'TJM';
    setJobForm({
      ...jobForm, 
      type: type,
      salaryType: newSalaryType,
      salary: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6 flex justify-between items-center`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {isEditing ? 'Modifier la mission' : 'Nouvelle mission'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* ✅ AFFICHAGE DES MESSAGES DE FEEDBACK */}
          {submitMessage && (
            <div className={`p-4 rounded-lg ${
              submitMessage.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {submitMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                <span className="font-medium whitespace-pre-line">{submitMessage.text}</span>
              </div>
            </div>
          )}

          <input
            type="text"
            placeholder="Titre du poste"
            value={jobForm.title}
            onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
            className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50'}`}
            disabled={isSubmitting}
          />
          
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Entreprise"
              value={jobForm.company}
              onChange={(e) => setJobForm({...jobForm, company: e.target.value})}
              className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50'}`}
              disabled={isSubmitting}
            />
            <input
              type="text"
              placeholder="Localisation"
              value={jobForm.location}
              onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
              className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50'}`}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <select
              value={jobForm.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50'}`}
              disabled={isSubmitting}
            >
              <option value="Mission">Mission</option>
              <option value="CDI">CDI</option>
            </select>
            <input
              type="text"
              placeholder={jobForm.salaryType === 'TJM' ? 'TJM (ex: 600)' : 'Salaire annuel (ex: 45K - 65K)'}
              value={jobForm.salary}
              onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
              className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50'}`}
              disabled={isSubmitting}
            />
          </div>
          
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} -mt-2`}>
            {jobForm.salaryType === 'TJM' ? 
              '💡 Indiquez le TJM en euros par jour' : 
              '💡 Indiquez le salaire annuel en K€ (ex: 50K)'
            }
          </div>
          
          <textarea
            placeholder="Description de la mission (minimum 50 caractères)"
            rows="4"
            value={jobForm.description}
            onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
            className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50'}`}
            disabled={isSubmitting}
          />
          
          <textarea
            placeholder="Compétences requises (une par ligne)"
            rows="4"
            value={jobForm.requirements}
            onChange={(e) => setJobForm({...jobForm, requirements: e.target.value})}
            className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50'}`}
            disabled={isSubmitting}
          />
          
          <textarea
            placeholder="Avantages (un par ligne)"
            rows="4"
            value={jobForm.benefits}
            onChange={(e) => setJobForm({...jobForm, benefits: e.target.value})}
            className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50'}`}
            disabled={isSubmitting}
          />
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={jobForm.featured}
              onChange={(e) => setJobForm({...jobForm, featured: e.target.checked})}
              className="mr-2"
              disabled={isSubmitting}
            />
            <label htmlFor="featured" className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              Mettre en avant cette offre
            </label>
          </div>
          
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isEditing ? 'Mise à jour...' : 'Publication...'}
              </>
            ) : (
              isEditing ? 'Mettre à jour' : 'Publier la mission'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

