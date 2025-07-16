// src/App.jsx - Application principale avec AdefreePage intégrée
import React, { useState, useEffect, useCallback, useMemo, Suspense, useReducer, createContext, useContext, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, MapPin, Briefcase, Menu, X, Plus, Edit, Trash2, LogIn, LogOut, Building, Euro, Filter, Sparkles, TrendingUp, Users, Moon, Sun, ArrowRight, CheckCircle, RefreshCw, Loader2, AlertTriangle, ExternalLink, Mail, Phone, Upload, Calculator } from 'lucide-react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { jobService } from './services/jobService';
import './App.css';

// Lazy loading des pages
const MissionsPage = lazy(() => import('./components/ui/MissionsPage'));
const AboutPage = lazy(() => import('./components/ui/AboutPage'));
const MissionDetailPage = lazy(() => import('./components/ui/MissionDetailPage'));
const PostJobPage = lazy(() => import('./components/ui/PostJobPage'));
const AdefreePage = lazy(() => import('./components/ui/AdefreePage'));

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

/// Hook pour le formulaire avec timeout et progress
const useJobForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const submitWithProgress = useCallback(async (submitFunction) => {  // ← AJOUTÉ: async
    setIsSubmitting(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await submitFunction();  // ← AJOUTÉ: await
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

  // Fonction de nettoyage automatique du texte
// NOUVEAU CODE - VERSION SÉCURISÉE
const cleanText = (text) => {
  // Protection contre les valeurs nulles/undefined
  if (!text) return '';
  if (typeof text !== 'string') return String(text);
  
  try {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')     // **gras** → gras
      .replace(/\*(.*?)\*/g, '$1')         // *italique* → italique
      .replace(/__(.*?)__/g, '$1')         // __gras__ → gras
      .replace(/_(.*?)_/g, '$1')           // _italique_ → italique
      .replace(/`(.*?)`/g, '$1')           // `code` → code
      .replace(/#{1,6}\s+/g, '')           // # titres → supprimé
      .replace(/[""]/g, '"')               // Guillemets courbes → droits
      .replace(/['']/g, "'")               // Apostrophes courbes → droites
      .replace(/…/g, '...')                // Points de suspension
      .replace(/–/g, '-')                  // Tiret long → court
      .replace(/—/g, '-')                  // Tiret cadratin → court
      .replace(/\s+/g, ' ')                // Espaces multiples → un seul
      .replace(/\n\s*\n/g, '\n\n')         // Lignes vides multiples → max 2
      .trim();                             // Supprimer espaces début/fin
    
      } catch (error) {
    console.warn('⚠️ Erreur cleanText pour:', text?.substring(0, 50), error);
    return text; // Retourner le texte original en cas d'erreur
  }
};
  
// Fonction handleJobSubmit corrigée avec logs détaillés
const handleJobSubmit = async () => {
  console.log('🚀 DEBUT handleJobSubmit');
  setSubmitMessage(null);

  try {
    await submitWithProgress(async () => {
      console.log('📝 Préparation des données...');
      const jobData = {
        title: cleanText(jobForm.title),
        company: cleanText(jobForm.company),
        location: cleanText(jobForm.location),
        type: jobForm.type,
        salary: cleanText(jobForm.salary),
        salary_type: 'TJM',
        description: cleanText(jobForm.description),
        requirements: cleanText(jobForm.requirements).split('\n').filter(r => r.trim()),
        benefits: cleanText(jobForm.benefits).split('\n').filter(b => b.trim()),
        slug: generateSlug(cleanText(jobForm.title), cleanText(jobForm.location)),
        featured: Boolean(jobForm.featured),
        posted_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
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
      console.log('📦 Données avant executeAction:', sanitizedData);

      // UNE SEULE fonction executeAction avec logs
      const executeAction = async () => {
        console.log('🚀 DEBUT executeAction');
        
        if (editingJob) {
          console.log('🔄 Appel updateJob avec ID:', editingJob.id);
          await jobService.updateJob(editingJob.id, sanitizedData);
          console.log('✅ updateJob terminé');
          dispatch({ type: 'UPDATE_JOB', payload: { ...sanitizedData, id: editingJob.id } });
          setSubmitMessage({ type: 'success', text: '✅ Mission mise à jour avec succès !' });
        } else {
          console.log('🔄 Appel createJob...');
          const result = await jobService.createJob(sanitizedData);
          console.log('✅ createJob terminé, résultat:', result);
          dispatch({ type: 'ADD_JOB', payload: result.data });
          setSubmitMessage({ type: 'success', text: '✅ Mission créée avec succès !' });
        }
        
        console.log('🎯 FIN executeAction');
      };

      // Exécuter avec session si disponible
      if (executeWithValidSession) {
        console.log('🔐 Exécution avec session validée...');
        await executeWithValidSession(executeAction);
      } else {
        console.log('🔓 Exécution directe...');
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
      // Créer FormData pour Netlify (supporte les fichiers)
      const formData = new FormData();
      
      // Champs requis par Netlify
      formData.append('form-name', 'job-application');
      
      // Données du candidat
      formData.append('name', applicationForm.name);
      formData.append('email', applicationForm.email);
      formData.append('phone', applicationForm.phone || '');
      formData.append('message', applicationForm.message || '');
      
      // Infos sur la mission
      formData.append('jobTitle', selectedJob.title);
      formData.append('company', selectedJob.company);
      formData.append('location', selectedJob.location);
      
      // CV en pièce jointe
      if (applicationForm.cv) {
        formData.append('cv', applicationForm.cv);
        console.log('CV ajouté:', applicationForm.cv.name, 'Taille:', applicationForm.cv.size);
      }

      console.log('Envoi du formulaire de candidature pour:', selectedJob.title);

      // Envoyer à Netlify Forms
      const netlifyResponse = await fetch('/', {
        method: 'POST',
        body: formData
      });

      if (!netlifyResponse.ok) {
        throw new Error('Erreur lors de l\'envoi du formulaire');
      }

      // Mettre à jour le compteur de candidatures dans Supabase
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
        
        // Fermer le modal et réinitialiser le formulaire
        setShowApplicationForm(false);
        setApplicationForm({ name: '', email: '', phone: '', message: '', cv: null });
      } else {
        // Si Netlify a réussi mais pas Supabase, on affiche quand même un succès
        setSubmitMessage({
          type: 'success',
          text: '✅ Candidature envoyée avec succès !'
        });
        setShowApplicationForm(false);
        setApplicationForm({ name: '', email: '', phone: '', message: '', cv: null });
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
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
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                    <img 
                      src="/logo-manouvellemission.png" 
                      alt="Ma Nouvelle Mission" 
                      className="w-10 h-10 object-contain"
                    />
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
                <Link to="/post-job" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Publier
                </Link>
                <Link to="/outils-freelance" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Outils
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

                {/* CTA Calculateur TJM */}
                <a
                  href="https://tjmfreelance.adefree.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  TJM
                </a>

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
                  to="/post-job"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Publier
                </Link>
                <Link
                  to="/outils-freelance"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Outils
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

                <a
                  href="https://tjmfreelance.adefree.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Calculator className="w-4 h-4 inline mr-2" />
                  Calculer mon TJM
                </a>
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
                      Freelance
                      <span className="block text-yellow-300">Trouvez votre nouvelle mission</span>
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
                        to="/outils-freelance"
                        className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all hover:scale-105"
                      >
                        <Calculator className="w-5 h-5 mr-2" />
                        Outils freelance
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
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">20+</div>
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
                  {[...filteredJobs]
                    .sort((a, b) => {
                      // D'abord, trier par featured (true avant false)
                      if (a.featured && !b.featured) return -1;
                      if (!a.featured && b.featured) return 1;
                      
                      // Ensuite, trier par date (plus récent d'abord)
                      return new Date(b.posted_date) - new Date(a.posted_date);
                    })
                    .slice(0, 6)
                    .map((job, index) => (
                    <div
                      key={job.id}
                      className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in mission-card overflow-hidden flex flex-col ${
                        job.featured ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {job.featured && (
                        <div className="flex items-center mb-4">
                          <Sparkles className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" />
                          <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400 truncate">
                            Mission en vedette
                          </span>
                        </div>
                      )}
                      
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 job-title break-words hyphens-auto">
                        {job.title}
                      </h3>
                      
                      <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2 min-w-0">
                        <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="job-company truncate">{job.company}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4 min-w-0">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      
                    <p className="text-gray-600 dark:text-gray-300 mb-6 job-description line-clamp-3 force-break">
                    {job.description}
                    </p>
                      
                      <div className="mt-auto">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center min-w-0">
                            <Euro className="w-4 h-4 text-green-600 dark:text-green-400 mr-1 flex-shrink-0" />
                            <span className="font-semibold text-green-600 dark:text-green-400 truncate">
                              {job.salary} {job.salary_type}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => navigate(`/mission/${job.slug}`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center whitespace-nowrap"
                                >
                            Voir détails
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </button>
                        </div>
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

              {/* Section CTA Adefree */}
              <section className="py-20 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 dark:from-purple-800 dark:via-blue-800 dark:to-purple-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                      Gérez vos missions comme un pro
                    </h2>
                    <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
                      Calculateur TJM, facturation automatisée, dashboard temps réel. 
                      Découvrez Adefree, l'outil de gestion préféré des freelances.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a
                        href="https://tjmfreelance.adefree.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all hover:scale-105 shadow-lg"
                      >
                        <Calculator className="w-5 h-5 mr-2" />
                        Calculer mon TJM gratuit
                      </a>
                      <Link
                        to="/outils-freelance"
                        className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-all hover:scale-105"
                      >
                        Découvrir tous les outils
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </div>
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
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                      <img 
                        src="/logo-manouvellemission.png" 
                        alt="Ma Nouvelle Mission" 
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <span className="text-2xl font-bold">Ma Nouvelle Mission</span>
                  </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Trouvez vos missions, gérez-les avec Adefree. L'écosystème complet 
                  pour les freelances qui réussissent. Propulsé par Get in Talent.
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
                    <Link to="/post-job" className="text-gray-300 hover:text-white transition-colors">
                      Publier
                    </Link>
                  </li>
                  <li>
                    <Link to="/outils-freelance" className="text-gray-300 hover:text-white transition-colors">
                      Outils Adefree
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
                <h3 className="text-lg font-semibold mb-6">Nos outils</h3>
                <ul className="space-y-3">
                  <li>
                    <a 
                      href="https://www.adefree.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors flex items-center"
                    >
                      Adefree
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://tjmfreelance.adefree.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors flex items-center"
                    >
                      Calculateur TJM
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </li>
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
                      href="https://pickmeup.fr/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors flex items-center"
                    >
                      PickMeUp
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
                © 2025 Ma Nouvelle Mission × Adefree - Propulsé par Get in Talent. Tous droits réservés.
              </p>
            </div>
          </div>
        </footer>

        {/* Modales */}

        // ÉTAPE 1 : AJOUT ULTRA-SÉCURISÉ DU FORMULAIRE UNIQUEMENT
// Trouvez cette ligne dans votre code : {/* Modal de connexion admin */}
// Et ajoutez JUSTE AVANT cette ligne :

        {/* ==================== FORMULAIRE DE MISSION - AJOUT SÉCURISÉ ==================== */}
        {showJobForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingJob ? 'Modifier la mission' : 'Créer une nouvelle mission'}
                </h2>
                <button
                  onClick={() => {
                    setShowJobForm(false);
                    resetFormState();
                  }}
                  className={`text-gray-400 hover:text-gray-600 ${darkMode ? 'dark:hover:text-gray-300' : ''}`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {isSubmitting && (
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {editingJob ? 'Mise à jour...' : 'Création...'}
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

              <form onSubmit={(e) => {
                e.preventDefault();
                handleJobSubmit();
              }} className="space-y-6">
                
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Titre de la mission *
                  </label>
                  <input
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 placeholder-gray-500'
                    }`}
                    placeholder="Ex: Développeur Full Stack React/Node.js"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Entreprise *
                  </label>
                  <input
                    type="text"
                    value={jobForm.company}
                    onChange={(e) => setJobForm({...jobForm, company: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 placeholder-gray-500'
                    }`}
                    placeholder="Ex: TechCorp Innovation"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Localisation *
                  </label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 placeholder-gray-500'
                    }`}
                    placeholder="Ex: Paris, Lyon, Remote..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Type de contrat *
                    </label>
                    <select
                      value={jobForm.type}
                      onChange={(e) => setJobForm({...jobForm, type: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                      required
                    >
                      <option value="Mission">Mission</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Salaire *
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={jobForm.salary}
                        onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
                        className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 placeholder-gray-500'
                        }`}
                        placeholder="Ex: 650"
                        required
                      />
                      <select
                        value={jobForm.salaryType}
                        onChange={(e) => setJobForm({...jobForm, salaryType: e.target.value})}
                        className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        <option value="TJM">TJM</option>
                        <option value="Annuel">Annuel</option>
                        <option value="Mensuel">Mensuel</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Description *
                  </label>
                  <textarea
                    value={jobForm.description}
                    onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 placeholder-gray-500'
                    }`}
                    placeholder="Décrivez la mission, les technologies utilisées, l'environnement de travail..."
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Prérequis (un par ligne)
                  </label>
                  <textarea
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm({...jobForm, requirements: e.target.value})}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 placeholder-gray-500'
                    }`}
                    placeholder="Ex:
5+ années d'expérience en développement web
Maîtrise de React et Node.js
Connaissance de PostgreSQL"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Avantages (un par ligne)
                  </label>
                  <textarea
                    value={jobForm.benefits}
                    onChange={(e) => setJobForm({...jobForm, benefits: e.target.value})}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 placeholder-gray-500'
                    }`}
                    placeholder="Ex:
Télétravail partiel possible
Mutuelle d'entreprise
Formation continue
Tickets restaurant"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={jobForm.featured}
                    onChange={(e) => setJobForm({...jobForm, featured: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="featured" className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Mission en vedette (apparaît en premier)
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJobForm(false);
                      resetFormState();
                    }}
                    disabled={isSubmitting}
                    className={`px-6 py-3 border rounded-lg transition-colors disabled:opacity-50 ${
                      darkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        {editingJob ? 'Mise à jour...' : 'Création...'}
                      </>
                    ) : (
                      <>
                        {editingJob ? 'Mettre à jour' : 'Créer la mission'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* ==================== FIN FORMULAIRE DE MISSION ==================== */}
        
        {/* Modal de connexion admin */}
        {showAdminLogin && (
          <AdminLoginModal
            onClose={() => setShowAdminLogin(false)}
            darkMode={darkMode}
          />
        )}

        {/* Toutes les autres modales existantes... */}
        {/* (JobForm, ApplicationForm, etc. - code identique à la version précédente) */}
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
                  path="/post-job" 
                  element={
                    <Suspense fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      </div>
                    }>
                      <PostJobPage darkMode={darkMode} />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/outils-freelance" 
                  element={
                    <Suspense fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      </div>
                    }>
                      <AdefreePage darkMode={darkMode} />
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
                <Route 
                  path="/mission/:slug" 
                  element={
                    <Suspense fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      </div>
                    }>
                      <MissionDetailPage darkMode={darkMode} />
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
