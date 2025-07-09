// src/components/LoadingSpinner.jsx - Composant de chargement amélioré
import React from 'react';
import { RefreshCw, Briefcase, Search, TrendingUp } from 'lucide-react';

const LoadingSpinner = ({ message = "Chargement en cours...", showDetails = false }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Logo animé */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce">
            <Search className="w-4 h-4 text-white m-1" />
          </div>
        </div>

        {/* Spinner principal */}
        <div className="relative mb-6">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-blue-600" />
          <div className="absolute inset-0 w-12 h-12 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>

        {/* Message principal */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Ma Nouvelle Mission
        </h2>
        <p className="text-gray-600 mb-6">{message}</p>

        {/* Détails de chargement */}
        {showDetails && (
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span>Connexion à la base de données...</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse animation-delay-200"></div>
              <span>Récupération des missions...</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse animation-delay-400"></div>
              <span>Préparation de l'interface...</span>
            </div>
          </div>
        )}

        {/* Barre de progression */}
        <div className="mt-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Chargement en cours...</p>
        </div>

        {/* Statistiques animées */}
        <div className="grid grid-cols-3 gap-4 mt-8 text-center">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-800 animate-pulse">50+</div>
            <div className="text-xs text-gray-500">Missions</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <Briefcase className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-800 animate-pulse">20+</div>
            <div className="text-xs text-gray-500">Entreprises</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <Search className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-800 animate-pulse">100+</div>
            <div className="text-xs text-gray-500">Candidatures</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

