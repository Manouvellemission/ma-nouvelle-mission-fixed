// src/components/ui/MissionsPage.jsx - VERSION CORRIGÉE POUR MODE SOMBRE
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Building, Euro, Filter, Sparkles, Users, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchJobsPaginated } from '../../services/jobService';
import { useAuth } from '../../contexts/AuthContext';
import SkeletonLoader from './SkeletonLoader';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';

const MissionsPage = ({ darkMode }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    salary: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);

  const { user } = useAuth();

  // ✅ THÈME UNIFIÉ POUR MODE SOMBRE
  const theme = {
    // Arrière-plans
    pageBg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    headerBg: darkMode ? 'bg-gray-800' : 'bg-white',
    cardBg: darkMode ? 'bg-gray-800' : 'bg-white',
    inputBg: darkMode ? 'bg-gray-700' : 'bg-white',
    
    // Textes
    textPrimary: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
    textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
    
    // Bordures
    border: darkMode ? 'border-gray-600' : 'border-gray-300',
    borderLight: darkMode ? 'border-gray-700' : 'border-gray-200',
    
    // États
    hover: darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
    focus: 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  };

  // Charger les missions avec pagination
  const loadJobs = async (page = 1) => {
    setLoading(true);
    try {
      const result = await fetchJobsPaginated(page, 12);
      setJobs(result.jobs);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
      setCurrentPage(result.currentPage);
    } catch (error) {
      console.error('Erreur chargement missions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs(currentPage);
  }, [currentPage]);

  // Filtrer les missions
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filters.type || job.type === filters.type;
    const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen ${theme.pageBg}`}>
      {/* Header avec recherche - CORRIGÉ */}
      <div className={`${theme.headerBg} shadow-sm ${theme.borderLight} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Bouton retour */}
          <div className="mb-6">
            <Link 
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour à l'accueil
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className={`text-4xl font-bold ${theme.textPrimary} mb-4`}>
              Toutes les missions
            </h1>
            <p className={`text-xl ${theme.textSecondary}`}>
              {totalCount} mission{totalCount > 1 ? 's' : ''} disponible{totalCount > 1 ? 's' : ''}
            </p>
          </div>

          {/* Barre de recherche - CORRIGÉE */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme.textMuted} h-5 w-5`} />
            <input
              type="text"
              placeholder="Rechercher par poste, ville ou entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 ${theme.inputBg} ${theme.textPrimary} ${theme.border} border rounded-lg ${theme.focus} text-lg placeholder-gray-400`}
            />
          </div>

          {/* Filtres - CORRIGÉS */}
          <div className="flex flex-wrap gap-4 justify-center">
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className={`px-4 py-2 ${theme.inputBg} ${theme.textPrimary} ${theme.border} border rounded-lg ${theme.focus}`}
            >
              <option value="">Tous les types</option>
              <option value="Mission">Mission</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Freelance">Freelance</option>
              <option value="Stage">Stage</option>
            </select>

            <input
              type="text"
              placeholder="Ville..."
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className={`px-4 py-2 ${theme.inputBg} ${theme.textPrimary} ${theme.border} border rounded-lg ${theme.focus} placeholder-gray-400`}
            />
          </div>
        </div>
      </div>

      {/* Liste des missions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <SkeletonLoader count={12} />
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredJobs.map(job => (
                <div key={job.id} 
                     className={`${theme.cardBg} rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer ${theme.borderLight} border`}
                     onClick={() => setSelectedJob(job)}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`text-xl font-semibold ${theme.textPrimary} line-clamp-2`}>
                      {job.title}
                    </h3>
                    {job.featured && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Vedette
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className={`flex items-center ${theme.textSecondary}`}>
                      <Building className="h-4 w-4 mr-2" />
                      <span>{job.company}</span>
                    </div>
                    <div className={`flex items-center ${theme.textSecondary}`}>
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{job.location}</span>
                    </div>
                    <div className={`flex items-center ${theme.textSecondary}`}>
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span>{job.type}</span>
                    </div>
                    {job.salary && (
                      <div className={`flex items-center ${theme.textSecondary}`}>
                        <Euro className="h-4 w-4 mr-2" />
                        <span>{job.salary_type === 'TJM' ? `${job.salary}€/jour` : `${job.salary}€/an`}</span>
                      </div>
                    )}
                  </div>

                  <p className={`${theme.textSecondary} text-sm line-clamp-3 mb-4`}
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
                    <span className={`text-sm ${theme.textMuted}`}>
                      {new Date(job.created_at || job.posted_date).toLocaleDateString('fr-FR')}
                    </span>
                    {job.applicants > 0 && (
                      <span className={`text-sm ${theme.textSecondary} flex items-center gap-1`}>
                        <Users className="w-4 h-4" />
                        {job.applicants} candidat{job.applicants > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Message si aucun résultat - CORRIGÉ */}
            {filteredJobs.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className={`${theme.textSecondary} text-lg`}>
                  Aucune mission ne correspond à votre recherche.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({ type: '', location: '', salary: '' });
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {[...Array(Math.min(totalPages, 10))].map((_, index) => {
                    const page = index + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>

      {/* Modal Job Details */}
      {selectedJob && (
        <JobModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

// Composant Modal Job Details - CORRIGÉ POUR MODE SOMBRE
function JobModal({ job, onClose, darkMode }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    cvFile: null
  });

  // ✅ THÈME MODAL UNIFIÉ
  const modalTheme = {
    bg: darkMode ? 'bg-gray-800' : 'bg-white',
    textPrimary: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
    textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    inputBg: darkMode ? 'bg-gray-700' : 'bg-gray-50',
    buttonClose: darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  };

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
      
      netlifyData.append('form-name', 'job-application');
      netlifyData.append('name', formData.name);
      netlifyData.append('email', formData.email);
      netlifyData.append('message', formData.message || 'Pas de message');
      netlifyData.append('jobTitle', job.title);
      netlifyData.append('company', job.company);
      netlifyData.append('location', job.location);
      
      if (formData.cvFile) {
        if (formData.cvFile.size > 10 * 1024 * 1024) {
          alert('Le fichier est trop volumineux. Maximum 10MB.');
          setIsSubmitting(false);
          return;
        }
        netlifyData.append('cv', formData.cvFile);
      }

      const response = await fetch('/', {
        method: 'POST',
        body: netlifyData
      });

      if (response.ok) {
        setSubmitStatus('success');
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
        <div className={`${modalTheme.bg} rounded-lg p-8 max-w-md text-center`}>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-4 ${modalTheme.textPrimary}`}>
            Candidature envoyée !
          </h2>
          <p className={modalTheme.textSecondary}>
            Merci pour votre candidature. Nous reviendrons vers vous rapidement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${modalTheme.bg} rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`sticky top-0 ${modalTheme.bg} border-b ${modalTheme.border} p-6 flex justify-between items-center`}>
          <h2 className={`text-2xl font-bold ${modalTheme.textPrimary}`}>
            {job.title}
          </h2>
          <button onClick={onClose} className={`p-2 ${modalTheme.buttonClose} rounded ${modalTheme.textMuted}`}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className={`text-lg ${modalTheme.textSecondary} mb-2`}>{job.company}</p>
            <div className={`flex flex-wrap gap-4 text-sm ${modalTheme.textMuted}`}>
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
              <h3 className={`text-lg font-semibold mb-3 ${modalTheme.textPrimary}`}>
                Description
              </h3>
              <p className={`whitespace-pre-line ${modalTheme.textSecondary}`}>{job.description}</p>
            </div>

            {job.requirements && Array.isArray(job.requirements) && job.requirements.length > 0 && (
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${modalTheme.textPrimary}`}>
                  Compétences requises
                </h3>
                <ul className="space-y-2">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className={modalTheme.textSecondary}>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.benefits && Array.isArray(job.benefits) && job.benefits.length > 0 && (
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${modalTheme.textPrimary}`}>
                  Avantages
                </h3>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500 mt-0.5" />
                      <span className={modalTheme.textSecondary}>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className={`mt-8 space-y-4 border-t ${modalTheme.border} pt-8`}>
            <h3 className={`text-lg font-semibold mb-4 ${modalTheme.textPrimary}`}>
              Postuler maintenant
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nom complet *"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`px-4 py-3 rounded-lg ${modalTheme.inputBg} ${modalTheme.textPrimary} border ${modalTheme.border} placeholder-gray-400`}
              />
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`px-4 py-3 rounded-lg ${modalTheme.inputBg} ${modalTheme.textPrimary} border ${modalTheme.border} placeholder-gray-400`}
              />
            </div>
            
            <textarea
              placeholder="Message de motivation"
              rows="4"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className={`w-full px-4 py-3 rounded-lg ${modalTheme.inputBg} ${modalTheme.textPrimary} border ${modalTheme.border} placeholder-gray-400`}
            />
            
            <div>
              <label className={`block mb-2 ${modalTheme.textSecondary}`}>
                CV (PDF - optionnel, max 10MB)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFormData({...formData, cvFile: e.target.files[0]})}
                className={`w-full px-4 py-3 rounded-lg ${modalTheme.inputBg} ${modalTheme.textPrimary} border ${modalTheme.border}`}
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
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MissionsPage;

