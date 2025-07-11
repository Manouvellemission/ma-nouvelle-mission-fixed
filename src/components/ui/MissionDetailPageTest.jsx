import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const MissionDetailPageTest = ({ darkMode }) => {
  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-8">
        <Link 
          to="/missions"
          className="inline-flex items-center text-blue-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour aux missions
        </Link>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-4 dark:text-white">
            Page de test - Mission individuelle
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            ✅ Si vous voyez cette page, la route fonctionne !
          </p>
        </div>
      </div>
    </div>
  );
};

export default MissionDetailPageTest;
