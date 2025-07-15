// src/components/ui/PostJobPage.jsx - Page "Postez votre annonce" (VERSION CORRIGÉE SANS ERREURS)
import React, { useState, useEffect, useContext, createContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Menu, X, Moon, Sun, ArrowRight, CheckCircle, Star, 
  Users, TrendingUp, Zap, Target, Euro, 
  ChevronDown, ChevronUp, Send, Building, Mail, Phone,
  Sparkles, BarChart3, Award, Check, Edit2,
  LogIn, LogOut, Plus
} from 'lucide-react';

// Mock du ThemeContext pour cette page (sera remplacé par le vrai contexte)
const ThemeContext = createContext();

const PostJobPage = ({ darkMode: propDarkMode }) => {
  // États pour l'UI
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(propDarkMode || false);

  // États pour le formulaire
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    plan: 'standard',
    message: '',
    needsHelp: false
  });

  // Fonction pour basculer le mode sombre
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Dans la vraie implémentation, ceci sera géré par le ThemeContext
  };

  // Synchro avec la prop darkMode
  useEffect(() => {
    setDarkMode(propDarkMode);
  }, [propDarkMode]);

  // Effet pour masquer les messages après 5 secondes
  useEffect(() => {
    if (submitMessage) {
      const timer = setTimeout(() => {
        setSubmitMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitMessage]);

  // Données pour les sections
  const valuePropositions = [
    {
      icon: <Euro className="w-8 h-8 text-green-600 dark:text-green-400" />,
      title: "93% moins cher",
      description: "Que les sites d'emploi traditionnels. Publiez à partir de 9€ HT seulement.",
      badge: "Économies"
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      title: "Candidats qualifiés",
      description: "Accédez à notre base de talents IT, développeurs et freelances experts.",
      badge: "Qualité"
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
      title: "Publication instantanée",
      description: "Votre annonce en ligne en moins de 24h, validation rapide et efficace.",
      badge: "Rapidité"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />,
      title: "Visibilité optimisée",
      description: "SEO optimisé, réseaux sociaux, newsletters pour maximiser la portée.",
      badge: "Performance"
    }
  ];

  const pricingPlans = [
    {
      id: 'basic',
      name: 'Basique',
      price: '9€',
      period: 'HT/mois',
      description: 'Parfait pour commencer',
      features: [
        '1 annonce active',
        'Publication 30 jours',
        'Support email',
        'Statistiques de base'
      ],
      popular: false,
      color: 'blue'
    },
    {
      id: 'standard',
      name: 'Standard',
      price: '19€',
      period: 'HT/mois',
      description: 'Le plus populaire',
      features: [
        '3 annonces actives',
        'Publication 60 jours',
        'Mise en avant',
        'Support prioritaire',
        'Statistiques avancées',
        'Badge "Entreprise vérifiée"'
      ],
      popular: true,
      color: 'purple'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '49€',
      period: 'HT/mois',
      description: 'Pour les entreprises actives',
      features: [
        'Annonces illimitées',
        'Publication 90 jours',
        'Mise en avant premium',
        'Support téléphonique',
        'Analytics détaillés',
        'Badge "Partenaire privilégié"',
        'Accès anticipé aux candidats',
        'Gestionnaire de compte dédié'
      ],
      popular: false,
      color: 'emerald'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Choisissez votre plan',
      description: 'Sélectionnez l\'offre qui correspond à vos besoins de recrutement.',
      icon: <Target className="w-6 h-6" />
    },
    {
      number: '02', 
      title: 'Rédigez votre annonce',
      description: 'Décrivez votre mission avec notre éditeur intuitif et nos conseils.',
      icon: <Edit2 className="w-6 h-6" />
    },
    {
      number: '03',
      title: 'Recevez des candidatures',
      description: 'Votre annonce est publiée et vous recevez les CV par email.',
      icon: <Users className="w-6 h-6" />
    }
  ];

  const faqs = [
    {
      question: "Combien de temps faut-il pour publier mon annonce ?",
      answer: "Votre annonce est généralement validée et publiée sous 24h ouvrées. Pour les comptes Premium, la validation est prioritaire et peut être effectuée en quelques heures."
    },
    {
      question: "Puis-je modifier mon annonce après publication ?",
      answer: "Oui, vous pouvez modifier votre annonce à tout moment depuis votre espace client. Les modifications sont appliquées immédiatement sans frais supplémentaires."
    },
    {
      question: "Comment sont sélectionnés les candidats ?",
      answer: "Notre plateforme attire principalement des développeurs, freelances IT et professionnels du numérique qualifiés. Nous filtrons les candidatures pour vous garantir la meilleure qualité."
    },
    {
      question: "Y a-t-il un engagement de durée ?",
      answer: "Non, nos formules sont sans engagement. Vous pouvez suspendre ou arrêter votre abonnement à tout moment. Seule la période en cours reste due."
    },
    {
      question: "Que se passe-t-il si je ne trouve pas le bon candidat ?",
      answer: "Nous vous accompagnons dans l'optimisation de votre annonce. Si besoin, nous pouvons également vous proposer nos services de recrutement personnalisés."
    },
    {
      question: "Puis-je passer d'un plan à un autre ?",
      answer: "Oui, vous pouvez changer de plan à tout moment. La différence de prix sera calculée au prorata pour la période restante."
    }
  ];

  // Fonction pour gérer la soumission du formulaire
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Créer FormData pour Netlify
      const formData = new FormData();
      formData.append('form-name', 'company-contact');
      
      // Ajouter tous les champs
      Object.keys(contactForm).forEach(key => {
        formData.append(key, contactForm[key]);
      });

      // Envoyer à Netlify Forms
      const response = await fetch('/', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du formulaire');
      }

      setSubmitMessage({
        type: 'success',
        text: '✅ Votre demande a été envoyée avec succès ! Nous vous recontacterons sous 24h.'
      });

      // Réinitialiser le formulaire
      setContactForm({
        name: '',
        email: '',
        company: '',
        phone: '',
        plan: selectedPlan,
        message: '',
        needsHelp: false
      });

      // Fermer le modal après 2 secondes
      setTimeout(() => {
        setShowContactForm(false);
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      setSubmitMessage({
        type: 'error',
        text: '❌ Erreur lors de l\'envoi. Veuillez réessayer ou nous contacter directement.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour ouvrir le formulaire avec un plan présélectionné
  const openContactForm = (planId = 'standard') => {
    setSelectedPlan(planId);
    setContactForm(prev => ({ ...prev, plan: planId }));
    setShowContactForm(true);
  };

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
                <X className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p>{submitMessage.text}</p>
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
                <Link to="/post-job" className="text-blue-600 dark:text-blue-400 font-medium">
                  Publier
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

                {/* CTA Header */}
                <button
                  onClick={() => openContactForm()}
                  className="hidden md:flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Publier une annonce
                </button>

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
                  className="block px-3 py-2 text-blue-600 dark:text-blue-400 font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Publier
                </Link>
                <Link
                  to="/about"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  À propos
                </Link>
                <button
                  onClick={() => {
                    openContactForm();
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  Publier une annonce
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Contenu principal */}
        <main className="flex-1">
          
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-800 dark:via-purple-800 dark:to-blue-900">
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Badge offre de lancement */}
            <div className="relative z-10 text-center pt-8">
              <div className="inline-flex items-center px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full text-sm font-medium animate-pulse">
                <Sparkles className="w-4 h-4 mr-2" />
                Offre de lancement - Jusqu'à -50% !
              </div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
                  Postez votre
                  <span className="block text-yellow-300">annonce</span>
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto animate-fade-in animation-delay-200">
                  Trouvez les meilleurs talents IT et freelances. Publication en 24h, tarifs transparents, candidats qualifiés.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-400">
                  <button
                    onClick={() => openContactForm()}
                    className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all hover:scale-105 shadow-lg"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Publier maintenant
                  </button>
                  <a
                    href="#pricing"
                    className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all hover:scale-105"
                  >
                    <Euro className="w-5 h-5 mr-2" />
                    Voir les tarifs
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Section proposition de valeur */}
          <section className="py-20 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Pourquoi choisir Ma Nouvelle Mission ?
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  La solution de recrutement moderne, efficace et abordable pour votre entreprise
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {valuePropositions.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center mr-4 shadow-md">
                        {item.icon}
                      </div>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section comparaison de prix */}
          <section className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center justify-center mb-6">
                  <Award className="w-12 h-12 text-yellow-500 mr-4" />
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    93% moins cher que la concurrence
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">€€€€</div>
                    <div className="text-gray-600 dark:text-gray-300 mb-2">Sites traditionnels</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">300-800€/mois</div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">€</div>
                    <div className="text-gray-600 dark:text-gray-300 mb-2">Ma Nouvelle Mission</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">À partir de 9€/mois</div>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Même qualité de service, mêmes fonctionnalités, mais à une fraction du prix. 
                  Investissez votre budget dans ce qui compte vraiment : votre équipe.
                </p>
              </div>
            </div>
          </section>

          {/* Section grille tarifaire */}
          <section id="pricing" className="py-20 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Tarifs transparents
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Sans engagement, sans frais cachés. Choisissez la formule qui correspond à vos besoins.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {pricingPlans.map((plan, index) => (
                  <div
                    key={plan.id}
                    className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in ${
                      plan.popular ? 'ring-2 ring-purple-500 dark:ring-purple-400' : ''
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          Le plus populaire
                        </span>
                      </div>
                    )}
                    
                    <div className="p-8">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {plan.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {plan.description}
                        </p>
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold text-gray-900 dark:text-white">
                            {plan.price}
                          </span>
                          <span className="text-gray-600 dark:text-gray-300 ml-2">
                            {plan.period}
                          </span>
                        </div>
                      </div>
                      
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-center">
                            <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <button
                        onClick={() => openContactForm(plan.id)}
                        className={`w-full py-3 rounded-xl font-semibold transition-all hover:scale-105 ${
                          plan.popular
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        Choisir ce plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  * Tarifs HT. Facturation mensuelle sans engagement.
                </p>
                <button
                  onClick={() => openContactForm('custom')}
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Besoin d'une offre sur mesure ?
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </section>

          {/* Section Comment ça marche */}
          <section className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Comment ça marche ?
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Publier votre annonce n'a jamais été aussi simple. En 3 étapes seulement.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="text-center animate-fade-in relative"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                        {step.number}
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                        {step.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {step.description}
                    </p>
                    
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-full w-full">
                        <ArrowRight className="w-6 h-6 text-gray-400 mx-auto" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section FAQ */}
          <section className="py-20 bg-white dark:bg-gray-800">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Questions fréquentes
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Tout ce que vous devez savoir sur notre service
                </p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-900 rounded-xl transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {faq.question}
                      </span>
                      {openFaqIndex === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    
                    {openFaqIndex === index && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Final */}
          <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-800 dark:via-purple-800 dark:to-blue-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Prêt à trouver vos futurs talents ?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Rejoignez les centaines d'entreprises qui nous font confiance pour leurs recrutements IT.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => openContactForm()}
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all hover:scale-105 shadow-lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Publier mon annonce
                </button>
                <a
                  href="mailto:hello@getintalent.fr"
                  className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all hover:scale-105"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Nous contacter
                </a>
              </div>
            </div>
          </section>
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
                  La plateforme de référence pour connecter les entreprises avec les meilleurs 
                  talents IT et freelances. Propulsé par Get in Talent.
                </p>
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
                    <Link to="/post-job" className="text-white font-medium">
                      Publier
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                      À propos
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-lg font-semibold mb-6">Contact</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="mailto:hello@getintalent.fr" className="text-gray-300 hover:text-white transition-colors">
                      hello@getintalent.fr
                    </a>
                  </li>
                  <li>
                    <a href="tel:+33972328994" className="text-gray-300 hover:text-white transition-colors">
                      +33 9 72 32 89 94
                    </a>
                  </li>
                  <li className="text-gray-300">Paris, France</li>
                </ul>
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

        {/* Modal de formulaire de contact */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header fixe */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Demande de publication
                  </h2>
                  <button
                    onClick={() => setShowContactForm(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Contenu scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-300 text-sm">
                      <strong>Note :</strong> Ce formulaire nous permet de vous recontacter pour finaliser la publication de votre annonce. 
                      Aucun paiement n'est requis à cette étape.
                    </p>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nom complet *
                        </label>
                        <input
                          type="text"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email professionnel *
                        </label>
                        <input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Entreprise *
                        </label>
                        <input
                          type="text"
                          value={contactForm.company}
                          onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Plan souhaité
                      </label>
                      <select
                        value={contactForm.plan}
                        onChange={(e) => setContactForm({...contactForm, plan: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="basic">Basique - 9€ HT/mois</option>
                        <option value="standard">Standard - 19€ HT/mois (Recommandé)</option>
                        <option value="premium">Premium - 49€ HT/mois</option>
                        <option value="custom">Offre sur mesure</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message
                      </label>
                      <textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        rows={4}
                        placeholder="Décrivez votre besoin, le type de profil recherché, ou toute question..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="needsHelp"
                        checked={contactForm.needsHelp}
                        onChange={(e) => setContactForm({...contactForm, needsHelp: e.target.checked})}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="needsHelp" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        J'aimerais être accompagné(e) dans la rédaction de mon annonce
                      </label>
                    </div>

                    {/* Footer avec boutons fixe */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={() => setShowContactForm(false)}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        disabled={isSubmitting}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Envoi...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Envoyer ma demande
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostJobPage;
