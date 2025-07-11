// src/App.jsx - Application principale Ma Nouvelle Mission (VERSION CORRIGÉE)
import React, { useState, useEffect, useCallback, useMemo, Suspense, useReducer, createContext, useContext, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, MapPin, Briefcase, Menu, X, Plus, Edit, Trash2, LogIn, LogOut, Building, Euro, Filter, Sparkles, TrendingUp, Users, Moon, Sun, ArrowRight, CheckCircle, RefreshCw, Loader2, AlertTriangle, ExternalLink, Mail, Phone, Upload } from 'lucide-react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { jobService } from './services/jobService';
import './App.css';

// Lazy loading des pages
const MissionsPage = lazy(() => import('./components/ui/MissionsPage'));
const AboutPage = lazy(() => import('./components/ui/AboutPage'));

// Context pour le thème
const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

// Context pour les jobs
const JobContext = createContext();
const useJobs = () => useContext(JobContext);

// ==================== REDUCERS ====================

// Reducer pour la gestion des jobs
const jobReducer = (state, action) => {
  switch (action.type) {
    case 'SET_JOBS':
      return { ...state, jobs: action.payload, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'ADD_JOB':
      return { ...state, jobs: [action.payload, ...state.jobs] };
    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(job => 
          job.id === action.payload.id ? action.payload : job
        )
      };
    case 'DELETE_JOB':
      return {
        ...state,
        jobs: state.jobs.filter(job => job.id !== action.payload)
      };
    default:
      return state;
  }
};

// ==================== CUSTOM HOOKS ====================

// Hook pour la gestion des données jobs avec timeout et AbortController
const useJobsData = () => {
  const [state, dispatch] = useReducer(jobReducer, {
    jobs: [],
    loading: true,
    error: null
  });

  const fetchJobs = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      // Utiliser fetchJobsWithSignal si disponible, sinon fallback
      let data;
      if (jobService.fetchJobsWithSignal) {
        data = await jobService.fetchJobsWithSignal(controller.signal);
      } else {
        data = await jobService.fetchJobs();
      }
      
      clearTimeout(timeoutId);
      dispatch({ type: 'SET_JOBS', payload: data });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        dispatch({ type: 'SET_ERROR', payload: 'Délai d\'attente dépassé' });
      } else {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    }
  }, []);

  return { ...state, fetchJobs, dispatch };
};

// Hook pour le formulaire avec timeout et progress
const useJobForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const submitWithProgress = useCallback(async (submitFunction) => {
    setIsSubmitting(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await submitFunction();
      setProgress(100);
      clearInterval(progressInterval);
      
      setTimeout(() => {
        setIsSubmitting(false);
        setProgress(0);
      }, 500);
      
      return result;
    } catch (error) {
      clearInterval(progressInterval);
      setIsSubmitting(false);
      setProgress(0);
      throw error;
    }
  }, []);

  return { isSubmitting, progress, submitWithProgress };
};

// ==================== ERROR BOUNDARY ====================

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-8">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Oups ! Une erreur s'est produite
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Nous nous excusons pour ce désagrément. Veuillez rafraîchir la page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

const validateJobData = (data) => {
  const errors = {};
  
  if (!data.title?.trim()) errors.title = 'Le titre est requis';
  if (!data.company?.trim()) errors.company = 'L\'entreprise est requise';
  if (!data.location?.trim()) errors.location = 'La localisation est requise';
  if (!data.description?.trim()) errors.description = 'La description est requise';
  if (!data.salary?.trim()) errors.salary = 'Le salaire est requis';
  
  return errors;
};

const sanitizeJobData = (data) => {
  return {
    ...data,
    title: data.title?.trim(),
    company: data.company?.trim(),
    location: data.location?.trim(),
    description: data.description?.trim(),
    requirements: Array.isArray(data.requirements) ? data.requirements : [],
    benefits: Array.isArray(data.benefits) ? data.benefits : []
  };
};

