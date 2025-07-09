// src/components/SkeletonLoader.jsx - Skeleton loader pour les missions
import React from 'react';

const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
    {/* Badge featured */}
    <div className="w-20 h-6 bg-gray-200 rounded mb-3"></div>
    
    {/* Titre */}
    <div className="h-6 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    
    {/* Métadonnées */}
    <div className="flex flex-wrap gap-3 mb-4">
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 bg-gray-200 rounded"></div>
        <div className="w-16 h-4 bg-gray-200 rounded"></div>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 bg-gray-200 rounded"></div>
        <div className="w-20 h-4 bg-gray-200 rounded"></div>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 bg-gray-200 rounded"></div>
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
      </div>
    </div>
    
    {/* Description */}
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
    
    {/* Footer */}
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-200 rounded"></div>
        <div className="w-16 h-4 bg-gray-200 rounded"></div>
      </div>
      <div className="w-24 h-8 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const SkeletonLoader = ({ count = 6 }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

export default SkeletonLoader;

