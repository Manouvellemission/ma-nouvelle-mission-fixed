import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, MapPin, Euro, Briefcase, CheckCircle, Users, Calendar } from 'lucide-react';
import { jobService } from '../../services/jobService';

const MissionDetailPageTest = ({ darkMode }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger la mission par slug
  useEffect(() => {
    const fetchJobBySlug = async () => {
      console.log('🔍 Recherche de la mission avec slug:', slug);
      setLoading(true);
      try {
        // Pour le test, on va chercher toutes les missions et filtrer par slug
        const jobs = await jobService.fetchJobs();
        console.log('📋 Jobs récupérés:', jobs.length);
        
        const foundJob = jobs.find(j => j.slug === slug);
        console.log('✅ Mission trouvée:', foundJob);
        
        if (foundJob) {
          setJob(foundJob);
        } else {
          setError('Mission introuvable');
        }
      } catch (err) {
        setError('Erreur lors du chargement de la mission');
        console.error('❌ Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchJobBySlug();
    }
  }, [slug]);

  // État de chargement
  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Chargement de la mission...</p>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error || !job) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {error || 'Mission introuvable'}
          </h2>
          <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            La mission que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Link 
            to="/missions"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux missions
          </Link>
        </div>
      </div>
    );
  }

  // Affichage de la mission
  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Navigation */}
          <Link 
            to="/missions"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux missions
          </Link>
          
          {/* TEST - Debug info */}
          <div className="bg-yellow-100 dark:bg-yellow-900 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
              🧪 Mode TEST - Page mission individuelle
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Slug: {slug} | ID: {job.id} | Title: {job.title}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* En-tête de la mission */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                {job.featured && (
                  <div className="flex items-center mb-4">
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium">
                      ⭐ Mission en vedette
                    </span>
                  </div>
                )}
                
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {job.title}
                </h1>
                
                <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-300 mb-6">
                  <div className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    <span>{job.type}</span>
                  </div>
                </div>
                
                <div className="flex items-center text-2xl font-bold text-green-600 dark:text-green-400">
                  <Euro className="w-6 h-6 mr-2" />
                  <span>{job.salary} {job.salary_type}</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Description du poste
                </h2>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {/* Exigences */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Exigences du poste
                  </h2>
                  <ul className="space-y-3">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Avantages */}
              {job.benefits && job.benefits.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Avantages
                  </h2>
                  <ul className="space-y-3">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Informations
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Building className="w-5 h-5 mr-3" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin className="w-5 h-5 mr-3" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Users className="w-5 h-5 mr-3" />
                    <span>{job.applicants || 0} candidature(s)</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Calendar className="w-5 h-5 mr-3" />
                    <span>Publié le {new Date(job.posted_date).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 Pour le moment, utilisez le bouton "Postuler" sur la page des missions pour candidater.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionDetailPageTest;
