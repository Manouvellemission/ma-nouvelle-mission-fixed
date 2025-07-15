// src/components/ui/MissionDetailPage.jsx - Version finale avec formulaire intégré
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, MapPin, Euro, Briefcase, CheckCircle, Users, Calendar, Clock, Mail, Phone, Upload, X, ArrowRight, Loader2, ExternalLink } from 'lucide-react';
import { jobService } from '../../services/jobService';
import { Helmet } from 'react-helmet';

const MissionDetailPage = ({ darkMode }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [applicationForm, setApplicationForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    cv: null
  });

  // Charger la mission par slug
  useEffect(() => {
    const fetchJobBySlug = async () => {
      setLoading(true);
      try {
        const jobs = await jobService.fetchJobs();
        const foundJob = jobs.find(j => j.slug === slug);
        
        if (foundJob) {
          setJob(foundJob);
        } else {
          setError('Mission introuvable');
        }
      } catch (err) {
        setError('Erreur lors du chargement de la mission');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobBySlug();
  }, [slug]);

  // Gérer la soumission de candidature
  const handleApply = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('form-name', 'job-application');
      formData.append('name', applicationForm.name);
      formData.append('email', applicationForm.email);
      formData.append('phone', applicationForm.phone || '');
      formData.append('message', applicationForm.message || '');
      formData.append('jobTitle', job.title);
      formData.append('company', job.company);
      formData.append('location', job.location);
      
      if (applicationForm.cv) {
        formData.append('cv', applicationForm.cv);
      }

      const netlifyResponse = await fetch('/', {
        method: 'POST',
        body: formData
      });

      if (!netlifyResponse.ok) {
        throw new Error('Erreur lors de l\'envoi du formulaire');
      }

      // Incrémenter le compteur de candidatures
      await jobService.incrementApplicants(job.id);
      
      setSubmitMessage({
        type: 'success',
        text: '✅ Candidature envoyée avec succès !'
      });
      
      setShowApplicationForm(false);
      setApplicationForm({ name: '', email: '', phone: '', message: '', cv: null });
      
      // Rafraîchir les données
      const jobs = await jobService.fetchJobs();
      const updatedJob = jobs.find(j => j.id === job.id);
      if (updatedJob) {
        setJob(updatedJob);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      setSubmitMessage({
        type: 'error',
        text: '❌ Erreur lors de l\'envoi de la candidature'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Effacer le message après 5 secondes
  useEffect(() => {
    if (submitMessage) {
      const timer = setTimeout(() => {
        setSubmitMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitMessage]);

  // Scroll vers le formulaire
  const scrollToForm = () => {
    const formElement = document.getElementById('application-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

  if (error || !job) {
    return (
      <>
        <Helmet>
          <title>Mission introuvable - Ma Nouvelle Mission</title>
          <meta name="robots" content="noindex" />
        </Helmet>
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
      </>
    );
  }

  // Créer la description SEO (150-160 caractères)
  const seoDescription = `${job.title} chez ${job.company} à ${job.location}. ${job.salary} ${job.salary_type}. ${job.description.substring(0, 100)}...`;

  return (
    <>
      <Helmet>
        <title>{job.title} - {job.company} | Ma Nouvelle Mission</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={`${job.title} - ${job.company}`} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://manouvellemission.com/mission/${job.slug}`} />
        <link rel="canonical" href={`https://manouvellemission.com/mission/${job.slug}`} />
        
        {/* Schema.org pour les offres d'emploi */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": job.title,
            "description": job.description,
            "datePosted": job.posted_date,
            "hiringOrganization": {
              "@type": "Organization",
              "name": job.company
            },
            "jobLocation": {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": job.location,
                "addressCountry": "FR"
              }
            },
            "employmentType": job.type === "CDI" ? "FULL_TIME" : job.type === "CDD" ? "TEMPORARY" : "CONTRACTOR",
            "baseSalary": {
              "@type": "MonetaryAmount",
              "currency": "EUR",
              "value": {
                "@type": "QuantitativeValue",
                "value": job.salary,
                "unitText": job.salary_type
              }
            }
          })}
        </script>
      </Helmet>

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
                  <X className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                )}
                <p>{submitMessage.text}</p>
              </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Navigation */}
            <nav className="flex items-center text-sm mb-6" aria-label="Breadcrumb">
              <Link to="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Accueil
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <Link to="/missions" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Missions
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900 dark:text-white">{job.title}</span>
            </nav>
            
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
                  
                  <div className="flex items-center text-2xl font-bold text-green-600 dark:text-green-400 mb-6">
                    <Euro className="w-6 h-6 mr-2" />
                    <span>{job.salary} {job.salary_type}</span>
                  </div>
                  
                  <button
                    onClick={scrollToForm}
                    className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover:scale-105 shadow-lg"
                  >
                    Postuler maintenant
                  </button>
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

                {/* Formulaire de candidature */}
                <div id="application-form" className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Postuler à cette mission
                  </h2>

                  {!showApplicationForm ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Intéressé(e) par cette opportunité ? Envoyez votre candidature dès maintenant !
                      </p>
                      <button
                        onClick={() => setShowApplicationForm(true)}
                        className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover:scale-105 shadow-lg"
                      >
                        Commencer ma candidature
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApply} className="space-y-6">
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
                                className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
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

                      <div className="flex justify-end space-x-4 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowApplicationForm(false);
                            setApplicationForm({ name: '', email: '', phone: '', message: '', cv: null });
                          }}
                          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              Envoyer ma candidature
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Informations sur l'entreprise */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    À propos de l'entreprise
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
                </div>

                {/* CTA sticky */}
                <div className="sticky top-4">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                    <h3 className="text-xl font-bold mb-4">
                      Intéressé(e) par cette mission ?
                    </h3>
                    <p className="mb-6">
                      Ne manquez pas cette opportunité ! Postulez dès maintenant.
                    </p>
                    <button
                      onClick={scrollToForm}
                      className="w-full px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Postuler maintenant
                    </button>
                  </div>

                  {/* Partage */}
                  <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Partager cette mission
                    </h4>
                    <div className="flex space-x-3">
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-lg text-center hover:bg-blue-800 transition-colors"
                      >
                        LinkedIn
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(job.title + ' chez ' + job.company)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg text-center hover:bg-sky-600 transition-colors"
                      >
                        Twitter
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Missions similaires */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                Missions similaires
              </h2>
              <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <p>Fonctionnalité à venir...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MissionDetailPage;
