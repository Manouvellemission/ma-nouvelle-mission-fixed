// src/components/ui/MissionsPage.jsx - VERSION AVEC NAVIGATION VERS PAGE DÉDIÉE + ÉDITION/SUPPRESSION
import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Briefcase, Building, Euro, Filter, Sparkles, Users, ArrowLeft, CheckCircle, X, ArrowRight, Loader2, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchJobsPaginated, jobService } from '../../services/jobService';
import { useAuth } from '../../contexts/AuthContext';
import { useJobs } from '../../contexts/JobContext';
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
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    salary: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isDeletingJob, setIsDeletingJob] = useState(null);

  const { user, isAdmin, executeWithValidSession } = useAuth();
  const { dispatch, fetchJobs } = useJobs();
  const navigate = useNavigate();

  // Charger les missions avec pagination
  const loadJobs = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchJobsPaginated(page, 12);
      setJobs(result.jobs);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
      setCurrentPage(result.currentPage);
    } catch (error) {
      console.error('Erreur chargement missions:', error);
      setError('Erreur lors du chargement des missions');
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

  // Trier les missions : missions en vedette d'abord, puis par date
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    // D'abord, trier par featured (true avant false)
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    
    // Ensuite, trier par date (plus récent d'abord)
    return new Date(b.posted_date) - new Date(a.posted_date);
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fonction d'édition
  const editJob = useCallback((job) => {
    navigate('/', { state: { editingJob: job } });
  }, [navigate]);

  // Fonction de suppression
  const deleteJob = async (id, title) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la mission "${title}" ? Cette action est irréversible.`)) {
      return;
    }

    setIsDeletingJob(id);

    try {
      const executeAction = async () => {
        await jobService.deleteJob(id);
        dispatch({ type: 'DELETE_JOB', payload: id });
      };

      if (executeWithValidSession) {
        await executeWithValidSession(executeAction);
      } else {
        await executeAction();
      }

      await fetchJobs();
      loadJobs(currentPage);
    } catch (error) {
      alert('Erreur lors de la suppression : ' + error.message);
    } finally {
      setIsDeletingJob(null);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        
        {/* Header avec recherche - Style aligné */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Bouton retour */}
            <div className="mb-6">
              <Link 
                to="/"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour à l'accueil
              </Link>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in">
                Toutes les missions
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 animate-fade-in animation-delay-200">
                {totalCount} mission{totalCount > 1 ? 's' : ''} disponible{totalCount > 1 ? 's' : ''}
              </p>
            </div>

            {/* Barre de recherche - Style aligné */}
            <div className="relative max-w-2xl mx-auto mb-6 animate-fade-in animation-delay-400">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher par poste, ville ou entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg placeholder-gray-400 shadow-sm"
              />
            </div>

            {/* Filtres - Style aligné */}
            <div className="flex flex-wrap gap-4 justify-center animate-fade-in animation-delay-600">
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              >
                <option value="">Toutes les missions</option>
                <option value="Mission">Mission</option>
              </select>

              <input
                type="text"
                placeholder="Ville..."
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(12)].map((_, i) => (
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
                onClick={() => loadJobs(currentPage)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedJobs.map((job, index) => (
                  <div
                    key={job.id}
                    className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in cursor-pointer mission-card overflow-hidden flex flex-col ${
                      job.featured ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => navigate(`/mission/${job.slug}`)}
                  >
                    {job.featured && (
                      <div className="flex items-center mb-4">
                        <Sparkles className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400 truncate">
                          Mission en vedette
                        </span>
                      </div>
                    )}
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 break-words hyphens-auto">
                      {job.title}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2 min-w-0">
                      <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{job.company}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4 min-w-0">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 job-description">
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
                        
                        <div className="flex items-center text-blue-600 dark:text-blue-400">
                          <span className="text-sm font-medium whitespace-nowrap">Voir détails</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                    
                    {job.applicants > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {job.applicants} candidature{job.applicants > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {/* Boutons d'édition et de suppression pour les admins */}
                    {isAdmin && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editJob(job);
                          }}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Modifier
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteJob(job.id, job.title);
                          }}
                          disabled={isDeletingJob === job.id}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeletingJob === job.id ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-1" />
                          )}
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Message si aucun résultat */}
              {sortedJobs.length === 0 && !loading && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Aucune mission trouvée
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Aucune mission ne correspond à vos critères de recherche.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({ type: '', location: '', salary: '' });
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}

              {/* Pagination - Style amélioré */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors`}
                        />
                      </PaginationItem>
                      
                      {[...Array(Math.min(totalPages, 10))].map((_, index) => {
                        const page = index + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className={`cursor-pointer transition-colors ${
                                currentPage === page 
                                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                          className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionsPage;
