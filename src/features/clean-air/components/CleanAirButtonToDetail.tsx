import React from 'react';
import { useNavigate } from '@/router';
import { useParams } from '@/router';

export default function CleanAirButtonToDetail() {
  const { district } = useParams('/weather-aqi/overview/:district');
  const navigate = useNavigate();

  const handleNavigateToDetail = () => {
    if (district) {
      navigate('/clean-air/district-detail/:district', {
        params: { district: district },
      });
    }
  };

  return (
    <div
      className="relative w-full cursor-pointer overflow-hidden rounded-2xl border border-gray-900 bg-white p-6 text-gray-900 shadow-md transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
      onClick={handleNavigateToDetail}
    >
      {/* Title: Clean Air */}
      <div className="text-3xl font-light">Clean Air</div>

      {/* Subtitle: Air quality */}
      <p className="mt-8 text-lg text-gray-700">Air quality</p>
    </div>
  );
}