const generateSlug = (title, location) => {
  return `${title}-${location}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// ==================== COMPOSANT ADMIN LOGIN MODAL ====================
const AdminLoginModal = ({ onClose, darkMode }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        onClose();
      }
    } catch (err) {
      setError('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 w-full max-w-md`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Connexion Admin
          </h2>
          <button
            onClick={onClose}
            className={`text-gray-400 hover:text-gray-600 ${darkMode ? 'dark:hover:text-gray-300' : ''}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
              required
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ==================== COMPOSANT PRINCIPAL ====================

const JobBoardContent = () => {
  const { isAdmin, signOut, isSupabaseConfigured, executeWithValidSession, sessionExpired, clearSessionExpired } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { jobs, loading, error, fetchJobs, dispatch } = useJobs();
  const { isSubmitting, progress, submitWithProgress } = useJobForm();
  
  // États UI
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  // États pour le feedback utilisateur
  const [submitMessage, setSubmitMessage] = useState(null);
  const [isDeletingJob, setIsDeletingJob] = useState(null);

  // États pour les formulaires
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

  const [applicationForm, setApplicationForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    cv: null
  });

  // Utilisation du hook de formulaire
  const navigate = useNavigate();
  const location = useLocation();

  // Effet pour masquer les messages après 5 secondes
  useEffect(() => {
    if (submitMessage) {
      const timer = setTimeout(() => {
        setSubmitMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitMessage]);

  // Gestion de la session expirée
  useEffect(() => {
    if (sessionExpired) {
      setSubmitMessage({
        type: 'error',
        text: '🔒 Session expirée. Veuillez vous reconnecter pour continuer.'
      });
      setShowJobForm(false);
      setEditingJob(null);
    }
  }, [sessionExpired]);

  // Charger les jobs au démarrage
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Fonction pour réinitialiser le formulaire
  const resetFormState = useCallback(() => {
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
  }, []);

  // Fonction handleJobSubmit corrigée avec logs détaillés
  const handleJobSubmit = async () => {
    console.log('🚀 DEBUT handleJobSubmit');
    setSubmitMessage(null);

    try {
      await submitWithProgress(async () => {
        console.log('📝 Préparation des données...');
        const jobData = {
          title: jobForm.title?.trim() || '',
          company: jobForm.company?.trim() || '',
          location: jobForm.location?.trim() || '',
          type: jobForm.type,
          salary: jobForm.salary,
          salary_type: jobForm.type === 'CDI' || jobForm.type === 'CDD' ? 'Annuel' : 'TJM',
          description: jobForm.description?.trim() || '',
          requirements: jobForm.requirements.split('\n').filter(r => r.trim()),
          benefits: jobForm.benefits.split('\n').filter(b => b.trim()),
          slug: generateSlug(jobForm.title || '', jobForm.location || ''),
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
          return;
        }

        const sanitizedData = sanitizeJobData(jobData);

        console.log(editingJob ? '🛠️ Mise à jour...' : '➕ Création...');
        
        // Utiliser executeWithValidSession si disponible
        const executeAction = async () => {
          if (editingJob) {
            await jobService.updateJob(editingJob.id, sanitizedData);
            dispatch({ type: 'UPDATE_JOB', payload: { ...sanitizedData, id: editingJob.id } });
            setSubmitMessage({ type: 'success', text: '✅ Mission mise à jour avec succès !' });
          } else {
            const result = await jobService.createJob(sanitizedData);
            dispatch({ type: 'ADD_JOB', payload: result.data });
            setSubmitMessage({ type: 'success', text: '✅ Mission créée avec succès !' });
          }
        };

        if (executeWithValidSession) {
          await executeWithValidSession(executeAction);
        } else {
          await executeAction();
        }

        console.log('⏳ Pause de 500ms');
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('🔄 Rafraîchissement des jobs...');
        await fetchJobs();

        console.log('🧹 Réinitialisation du formulaire');
        resetFormState();

        console.log('🪟 Fermeture du formulaire dans 2 secondes');
        setTimeout(() => {
          setShowJobForm(false);
        }, 2000);
      });
    } catch (error) {
      console.error('❌ ERREUR dans handleJobSubmit:', error);
      setSubmitMessage({
        type: 'error',
        text: '❌ ' + (error.message || 'Erreur lors de la sauvegarde')
      });
    }
    
    console.log('🔚 FIN handleJobSubmit');
  };

  // Fonction pour supprimer un job
  const deleteJob = async (id, title) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la mission "${title}" ?\n\nCette action est irréversible.`)) {
      return;
    }

    setIsDeletingJob(id);
    setSubmitMessage(null);

    try {
      const executeAction = async () => {
        await jobService.deleteJob(id);
        dispatch({ type: 'DELETE_JOB', payload: id });
        setSubmitMessage({
          type: 'success',
          text: '✅ Mission supprimée avec succès !'
        });
      };

      if (executeWithValidSession) {
        await executeWithValidSession(executeAction);
      } else {
        await executeAction();
      }

      await fetchJobs();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setSubmitMessage({
        type: 'error',
        text: '❌ ' + (error.message || 'Erreur lors de la suppression')
      });
    } finally {
      setIsDeletingJob(null);
    }
  };

  // Fonction pour gérer la reconnexion après session expirée
  const handleReconnect = () => {
    clearSessionExpired();
    setSubmitMessage(null);
    setShowAdminLogin(true);
  };

  // Fonction pour postuler à une mission
  const handleApply = async (jobId) => {
    try {
      const result = await jobService.incrementApplicants(jobId);
      if (result.success) {
        dispatch({ 
          type: 'UPDATE_JOB', 
          payload: { 
            ...jobs.find(job => job.id === jobId), 
            applicants: result.newCount 
          } 
        });
        setSubmitMessage({
          type: 'success',
          text: '✅ Candidature envoyée avec succès !'
        });
        setShowApplicationForm(false);
        setApplicationForm({ name: '', email: '', phone: '', message: '', cv: null });
      } else {
        setSubmitMessage({
          type: 'error',
          text: '❌ ' + result.message
        });
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: '❌ Erreur lors de l\'envoi de la candidature'
      });
    }
  };

  // Filtrage des jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesType = !typeFilter || job.type === typeFilter;
      
      return matchesSearch && matchesLocation && matchesType;
    });
  }, [jobs, searchTerm, locationFilter, typeFilter]);

  // Obtenir les localisations uniques
  const uniqueLocations = useMemo(() => {
    return [...new Set(jobs.map(job => job.location))];
  }, [jobs]);

  // Fonction pour éditer un job
  const editJob = useCallback((job) => {
    setJobForm({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary,
      salaryType: job.salary_type,
      description: job.description,
      requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : '',
      benefits: Array.isArray(job.benefits) ? job.benefits.join('\n') : '',
      featured: job.featured || false
    });
    setEditingJob(job);
    setShowJobForm(true);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        
        {/* Notifications */}
        {submitMessage && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
            submitMessage.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700 dark:bg-green-900 dark:border-green-600 dark:text-green-300' 
              : 'bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:border-red-600 dark:text-red-300'
          }`}>
            <div className="flex items-start">
              {submitMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="whitespace-pre-line">{submitMessage.text}</p>
                {sessionExpired && (
                  <button
                    onClick={handleReconnect}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Se reconnecter
                  </button>
                )}
              </div>
              <button
                onClick={() => setSubmitMessage(null)}
                className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Ma Nouvelle Mission
                </span>
              </Link>

              {/* Navigation Desktop */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Accueil
                </Link>
                <Link to="/missions" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Missions
                </Link>
                <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  À propos
                </Link>
              </nav>

              {/* Actions */}
              <div className="flex items-center space-x-4">
                {/* Toggle mode sombre */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  aria-label="Basculer le mode sombre"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Boutons admin */}
                {isSupabaseConfigured && (
                  <>
                    {isAdmin ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            resetFormState();
                            setShowJobForm(true);
                          }}
                          disabled={sessionExpired}
                          className="hidden md:flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Nouvelle mission
                        </button>
                        <button
                          onClick={signOut}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Se déconnecter"
                        >
                          <LogOut className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAdminLogin(true)}
                        className="hidden md:flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Admin
                      </button>
                    )}
                  </>
                )}

                {/* Menu mobile */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Menu mobile */}
          {showMobileMenu && (
            <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 space-y-2">
                <Link
                  to="/"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Accueil
                </Link>
                <Link
                  to="/missions"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Missions
                </Link>
                <Link
                  to="/about"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  À propos
                </Link>
                
                {isSupabaseConfigured && (
                  <>
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => {
                            resetFormState();
                            setShowJobForm(true);
                            setShowMobileMenu(false);
                          }}
                          disabled={sessionExpired}
                          className="w-full text-left px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4 inline mr-2" />
                          Nouvelle mission
                        </button>
                        <button
                          onClick={() => {
                            signOut();
                            setShowMobileMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4 inline mr-2" />
                          Se déconnecter
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setShowAdminLogin(true);
                          setShowMobileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <LogIn className="w-4 h-4 inline mr-2" />
                        Admin
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Contenu principal */}
        <main className="flex-1">
          {location.pathname === '/' && (
            <>
              {/* Hero Section */}
              <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-800 dark:via-purple-800 dark:to-blue-900">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                  <div className="text-center">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
                      Trouvez votre
                      <span className="block text-yellow-300">nouvelle mission</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto animate-fade-in animation-delay-200">
                      Découvrez les meilleures opportunités professionnelles et donnez un nouvel élan à votre carrière
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-400">
                      <Link
                        to="/missions"
                        className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all hover:scale-105 shadow-lg"
                      >
                        <Search className="w-5 h-5 mr-2" />
                        Explorer les missions
                      </Link>
                      <Link
                        to="/about"
                        className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all hover:scale-105"
                      >
                        <Users className="w-5 h-5 mr-2" />
                        En savoir plus
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section des statistiques */}
              <section className="py-16 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center animate-fade-in">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{jobs.length}+</div>
                      <div className="text-gray-600 dark:text-gray-300">Missions disponibles</div>
                    </div>
                    <div className="text-center animate-fade-in animation-delay-200">
                      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">200+</div>
                      <div className="text-gray-600 dark:text-gray-300">Entreprises partenaires</div>
                    </div>
                    <div className="text-center animate-fade-in animation-delay-400">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">95%</div>
                      <div className="text-gray-600 dark:text-gray-300">Taux de satisfaction</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section des missions en vedette */}
              <section className="py-20 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                      Missions en vedette
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                      Découvrez une sélection de nos meilleures opportunités professionnelles
                    </p>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Erreur de chargement
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
                      <button
                        onClick={fetchJobs}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Réessayer
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredJobs.slice(0, 6).map((job, index) => (
                        <div
                          key={job.id}
                          className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in mission-card ${
                            job.featured ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''
                          }`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {job.featured && (
                            <div className="flex items-center mb-4">
                              <Sparkles className="w-4 h-4 text-yellow-500 mr-2" />
                              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                Mission en vedette
                              </span>
                            </div>
                          )}
                          
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 job-title">
                            {job.title}
                          </h3>
                          
                          <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                            <Building className="w-4 h-4 mr-2" />
                            <span className="job-company">{job.company}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{job.location}</span>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-300 mb-6 job-description">
                            {job.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Euro className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {job.salary} {job.salary_type}
                              </span>
                            </div>
                            
                            <button
                              onClick={() => {
                                setSelectedJob(job);
                                setShowApplicationForm(true);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                              Postuler
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                          </div>
                          
                          {isAdmin && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {job.applicants || 0} candidature(s)
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => editJob(job)}
                                  disabled={sessionExpired}
                                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                                  title="Modifier"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteJob(job.id, job.title)}
                                  disabled={isDeletingJob === job.id || sessionExpired}
                                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                  title="Supprimer"
                                >
                                  {isDeletingJob === job.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-center mt-12">
                    <Link
                      to="/missions"
                      className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover:scale-105 shadow-lg"
                    >
                      Voir toutes les missions
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Logo et description */}
              <div className="md:col-span-2">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold">Ma Nouvelle Mission</span>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  La plateforme de référence pour connecter les talents avec les meilleures 
                  opportunités professionnelles. Propulsé par Get in Talent.
                </p>
                <div className="flex space-x-4">
                  <a href="mailto:hello@getintalent.fr" className="text-gray-400 hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </a>
                  <a href="tel:+33123456789" className="text-gray-400 hover:text-white transition-colors">
                    <Phone className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Navigation */}
              <div>
                <h3 className="text-lg font-semibold mb-6">Navigation</h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                      Accueil
                    </Link>
                  </li>
                  <li>
                    <Link to="/missions" className="text-gray-300 hover:text-white transition-colors">
                      Missions
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                      À propos
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Sites partenaires */}
              <div>
                <h3 className="text-lg font-semibold mb-6">Nos sites</h3>
                <ul className="space-y-3">
                  <li>
                    <a 
                      href="https://getintalent.fr" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors flex items-center"
                    >
                      Get in Talent
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://tjmfreelance.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors flex items-center"
                    >
                      Calcul TJM Freelance
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="border-t border-gray-800 mt-12 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                <div>
                  <h4 className="font-semibold mb-2">Email</h4>
                  <a href="mailto:hello@getintalent.fr" className="text-gray-300 hover:text-white transition-colors">
                    hello@getintalent.fr
                  </a>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Téléphone</h4>
                  <a href="tel:+33972328994" className="text-gray-300 hover:text-white transition-colors">
                    +33 9 72 32 89 94
                  </a>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Adresse</h4>
                  <p className="text-gray-300">Paris, France</p>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-800 mt-8 pt-8 text-center">
              <p className="text-gray-400">
                © 2025 Ma Nouvelle Mission - Propulsé par Get in Talent. Tous droits réservés.
              </p>
            </div>
          </div>
        </footer>

        {/* Modales */}
        
        {/* Modal de connexion admin */}
        {showAdminLogin && (
          <AdminLoginModal
            onClose={() => setShowAdminLogin(false)}
            darkMode={darkMode}
          />
        )}

        {/* Modal de formulaire de mission */}
        {showJobForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl my-8 max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingJob ? 'Modifier la mission' : 'Nouvelle mission'}
                </h2>
                <button
                  onClick={() => {
                    setShowJobForm(false);
                    setEditingJob(null);
                    resetFormState();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Barre de progression */}
              {isSubmitting && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {editingJob ? 'Mise à jour en cours...' : 'Création en cours...'}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Titre de la mission *
                    </label>
                    <input
                      type="text"
                      value={jobForm.title}
                      onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Entreprise *
                    </label>
                    <input
                      type="text"
                      value={jobForm.company}
                      onChange={(e) => setJobForm({...jobForm, company: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Localisation *
                    </label>
                    <input
                      type="text"
                      value={jobForm.location}
                      onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type de contrat
                    </label>
                    <select
                      value={jobForm.type}
                      onChange={(e) => setJobForm({...jobForm, type: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={isSubmitting}
                    >
                      <option value="Mission">Mission</option>
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Stage">Stage</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Salaire *
                    </label>
                    <input
                      type="text"
                      value={jobForm.salary}
                      onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
                      placeholder="ex: 600 ou 45K-55K"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type de salaire
                    </label>
                    <select
                      value={jobForm.salaryType}
                      onChange={(e) => setJobForm({...jobForm, salaryType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={isSubmitting}
                    >
                      <option value="TJM">TJM</option>
                      <option value="Annuel">Annuel</option>
                      <option value="Mensuel">Mensuel</option>
                      <option value="Horaire">Horaire</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={jobForm.description}
                    onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exigences (une par ligne)
                  </label>
                  <textarea
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm({...jobForm, requirements: e.target.value})}
                    rows={4}
                    placeholder="ex: 5+ années d'expérience&#10;Maîtrise de React&#10;Connaissance de Node.js"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avantages (un par ligne)
                  </label>
                  <textarea
                    value={jobForm.benefits}
                    onChange={(e) => setJobForm({...jobForm, benefits: e.target.value})}
                    rows={4}
                    placeholder="ex: Télétravail partiel&#10;Mutuelle d'entreprise&#10;Formation continue"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={jobForm.featured}
                    onChange={(e) => setJobForm({...jobForm, featured: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mission en vedette
                  </label>
                </div>
                
                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJobForm(false);
                      setEditingJob(null);
                      resetFormState();
                    }}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    disabled={isSubmitting}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleJobSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingJob ? 'Mise à jour...' : 'Publication...'}
                      </>
                    ) : (
                      editingJob ? 'Mettre à jour' : 'Publier la mission'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de candidature AVEC CV */}
        {showApplicationForm && selectedJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header fixe */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Postuler à cette mission
                  </h2>
                  <button
                    onClick={() => {
                      setShowApplicationForm(false);
                      setSelectedJob(null);
                      setApplicationForm({ name: '', email: '', phone: '', message: '', cv: null });
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Contenu scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      {selectedJob.title}
                    </h3>
                    <p className="text-blue-700 dark:text-blue-400 text-sm">
                      {selectedJob.company} • {selectedJob.location}
                    </p>
                  </div>
                  
                  <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={applicationForm.name}
                      onChange={(e) => setApplicationForm({...applicationForm, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={applicationForm.email}
                      onChange={(e) => setApplicationForm({...applicationForm, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={applicationForm.phone}
                    onChange={(e) => setApplicationForm({...applicationForm, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message de motivation
                  </label>
                  <textarea
                    value={applicationForm.message}
                    onChange={(e) => setApplicationForm({...applicationForm, message: e.target.value})}
                    rows={4}
                    placeholder="Expliquez pourquoi vous êtes intéressé(e) par cette mission..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CV (PDF uniquement, max 10MB)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor="cv-upload"
                          className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Télécharger un fichier</span>
                          <input
                            id="cv-upload"
                            name="cv-upload"
                            type="file"
                            accept=".pdf"
                            className="sr-only"
                            onChange={(e) => setApplicationForm({...applicationForm, cv: e.target.files[0]})}
                          />
                        </label>
                        <p className="pl-1">ou glisser-déposer</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF jusqu'à 10MB
                      </p>
                      {applicationForm.cv && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                          ✓ {applicationForm.cv.name}
                        </p>
                      )}
                     </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer avec boutons fixe */}
              <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplicationForm(false);
                      setSelectedJob(null);
                      setApplicationForm({ name: '', email: '', phone: '', message: '', cv: null });
                    }}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApply(selectedJob.id)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    Envoyer ma candidature
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
              )}
      </div>
    </div>
  );
};


// ==================== WRAPPER AVEC PROVIDERS ====================
const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', newValue.toString());
      return newValue;
    });
  }, []);

  const jobsData = useJobsData();

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
          <JobContext.Provider value={jobsData}>
            <Router>
              <Routes>
                <Route path="/" element={<JobBoardContent />} />
                <Route 
                  path="/missions" 
                  element={
                    <Suspense fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      </div>
                    }>
                      <MissionsPage darkMode={darkMode} />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/about" 
                  element={
                    <Suspense fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      </div>
                    }>
                      <AboutPage darkMode={darkMode} />
                    </Suspense>
                  } 
                />
              </Routes>
            </Router>
          </JobContext.Provider>
        </ThemeContext.Provider>
      </AuthProvider>
    </ErrorBoundary>
  );
};
            
export default App;
            
