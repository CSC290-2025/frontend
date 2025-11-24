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
      className="ml-6 w-full max-w-xs cursor-pointer overflow-hidden rounded-xl border border-black bg-white p-3 text-gray-900 transition-all duration-300"
      onClick={handleNavigateToDetail}
    >
      <div className="text-base font-semibold text-gray-900">Clean Air</div>

      <p className="mt-6 text-sm text-gray-700">Air quality</p>
    </div>
  );
}
