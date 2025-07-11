// src/App.jsx - Version OPTIMISÉE avec toutes les améliorations ET fonction handleJobSubmit corrigée
import React, { useState, useEffect, useCallback, useMemo, useReducer, lazy, Suspense, createContext, useContext } from 'react';
import { Search, MapPin, Briefcase, Menu, X, Plus, Edit, Trash2, LogIn, LogOut, Building, Euro, Filter, Sparkles, TrendingUp, Users, Moon, Sun, ArrowRight, CheckCircle, RefreshCw, Loader2, AlertTriangle, Clock } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { jobService } from './services/jobService';
import LoadingSpinner from './components/ui/LoadingSpinner';
import SkeletonLoader from './components/ui/SkeletonLoader';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Lazy loading des pages
const MissionsPage = lazy(() => import('./components/ui/MissionsPage'));
const AboutPage = lazy(() => import('./components/ui/AboutPage'));

// ==================== CONTEXTES ====================
// Context pour le thème
const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

// Context pour les jobs
const JobContext = createContext();
export const useJobs = () => useContext(JobContext);

// ==================== REDUCERS ====================
const jobReducer = (state, action) => {
  switch (action.type) {
    case 'SET_JOBS':
      return { ...state, jobs: action.payload, filteredJobs: action.payload };
    case 'SET_FILTERED_JOBS':
      return { ...state, filteredJobs: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_JOB':
      return { 
        ...state, 
        jobs: [...state.jobs, action.payload],
        filteredJobs: [...state.filteredJobs, action.payload]
      };
    case 'UPDATE_JOB':
      const updatedJobs = state.jobs.map(job => 
        job.id === action.payload.id ? action.payload : job
      );
      return {
        ...state,
        jobs: updatedJobs,
        filteredJobs: updatedJobs
      };
    case 'DELETE_JOB':
      return {
        ...state,
        jobs: state.jobs.filter(job => job.id !== action.payload),
        filteredJobs: state.filteredJobs.filter(job => job.id !== action.payload)
      };
    default:
      return state;
  }
};

// ==================== CUSTOM HOOKS ====================
// Hook personnalisé pour la gestion des jobs avec timeout
const useJobsData = () => {
  const [state, dispatch] = useReducer(jobReducer, {
    jobs: [],
    filteredJobs: [],
    loading: true,
    error: null
  });

  const fetchJobsWithTimeout = useCallback(async (showLoading = true) => {
    if (showLoading) {
      dispatch({ type: 'SET_LOADING', payload: true });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const response = await jobService.fetchJobsWithSignal(controller.signal);
      clearTimeout(timeoutId);
      dispatch({ type: 'SET_JOBS', payload: response });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        dispatch({ type: 'SET_ERROR', payload: 'La requête a pris trop de temps' });
      } else {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  return {
    ...state,
    dispatch,
    fetchJobs: fetchJobsWithTimeout
  };
};

// Hook pour le formulaire avec timeout et progress
const useJobForm = (initialState = {}) => {
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Mission',
    salary: '',
    salaryType: 'TJM',
    description: '',
    requirements: '',
    benefits: '',
    featured: false,
    ...initialState
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState('');
  const [submitMessage, setSubmitMessage] = useState(null);

  const resetForm = useCallback(() => {
    setForm({
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
    setSubmitProgress('');
    setSubmitMessage(null);
  }, []);

  const updateForm = useCallback((updates) => {
    setForm(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    form,
    setForm,
    updateForm,
    resetForm,
    isSubmitting,
    setIsSubmitting,
    submitProgress,
    setSubmitProgress,
    submitMessage,
    setSubmitMessage
  };
};

// ==================== ERROR BOUNDARY ====================
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Oups, une erreur s'est produite</h1>
            <p className="text-gray-600 mb-4">Nous nous excusons pour ce désagrément.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Rafraîchir la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ==================== VALIDATION & SANITISATION ====================
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

const sanitizeInput = (str) => {
  if (!str) return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

const sanitizeJobData = (jobData) => {
  return {
    ...jobData,
    title: sanitizeInput(jobData.title),
    company: sanitizeInput(jobData.company),
    location: sanitizeInput(jobData.location),
    description: sanitizeInput(jobData.description),
    requirements: Array.isArray(jobData.requirements) 
      ? jobData.requirements.map(req => sanitizeInput(req))
      : [],
    benefits: Array.isArray(jobData.benefits) 
      ? jobData.benefits.map(benefit => sanitizeInput(benefit))
      : []
  };
};

const generateSlug = (title, location) => {
  return (title + '-' + location)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// ==================== COMPOSANT PRINCIPAL ====================
function JobBoardContent() {
  const { isAdmin, signOut, isSupabaseConfigured, executeWithValidSession } = useAuth();
  const { jobs, filteredJobs, loading, error, dispatch, fetchJobs } = useJobsData();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  
  // États UI
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showJobForm, setShowJobForm] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isDeletingJob, setIsDeletingJob] = useState(null);
  
  // Utilisation du hook de formulaire
  const {
    form: jobForm,
    updateForm,
    resetForm,
    isSubmitting,
    setIsSubmitting,
    submitProgress,
    setSubmitProgress,
    submitMessage,
    setSubmitMessage
  } = useJobForm();

  // Mémorisation des locations uniques
  const uniqueLocations = useMemo(() => {
    return [...new Set(jobs.map(job => job.location))];
  }, [jobs]);

  // Charger les jobs au démarrage
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Gestion du mode sombre
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Filtrage des jobs
  useEffect(() => {
    let filtered = [...jobs];

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter && locationFilter !== 'all') {
      filtered = filtered.filter(job => job.location === locationFilter);
    }

    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(job => job.type === typeFilter);
    }

    dispatch({ type: 'SET_FILTERED_JOBS', payload: filtered });
  }, [jobs, searchTerm, locationFilter, typeFilter, dispatch]);

  // ✅ FONCTION HANDLEJOBSUBMIT CORRIGÉE AVEC VOTRE VERSION + LOGS + GESTION ROBUSTE
  const handleJobSubmit = useCallback(async () => {
    console.log('🚀 DEBUT handleJobSubmit');
    setSubmitMessage(null);
    setIsSubmitting(true);

    try {
      console.log('📝 Préparation des données...');
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

      console.log('🔍 Validation...');
      const errors = validateJobData(jobData);
      if (Object.keys(errors).length > 0) {
        setSubmitMessage({
          type: 'error',
          text: 'Erreurs de validation:\n' + Object.values(errors).join('\n')
        });
        setIsSubmitting(false); // ⚠️ Ne pas oublier ce reset
        return;
      }

      const sanitizedData = sanitizeJobData(jobData);

      console.log(editingJob ? '🛠️ Mise à jour...' : '➕ Création...');
      
      // Utilisation d'executeWithValidSession si disponible
      if (executeWithValidSession) {
        await executeWithValidSession(async () => {
          if (editingJob) {
            await jobService.updateJob(editingJob.id, sanitizedData);
            dispatch({ type: 'UPDATE_JOB', payload: { ...sanitizedData, id: editingJob.id } });
          } else {
            const newJob = await jobService.createJob(sanitizedData);
            dispatch({ type: 'ADD_JOB', payload: newJob });
          }
        });
      } else {
        // Fallback sans gestion de session
        if (editingJob) {
          await jobService.updateJob(editingJob.id, sanitizedData);
          dispatch({ type: 'UPDATE_JOB', payload: { ...sanitizedData, id: editingJob.id } });
        } else {
          const newJob = await jobService.createJob(sanitizedData);
          dispatch({ type: 'ADD_JOB', payload: newJob });
        }
      }

      setSubmitMessage({ 
        type: 'success', 
        text: editingJob ? '✅ Mission mise à jour avec succès !' : '✅ Mission créée avec succès !' 
      });

      console.log('⏳ Pause de 500ms');
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('🔄 Rafraîchissement des jobs...');
      await fetchJobs();

      console.log('🧹 Réinitialisation du formulaire');
      resetForm();
      setEditingJob(null);

      console.log('🪟 Fermeture du formulaire dans 2 secondes');
      setTimeout(() => {
        setShowJobForm(false);
      }, 2000);
    } catch (error) {
      console.error('❌ ERREUR dans handleJobSubmit:', error);
      setSubmitMessage({
        type: 'error',
        text: '❌ ' + (error.message || 'Erreur lors de la sauvegarde')
      });
    } finally {
      console.log('🔚 FINALLY: reset isSubmitting');
      setIsSubmitting(false);
    }
  }, [jobForm, editingJob, executeWithValidSession, dispatch, resetForm, setIsSubmitting, setSubmitMessage, fetchJobs]);

  // Fonction de suppression optimisée
  const deleteJob = useCallback(async (id) => {
    const job = jobs.find(j => j.id === id);
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer définitivement la mission "${job?.title}" ?\n\nCette action est irréversible.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeletingJob(id);
    setSubmitMessage(null);

    try {
      if (executeWithValidSession) {
        await executeWithValidSession(async () => {
          await jobService.deleteJob(id);
        });
      } else {
        await jobService.deleteJob(id);
      }
      
      dispatch({ type: 'DELETE_JOB', payload: id });
      setSubmitMessage({
        type: 'success',
        text: '✅ Mission supprimée avec succès !'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setSubmitMessage({
        type: 'error',
        text: error.message?.includes('Session expirée') 
          ? '🔒 Session expirée. Veuillez vous reconnecter.' 
          : '❌ Erreur lors de la suppression: ' + error.message
      });
    } finally {
      setIsDeletingJob(null);
    }
  }, [jobs, executeWithValidSession, dispatch, setSubmitMessage]);

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <SkeletonLoader darkMode={darkMode} />
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <JobContext.Provider value={{ jobs, filteredJobs, dispatch }}>
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {/* Notifications visuelles */}
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
                <span className="whitespace-pre-line">{submitMessage.text}</span>
              </div>
            </div>
          )}

          {/* Progress indicator */}
          {submitProgress && (
            <div className="fixed top-16 right-4 z-50 bg-blue-100 text-blue-800 p-3 rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{submitProgress}</span>
              </div>
            </div>
          )}

          {/* Header */}
          <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-40 backdrop-blur-sm bg-opacity-95`}>
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2">
                  <Briefcase className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Ma Nouvelle Mission
                  </span>
                </Link>

                {/* Navigation Desktop */}
                <nav className="hidden md:flex items-center space-x-6">
                  <Link 
                    to="/" 
                    className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                  >
                    Accueil
                  </Link>
                  <Link 
                    to="/missions" 
                    className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                  >
                    Toutes les missions
                  </Link>
                  <Link 
                    to="/about" 
                    className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                  >
                    À propos
                  </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center space-x-4">
                  {/* Toggle mode sombre */}
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors`}
                  >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>

                  {/* Boutons admin */}
                  {isSupabaseConfigured && (
                    <>
                      {isAdmin ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowJobForm(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Nouvelle mission</span>
                          </button>
                          <button
                            onClick={signOut}
                            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors`}
                          >
                            <LogOut className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAdminLogin(true)}
                          className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors`}
                        >
                          <LogIn className="w-5 h-5" />
                        </button>
                      )}
                    </>
                  )}

                  {/* Menu mobile */}
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className={`md:hidden p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Menu mobile */}
              {showMobileMenu && (
                <div className={`md:hidden py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <nav className="flex flex-col space-y-2">
                    <Link 
                      to="/" 
                      className={`px-4 py-2 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} rounded-lg transition-colors`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Accueil
                    </Link>
                    <Link 
                      to="/missions" 
                      className={`px-4 py-2 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} rounded-lg transition-colors`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Toutes les missions
                    </Link>
                    <Link 
                      to="/about" 
                      className={`px-4 py-2 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} rounded-lg transition-colors`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      À propos
                    </Link>
                  </nav>
                </div>
              )}
            </div>
          </header>

          {/* Contenu principal */}
          <main className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Trouvez votre{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  prochaine mission
                </span>
              </h1>
              <p className={`text-xl mb-8 max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Découvrez les meilleures opportunités de missions freelance et d'emplois dans le digital
              </p>

              {/* Barre de recherche */}
              <div className={`max-w-4xl mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 mb-8`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'} w-5 h-5`} />
                    <input
                      type="text"
                      placeholder="Rechercher une mission..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>

                  <div className="relative">
                    <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'} w-5 h-5`} />
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      <option value="">Toutes les villes</option>
                      {uniqueLocations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <Briefcase className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'} w-5 h-5`} />
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      <option value="">Tous les types</option>
                      <option value="Mission">Mission</option>
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{jobs.length}</p>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Missions disponibles</p>
                  </div>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>+{Math.floor(jobs.length * 0.3)}</p>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cette semaine</p>
                  </div>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{uniqueLocations.length}</p>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Villes actives</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section missions à la une */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Missions à la une
                  </h2>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {filteredJobs.length} missions disponibles
                  </p>
                </div>
                <Sparkles className={`w-8 h-8 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
              </div>

              {/* Liste des jobs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    onClick={() => setSelectedJob(job)}
                  >
                    {job.featured && (
                      <div className="flex items-center mb-3">
                        <Sparkles className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-yellow-500 text-sm font-medium">À la une</span>
                      </div>
                    )}
                    
                    <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {job.title}
                    </h3>
                    
                    <div className="flex items-center mb-2">
                      <Building className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'} mr-2`} />
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{job.company}</span>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <MapPin className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'} mr-2`} />
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{job.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        job.type === 'CDI' 
                          ? 'bg-green-100 text-green-800' 
                          : job.type === 'CDD'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {job.type}
                      </span>
                      <div className="flex items-center">
                        <Euro className="w-4 h-4 text-green-600 mr-1" />
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {job.salary} {job.salary_type}
                        </span>
                      </div>
                    </div>
                    
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm line-clamp-3`}>
                      {job.description}
                    </p>

                    {/* Boutons admin */}
                    {isAdmin && (
                      <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateForm({
                              title: job.title,
                              company: job.company,
                              location: job.location,
                              type: job.type,
                              salary: job.salary,
                              salaryType: job.salary_type,
                              description: job.description,
                              requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : '',
                              benefits: Array.isArray(job.benefits) ? job.benefits.join('\n') : '',
                              featured: job.featured
                            });
                            setEditingJob(job);
                            setShowJobForm(true);
                          }}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Modifier</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteJob(job.id);
                          }}
                          disabled={isDeletingJob === job.id}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                        >
                          {isDeletingJob === job.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          <span>Supprimer</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Message si aucun job */}
              {filteredJobs.length === 0 && (
                <div className={`text-center py-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl`}>
                  <Briefcase className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Aucune mission trouvée
                  </h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Essayez de modifier vos critères de recherche
                  </p>
                </div>
              )}

              {/* Bouton voir toutes les missions */}
              {filteredJobs.length > 0 && (
                <div className="text-center">
                  <Link
                    to="/missions"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <span>Voir toutes les missions</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </div>
          </main>

          {/* Job Form Modal */}
          {showJobForm && isSupabaseConfigured && (
            <JobFormModal
              jobForm={jobForm}
              updateForm={updateForm}
              onSubmit={handleJobSubmit}
              onClose={() => {
                setShowJobForm(false);
                setEditingJob(null);
                resetForm();
              }}
              isEditing={!!editingJob}
              darkMode={darkMode}
              isSubmitting={isSubmitting}
              submitMessage={submitMessage}
              submitProgress={submitProgress}
            />
          )}

          {/* Job Detail Modal */}
          {selectedJob && (
            <JobDetailModal
              job={selectedJob}
              onClose={() => setSelectedJob(null)}
              darkMode={darkMode}
            />
          )}

          {/* Admin Login Modal */}
          {showAdminLogin && (
            <AdminLoginModal
              onClose={() => setShowAdminLogin(false)}
              darkMode={darkMode}
            />
          )}
        </div>
      </JobContext.Provider>
    </ThemeContext.Provider>
  );
}

// Composant Modal Job Form avec progress
function JobFormModal({ jobForm, updateForm, onSubmit, onClose, isEditing, darkMode, isSubmitting, submitMessage, submitProgress }) {
  const handleTypeChange = (type) => {
    const newSalaryType = (type === 'CDI' || type === 'CDD') ? 'Annuel' : 'TJM';
    updateForm({
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
        
        <div className="p-6">
          {/* Message de feedback */}
          {submitMessage && (
            <div className={`mb-4 p-3 rounded ${
              submitMessage.type === 'success' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {submitMessage.text}
            </div>
          )}

          {/* Progress indicator */}
          {submitProgress && (
            <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{submitProgress}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Titre du poste *
              </label>
              <input
                type="text"
                value={jobForm.title}
                onChange={(e) => updateForm({ title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="Ex: Développeur React Senior"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Entreprise *
              </label>
              <input
                type="text"
                value={jobForm.company}
                onChange={(e) => updateForm({ company: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="Nom de l'entreprise"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Localisation *
              </label>
              <input
                type="text"
                value={jobForm.location}
                onChange={(e) => updateForm({ location: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="Ex: Paris, Remote, Lyon..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Type de contrat *
                </label>
                <select
                  value={jobForm.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="Mission">Mission</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Salaire ({jobForm.salaryType}) *
                </label>
                <input
                  type="text"
                  value={jobForm.salary}
                  onChange={(e) => updateForm({ salary: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder={jobForm.salaryType === 'TJM' ? "Ex: 600" : "Ex: 45000"}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Description *
              </label>
              <textarea
                value={jobForm.description}
                onChange={(e) => updateForm({ description: e.target.value })}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="Description détaillée du poste..."
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Compétences requises (une par ligne)
              </label>
              <textarea
                value={jobForm.requirements}
                onChange={(e) => updateForm({ requirements: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="React.js&#10;Node.js&#10;TypeScript"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Avantages (un par ligne)
              </label>
              <textarea
                value={jobForm.benefits}
                onChange={(e) => updateForm({ benefits: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="Télétravail&#10;Tickets restaurant&#10;Mutuelle"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={jobForm.featured}
                onChange={(e) => updateForm({ featured: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="featured" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Mettre en avant cette offre
              </label>
            </div>
          </div>
          
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
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

// Composant Modal de détail de job
function JobDetailModal({ job, onClose, darkMode }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6 flex justify-between items-center`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {job.title}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Building className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} mr-2`} />
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{job.company}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} mr-2`} />
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{job.location}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                job.type === 'CDI' 
                  ? 'bg-green-100 text-green-800' 
                  : job.type === 'CDD'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {job.type}
              </span>
            </div>

            <div className="flex items-center">
              <Euro className="w-5 h-5 text-green-600 mr-2" />
              <span className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {job.salary} {job.salary_type}
              </span>
            </div>

            <div>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Description
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                {job.description}
              </p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Compétences requises
                </h3>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Avantages
                </h3>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Postuler à cette mission
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant Modal de connexion admin
function AdminLoginModal({ onClose, darkMode }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    } else {
      onClose();
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-md w-full`}>
        <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6 flex justify-between items-center`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Connexion Admin
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
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
              className={`w-full px-3 py-2 border rounded-lg mb-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg mb-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Wrapper pour les missions
function MissionsPageWrapper() {
  const { isAdmin, signOut, isSupabaseConfigured } = useAuth();
  const { darkMode } = useTheme();

  return (
    <Suspense fallback={<LoadingSpinner darkMode={darkMode} />}>
      <MissionsPage 
        isAdmin={isAdmin}
        signOut={signOut}
        isSupabaseConfigured={isSupabaseConfigured}
        darkMode={darkMode}
      />
    </Suspense>
  );
}

// Wrapper pour la page À propos
function AboutPageWrapper() {
  const { isAdmin, signOut, isSupabaseConfigured } = useAuth();
  const { darkMode } = useTheme();

  return (
    <Suspense fallback={<LoadingSpinner darkMode={darkMode} />}>
      <AboutPage 
        isAdmin={isAdmin}
        signOut={signOut}
        isSupabaseConfigured={isSupabaseConfigured}
        darkMode={darkMode}
      />
    </Suspense>
  );
}

// Composant principal de l'application
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<JobBoardContent />} />
            <Route path="/missions" element={<MissionsPageWrapper />} />
            <Route path="/about" element={<AboutPageWrapper />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

