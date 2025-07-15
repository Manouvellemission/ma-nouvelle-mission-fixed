// src/components/ui/AboutPage.jsx - Page À propos complète
import React from 'react';
import { ArrowLeft, Users, Target, Heart, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header avec retour */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              À propos de
              <span className="block text-yellow-300">Ma Nouvelle Mission</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Votre jobboard de référence pour trouver les meilleures missions freelances 
              et connecter les freelances avec les entreprises innovantes.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Target className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Notre Mission
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Révolutionner le marché des missions freelances en créant des connexions authentiques entre 
              les freelances talentueux et les entreprises visionnaires. Nous croyons que 
              chaque carrière mérite d'être exceptionnelle.
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-blue-50 dark:bg-gray-700 rounded-2xl">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">89+</div>
              <div className="text-gray-600 dark:text-gray-300">Missions publiées</div>
            </div>
            <div className="text-center p-8 bg-purple-50 dark:bg-gray-700 rounded-2xl">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">787+</div>
              <div className="text-gray-600 dark:text-gray-300">Candidats actifs</div>
            </div>
            <div className="text-center p-8 bg-green-50 dark:bg-gray-700 rounded-2xl">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">20+</div>
              <div className="text-gray-600 dark:text-gray-300">Entreprises partenaires</div>
            </div>
          </div>
        </div>
      </div>

      {/* Valeurs Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Heart className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Nos Valeurs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Excellence</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Nous nous engageons à fournir une plateforme de qualité avec 
                des fonctionnalités innovantes et une expérience utilisateur exceptionnelle.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Innovation</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Nous adoptons les dernières technologies pour créer des solutions 
                modernes qui répondent aux besoins évolutifs des missions en freelance.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Bienveillance</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Nous plaçons l'humain au centre de nos préoccupations et créons 
                un environnement respectueux pour tous nos utilisateurs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Get in Talent Section */}
      <div className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Propulsé par Get in Talent & Adefree
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Ma Nouvelle Mission est une initiative de Get in Talent & Adefree, cabinet de conseil 
                en recrutement spécialisé dans les métiers du digital et de la tech et 
                plateforme pour la gestion administrative automatique des freelances
                Forte de plusieurs années d'expérience, notre équipe comprend les enjeux 
                du marché.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
                  <span className="text-gray-700 dark:text-gray-300">Expertise en recrutement tech</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
                  <span className="text-gray-700 dark:text-gray-300">Accompagnement personnalisé</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
                  <span className="text-gray-700 dark:text-gray-300">Réseau d'entreprises partenaires</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-8 rounded-2xl">
              <div className="text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <img 
                    src="/logo-adefree.png" 
                    alt="Adefree" 
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Adefree
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Vous êtes Freelance et l'administratif vous prend trop de temps ?
                </p>
                <a
                  href="https://adefree.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Découvrir Adefree
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Mail className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Contactez-nous
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Une question ? Un projet ? N'hésitez pas à nous contacter, 
              notre équipe sera ravie de vous accompagner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center">
              <Mail className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email</h3>
              <a 
                href="mailto:hello@getintalent.fr" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                hello@getintalent.fr
              </a>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center">
              <Phone className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Téléphone</h3>
              <a 
                href="tel:+33972328994" 
                className="text-green-600 dark:text-green-400 hover:underline"
              >
                +33 9 72 32 89 94
              </a>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center">
              <MapPin className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Adresse</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Paris, France
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo et description */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <Users className="w-6 h-6 text-white" />
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
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Navigation</h3>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => navigate('/')}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Accueil
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/missions')}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Missions
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/about')}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    À propos
                  </button>
                </li>
              </ul>
            </div>

            {/* Sites partenaires */}
              <div>
                <h3 className="text-lg font-semibold mb-6">Nos sites</h3>
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
                      href="https://tjmfreelance.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors flex items-center"
                    >
                      Calcul TJM Freelance
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
          {/* Copyright */}
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Ma Nouvelle Mission - Propulsé par Get in Talent. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;

