// src/components/AboutPage.jsx - Version Modern UI/UX Mobile First
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Users, Briefcase, TrendingUp, Award, Heart, Zap, Shield, Globe, ChevronRight, Mail, Phone, MapPin, Sparkles, CheckCircle } from 'lucide-react';

const AboutPage = ({ darkMode = false }) => {
  const [activeValue, setActiveValue] = useState(0);

  const theme = {
    pageBg: darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50',
    headerBg: darkMode ? 'bg-gray-900/50 backdrop-blur-lg' : 'bg-white/70 backdrop-blur-lg',
    cardBg: darkMode ? 'bg-gray-800/50 backdrop-blur' : 'bg-white/80 backdrop-blur',
    cardHover: darkMode ? 'hover:bg-gray-700/60' : 'hover:bg-white',
    textPrimary: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
    textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
    borderLight: darkMode ? 'border-gray-700/50' : 'border-gray-200/50',
    gradientText: 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
  };

  const values = [
    {
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
      title: 'Transparence',
      description: 'Des tarifs clairs, des missions détaillées, et une communication directe.',
      details: 'Nous croyons que la confiance se construit sur la transparence. Chaque mission est présentée avec tous ses détails.'
    },
    {
      icon: Award,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
      title: 'Excellence',
      description: 'Nous sélectionnons les meilleures missions pour votre évolution.',
      details: 'Chaque opportunité est évaluée pour garantir qu\'elle apporte une vraie valeur à votre carrière.'
    },
    {
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      title: 'Communauté',
      description: 'Un écosystème bienveillant pour collaborer et grandir ensemble.',
      details: 'Rejoignez une communauté de professionnels passionnés qui partagent vos valeurs et ambitions.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Missions actives', icon: Briefcase, gradient: 'from-blue-500 to-blue-600' },
    { number: '1.2k+', label: 'Freelances', icon: Users, gradient: 'from-purple-500 to-purple-600' },
    { number: '150+', label: 'Entreprises', icon: Globe, gradient: 'from-green-500 to-green-600' },
    { number: '95%', label: 'Satisfaction', icon: Sparkles, gradient: 'from-orange-500 to-orange-600' },
  ];

  const features = [
    { icon: Zap, title: 'Matching rapide', desc: 'Trouvez la mission idéale en quelques clics' },
    { icon: Shield, title: 'Paiements sécurisés', desc: 'Garantie de paiement pour chaque mission' },
    { icon: TrendingUp, title: 'Évolution continue', desc: 'Des missions qui font progresser votre carrière' },
  ];

  return (
    <div className={`min-h-screen ${theme.pageBg}`}>
      {/* Hero Section Mobile First */}
      <div className={`${theme.headerBg} ${theme.borderLight} border-b sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Retour
          </Link>
        </div>
      </div>

      {/* Hero animé */}
      <section className="relative overflow-hidden px-4 pt-12 pb-20 sm:pt-20 sm:pb-32">
        {/* Effet de fond animé */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold ${theme.textPrimary} mb-6 animate-fade-in`}>
            Bienvenue sur<br/>
            <span className={theme.gradientText}>Ma Nouvelle Mission</span>
          </h1>
          <p className={`text-lg sm:text-xl ${theme.textSecondary} max-w-2xl mx-auto mb-8 animate-fade-in-delay`}>
            La plateforme qui révolutionne le freelancing en France. 
            Connectez-vous aux meilleures opportunités.
          </p>
          <Link
            to="/missions"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-bounce-light"
          >
            Découvrir les missions
            <ChevronRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Stats Section - Mobile optimized */}
      <section className="px-4 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`${theme.cardBg} rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl cursor-pointer`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`text-2xl sm:text-3xl font-bold ${theme.textPrimary} mb-1`}>
                  {stat.number}
                </div>
                <p className={`text-sm ${theme.textMuted}`}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section - Interactive */}
      <section className="px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className={`${theme.cardBg} rounded-3xl p-8 sm:p-12 shadow-2xl`}>
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                <Target className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className={`text-3xl sm:text-4xl font-bold ${theme.textPrimary} text-center mb-6`}>
              Notre Mission
            </h2>
            <p className={`${theme.textSecondary} text-lg leading-relaxed text-center mb-8`}>
              Transformer le monde du freelancing en créant des connexions authentiques 
              entre talents et entreprises. Nous facilitons chaque étape pour que vous 
              puissiez vous concentrer sur ce qui compte vraiment : votre expertise.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 mt-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`text-center p-4 rounded-xl ${theme.cardBg} ${theme.cardHover} transition-all duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className={`font-semibold ${theme.textPrimary} mb-2`}>{feature.title}</h3>
                  <p className={`text-sm ${theme.textMuted}`}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - Interactive Mobile */}
      <section className="px-4 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl font-bold ${theme.textPrimary} text-center mb-12`}>
            Nos Valeurs
          </h2>
          
          {/* Mobile: Swipeable cards */}
          <div className="sm:hidden">
            <div className="relative">
              <div className={`${theme.cardBg} rounded-2xl p-6 shadow-xl`}>
                <div className={`w-16 h-16 ${values[activeValue].bgColor} rounded-2xl flex items-center justify-center mb-4`}>
                  {React.createElement(values[activeValue].icon, { 
                    className: `w-8 h-8 ${values[activeValue].color}` 
                  })}
                </div>
                <h3 className={`text-2xl font-bold ${theme.textPrimary} mb-3`}>
                  {values[activeValue].title}
                </h3>
                <p className={`${theme.textSecondary} mb-4`}>
                  {values[activeValue].description}
                </p>
                <p className={`text-sm ${theme.textMuted}`}>
                  {values[activeValue].details}
                </p>
              </div>
              
              {/* Dots indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {values.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveValue(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === activeValue 
                        ? 'w-8 bg-blue-600' 
                        : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className={`${theme.cardBg} rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer`}
              >
                <div className={`w-16 h-16 ${value.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
                  <value.icon className={`w-8 h-8 ${value.color}`} />
                </div>
                <h3 className={`text-2xl font-bold ${theme.textPrimary} mb-3`}>
                  {value.title}
                </h3>
                <p className={`${theme.textSecondary} mb-4`}>
                  {value.description}
                </p>
                <p className={`text-sm ${theme.textMuted}`}>
                  {value.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className={`relative ${theme.cardBg} rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden`}>
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl"></div>
            
            <h2 className={`text-3xl sm:text-4xl font-bold ${theme.textPrimary} mb-6`}>
              L'équipe derrière la magie
            </h2>
            <p className={`${theme.textSecondary} text-lg leading-relaxed mb-6`}>
              <span className="font-semibold text-blue-600">Ma Nouvelle Mission</span> est propulsée par 
              <span className="font-semibold"> Get in Talent</span>, expert du recrutement IT depuis plus de 10 ans.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <p className={theme.textSecondary}>
                  Une équipe passionnée par l'innovation et le matching de talents
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <p className={theme.textSecondary}>
                  Plus de 1000 missions réussies à notre actif
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <p className={theme.textSecondary}>
                  Un réseau de partenaires dans toute la France
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-3xl sm:text-4xl font-bold ${theme.textPrimary} mb-6`}>
            Prêt à trouver votre prochaine mission ?
          </h2>
          <p className={`${theme.textSecondary} text-lg mb-8 max-w-2xl mx-auto`}>
            Rejoignez des milliers de freelances qui ont déjà trouvé leur mission idéale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/missions"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Voir les missions
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
            <a
              href="mailto:hello@manouvellemission.com"
              className={`inline-flex items-center justify-center px-8 py-4 border-2 ${darkMode ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'} ${theme.textPrimary} font-semibold rounded-full transition-all duration-300`}
            >
              <Mail className="mr-2 w-5 h-5" />
              Nous contacter
            </a>
          </div>

          {/* Contact info */}
          <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center text-sm">
            <a href="tel:+33972328994" className={`flex items-center justify-center gap-2 ${theme.textMuted} hover:text-blue-600 transition-colors`}>
              <Phone className="w-4 h-4" />
              +33 9 72 32 89 94
            </a>
            <a href="mailto:hello@manouvellemission.com" className={`flex items-center justify-center gap-2 ${theme.textMuted} hover:text-blue-600 transition-colors`}>
              <Mail className="w-4 h-4" />
              hello@manouvellemission.com
            </a>
            <span className={`flex items-center justify-center gap-2 ${theme.textMuted}`}>
              <MapPin className="w-4 h-4" />
              Paris, France
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
