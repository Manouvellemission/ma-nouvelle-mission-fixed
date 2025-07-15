// src/components/ui/AdefreePage.jsx - Page "Outils freelance Adefree"
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Menu, X, Moon, Sun, ArrowRight, CheckCircle, Star, 
  Users, TrendingUp, Zap, Target, Euro, Calculator, 
  ChevronDown, ChevronUp, Send, Building, Mail, Phone,
  Sparkles, BarChart3, Award, Check, Edit2, Clock,
  FileText, CreditCard, Bell, Shield, Smartphone, Globe,
  Play, AlertCircle, ExternalLink, PlusCircle, Activity
} from 'lucide-react';

const AdefreePage = ({ darkMode: propDarkMode }) => {
  // États pour l'UI
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('copilote');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [darkMode, setDarkMode] = useState(propDarkMode || false);

  // États pour le formulaire
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    plan: 'copilote',
    message: '',
    currentTool: '',
    needsDemo: false
  });

  // Fonction pour basculer le mode sombre
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
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

  // Rotation automatique des features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Données pour les sections
  const heroFeatures = [
    {
      icon: <Calculator className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      title: "Calculateur TJM",
      description: "Trouvez votre tarif optimal en 30 secondes"
    },
    {
      icon: <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />,
      title: "Facturation automatisée",
      description: "Créez et envoyez vos factures en 1 clic"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
      title: "Dashboard temps réel",
      description: "Suivez votre CA, charges et trésorerie"
    },
    {
      icon: <Bell className="w-8 h-8 text-orange-600 dark:text-orange-400" />,
      title: "Relances intelligentes",
      description: "Fini les impayés avec nos relances auto"
    }
  ];

  const mainFeatures = [
    {
      icon: <Calculator className="w-12 h-12 text-blue-600 dark:text-blue-400" />,
      title: "Calculateur TJM Intelligent",
      description: "Basé sur les données de +1000 freelances actifs. Compare tous les statuts juridiques et visualise ton revenu net instantanément.",
      benefits: [
        "Données actualisées chaque trimestre",
        "Comparaison AE, SASU, EURL, portage",
        "Fourchettes sectorielles précises",
        "Simulation revenus nets"
      ],
      cta: "Calculer mon TJM",
      link: "https://tjmfreelance.com/"
    },
    {
      icon: <FileText className="w-12 h-12 text-green-600 dark:text-green-400" />,
      title: "Facturation & Devis Pro",
      description: "Créez des factures conformes en 1 clic. Relances automatiques, suivi des paiements et tableaux de bord intégrés.",
      benefits: [
        "Templates optimisés",
        "Mentions légales automatiques",
        "Relances intelligentes",
        "Facture envoyée en 2 clics"
      ],
      cta: "Essayer gratuitement",
      link: "https://adefree.com"
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-purple-600 dark:text-purple-400" />,
      title: "Dashboard & Analytics",
      description: "Pilotez votre activité avec des indicateurs temps réel : CA, trésorerie, rentabilité client, prévisionnel.",
      benefits: [
        "Suivi CA en temps réel",
        "Analyse de rentabilité",
        "Prévisionnel de trésorerie",
        "KPIs personnalisés"
      ],
      cta: "Voir la demo",
      link: "https://adefree.com"
    },
    {
      icon: <Clock className="w-12 h-12 text-orange-600 dark:text-orange-400" />,
      title: "Conformité",
      description: "Conformité légale, restez toujours à jours administrativement.",
      benefits: [
        "Kbis, Ursaff",
        "Contrat, RC Pro",
        "Gestion sécurisée",
        "Rappels automatiques"
      ],
      cta: "Découvrir",
      link: "https://adefree.com"
    }
  ];

  const pricingPlans = [
    {
      id: 'free',
      name: 'Indépendant',
      price: '0€',
      period: 'HT/mois',
      description: 'Idéal pour débuter en freelance',
      tagline: `Ton 1er assistant, gratuit. Parce que la liberté commence par l'essentiel.`,      
      features: [
        'Tes factures faites et envoyées en 2 clics',
        'Gestion clients simplifiée',
        'Mentions légales automatiques',
        'Support email'
      ],
      popular: false,
      color: 'gray',
      cta: 'Démarrer Gratuitement',
      trial: '30 JOURS d\'essai GRATUIT'
    },
    {
      id: 'copilote',
      name: 'Copilote',
      price: '5€',
      period: 'HT/mois',
      description: 'La solution complète pour les freelances actifs',
      tagline: 'Le minimum pour être au maximum. Tout sauf Basique, Simple.',
      features: [
        'Un simulateur intelligent pour choisir ton statut, ton TJM et ton revenu net',
        'Une gestion documentaire automatisée (Kbis, URSSAF, RC Pro, Contrat...)',
        'Une facturation fluide, automatique et sans efforts',
        'Toutes les fonctionnalités Indépendant'
      ],
      popular: true,
      color: 'blue',
      cta: 'Essayer Copilote',
      trial: '30 JOURS d\'essai GRATUIT'
    },
    {
      id: 'maitre',
      name: 'Maître de l\'admin',
      price: '20€',
      period: 'HT/mois',
      description: 'L\'automatisation totale pour les indépendants exigeants',
      tagline: 'Tu travailles de ton côté. Adefree orchestre. Et tout devient Simple, Basique.',
      features: [
        'Relances clients automatiques, factures réglées, le cash qui rentre',
        'Tableau de bord prédictif : trésorerie, URSSAF, TVA, échéances',
        'Suivi de missions & contrats intégré (mini CRM)',
        'Archivage intelligent, conformité garantie, zéro oubli',
        'Rappels malins, alertes intelligentes, zéro charge mentale'
      ],
      popular: false,
      color: 'purple',
      cta: 'Essayer gratuitement',
      trial: '30 JOURS d\'essai GRATUIT'
    }
  ];

  const stats = [
    { number: '50+', label: 'Freelances actifs', icon: <Users className="w-6 h-6" /> },
    { number: '5h', label: 'Économisées/semaine', icon: <Clock className="w-6 h-6" /> },
    { number: '30%', label: 'Revenus optimisés', icon: <TrendingUp className="w-6 h-6" /> },
    { number: '99.9%', label: 'Disponibilité', icon: <Shield className="w-6 h-6" /> }
  ];

  const testimonials = [
    {
      name: "Sophie M",
      role: "Développeuse React",
      avatar: "SM",
      content: "Adefree m'a fait gagner 5h par semaine sur ma gestion. Le calculateur TJM m'a permis d'augmenter mes tarifs de 20% !",
      rating: 5
    },
    {
      name: "Thomas D", 
      role: "Designer UX/UI",
      avatar: "TD",
      content: "Interface ultra intuitive et fonctionnalités parfaites pour freelances. Les relances automatiques ont divisé mes impayés par 3.",
      rating: 5
    },
    {
      name: "Marie R",
      role: "Consultante Marketing",
      avatar: "MR", 
      content: "Le dashboard temps réel est un game-changer. Je pilote enfin mon activité avec de vrais indicateurs !",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "Le calculateur TJM est-il vraiment gratuit ?",
      answer: "Oui, le calculateur TJM est 100% gratuit et ne nécessite aucune inscription. Vous pouvez l'utiliser autant de fois que vous le souhaitez."
    },
    {
      question: "Puis-je essayer Adefree gratuitement ?",
      answer: "Absolument ! Nous offrons 30 jours d'essai gratuit pour tester toutes les fonctionnalités premium."
    },
    {
      question: "Adefree est-il conforme à la législation française ?",
      answer: "Oui, Adefree intègre automatiquement toutes les mentions légales obligatoires et est certifié conforme à la loi anti-fraude TVA."
    },
    {
      question: "À qui s'adresse Adefree ?",
      answer: "Adefree s’adresse à tous les indépendants qui veulent gagner du temps, réduire leur charge mentale, et automatiser leur gestion administrative sans prise de tête."
    },
    {
      question: "Y a-t-il des frais cachés ?",
      answer: "Aucun frais caché ! Le prix affiché est le prix final. Pas de commission sur les paiements, pas de frais de setup."
    },
    {
      question: "Puis-je annuler mon abonnement à tout moment ?",
      answer: "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace client. Aucun engagement de durée."
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
      formData.append('form-name', 'adefree-contact');
      
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
        text: '✅ Votre demande a été envoyée ! Nous vous recontacterons sous 24h pour votre démo personnalisée.'
      });

      // Réinitialiser le formulaire
      setContactForm({
        name: '',
        email: '',
        company: '',
        phone: '',
        plan: selectedPlan,
        message: '',
        currentTool: '',
        needsDemo: false
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
  const openContactForm = (planId = 'copilote') => {
    setSelectedPlan(planId);
    setContactForm(prev => ({ ...prev, plan: planId }));
    setShowContactForm(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        
        {/* Formulaire caché pour Netlify */}
        <form name="adefree-contact" netlify netlify-honeypot="bot-field" hidden>
          <input type="text" name="name" />
          <input type="email" name="email" />
          <input type="text" name="company" />
          <input type="tel" name="phone" />
          <input type="text" name="plan" />
          <textarea name="message"></textarea>
          <input type="text" name="currentTool" />
          <input type="checkbox" name="needsDemo" />
        </form>

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
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
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
                <Link to="/post-job" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Publier
                </Link>
                <Link to="/outils-freelance" className="text-blue-600 dark:text-blue-400 font-medium">
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

                {/* CTA Header */}
                <a
                  href="https://tjmfreelance.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Calculer mon TJM
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
                  className="block px-3 py-2 text-blue-600 dark:text-blue-400 font-medium"
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
                <a
                  href="https://tjmfreelance.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Calculer mon TJM
                </a>
              </div>
            </div>
          )}
        </header>

        {/* Contenu principal */}
        <main className="flex-1">
          
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-800 dark:via-purple-800 dark:to-blue-900">
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Badge */}
            <div className="relative z-10 text-center pt-8">
              <div className="inline-flex items-center px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Outil officiel de Ma Nouvelle Mission
              </div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Contenu gauche */}
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
                    Gérez vos missions
                    <span className="block text-yellow-300">comme un pro</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-blue-100 mb-8 animate-fade-in animation-delay-200">
                    Calculateur TJM, facturation automatisée, dashboard temps réel. 
                    L'outil de gestion préféré des freelances.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in animation-delay-400">
                    <a
                      href="https://tjmfreelance.adefree.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all hover:scale-105 shadow-lg"
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      Calculer mon TJM
                    </a>
                    <button
                      onClick={() => openContactForm()}
                      className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all hover:scale-105"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Voir la démo
                    </button>
                  </div>
                </div>

                {/* Features animées à droite */}
                <div className="hidden lg:block">
                  <div className="relative">
                    {heroFeatures.map((feature, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-500 ${
                          activeFeature === index ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
                        }`}
                      >
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                          <div className="flex items-center mb-4">
                            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                              {feature.icon}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                              <p className="text-blue-100">{feature.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section statistiques */}
          <section className="py-16 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="text-center animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.number}</div>
                    <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section fonctionnalités principales */}
          <section className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Tout ce dont vous avez besoin
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Une suite d'outils pensée pour optimiser votre activité freelance et augmenter vos revenus
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {mainFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start mb-6">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      {feature.benefits.map((benefit, bIndex) => (
                        <div key={bIndex} className="flex items-center">
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <a
                      href={feature.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {feature.cta}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section témoignages */}
          <section className="py-20 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Ils nous font confiance
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Rejoignez plus de 1000 freelances qui optimisent leur activité avec Adefree
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 animate-fade-in"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                        <div className="text-gray-600 dark:text-gray-300 text-sm">{testimonial.role}</div>
                      </div>
                      <div className="ml-auto flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 italic">
                      "{testimonial.content}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section pricing */}
          <section className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Choisissez votre plan
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Commencez gratuitement avec Indépendant, évoluez vers Copilote quand vous êtes prêt
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {pricingPlans.map((plan, index) => (
                  <div
                    key={plan.id}
                    className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in ${
                      plan.popular ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
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
                        <div className="flex items-baseline justify-center mb-4">
                          <span className="text-4xl font-bold text-gray-900 dark:text-white">
                            {plan.price}
                          </span>
                          <span className="text-gray-600 dark:text-gray-300 ml-2">
                            {plan.period}
                          </span>
                        </div>
                        {plan.tagline && (
                          <p className="text-sm italic text-gray-600 dark:text-gray-400 mb-4">
                            {plan.tagline}
                          </p>
                        )}
                        {plan.trial && (
                          <div className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                            {plan.trial}
                          </div>
                        )}
                      </div>
                      
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start">
                            <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                    <button
                      onClick={() => window.open('https://adefree.com/inscription', '_blank')}
                      className={`w-full py-3 rounded-xl font-semibold transition-all hover:scale-105 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {plan.cta}
                    </button>
                    </div>
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
                  Tout ce que vous devez savoir sur Adefree
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
                Prêt à optimiser votre activité freelance ?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Rejoignez plus de 50 freelances qui ont boosté leurs revenus avec Adefree
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://tjmfreelance.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all hover:scale-105 shadow-lg"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculer mon TJM gratuit
                </a>
                <a
                  href="https://adefree.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all hover:scale-105"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Essai gratuit 30 jours
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
                  Trouvez vos missions sur Ma Nouvelle Mission, gérez-les avec Adefree. 
                  L'écosystème complet pour les freelances qui réussissent.
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
                    <Link to="/post-job" className="text-gray-300 hover:text-white transition-colors">
                      Publier
                    </Link>
                  </li>
                  <li>
                    <Link to="/outils-freelance" className="text-white font-medium">
                      Outils Adefree
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Outils Adefree */}
              <div>
                <h3 className="text-lg font-semibold mb-6">Adefree</h3>
                <ul className="space-y-3">
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
                      href="https://adefree.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors flex items-center"
                    >
                      Plateforme complète
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </li>
                  <li>
                    <a href="mailto:hello@getintalent.fr" className="text-gray-300 hover:text-white transition-colors">
                      Support
                    </a>
                  </li>
                </ul>
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

        {/* Modal de formulaire de contact */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header fixe */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Demander une démo Adefree
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
                      <strong>Démo personnalisée :</strong> Nous vous présenterons Adefree en fonction de vos besoins spécifiques et vous aiderons à optimiser votre gestion freelance.
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
                          Activité freelance
                        </label>
                        <input
                          type="text"
                          value={contactForm.company}
                          onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                          placeholder="ex: Développeur React, Designer UX..."
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                        Plan qui vous intéresse
                      </label>
                      <select
                        value={contactForm.plan}
                        onChange={(e) => setContactForm({...contactForm, plan: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="free">Gratuit - Pour commencer</option>
                        <option value="standard">Copilote - 5€ HT/mois (Recommandé)</option>
                        <option value="premium">Maître de l'admin - 20€ HT/mois</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Outil actuel (optionnel)
                      </label>
                      <input
                        type="text"
                        value={contactForm.currentTool}
                        onChange={(e) => setContactForm({...contactForm, currentTool: e.target.value})}
                        placeholder="ex: Excel, du papier, aucun..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message
                      </label>
                      <textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        rows={4}
                        placeholder="Décrivez vos besoins, questions ou difficultés actuelles..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="needsDemo"
                        checked={contactForm.needsDemo}
                        onChange={(e) => setContactForm({...contactForm, needsDemo: e.target.checked})}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="needsDemo" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Je souhaite une démo personnalisée en visioconférence
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
                            Demander ma démo
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

export default AdefreePage;
