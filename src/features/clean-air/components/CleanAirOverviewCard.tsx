import React from 'react';
import { useParams } from '@/router';
import { useNavigate } from '@/router';
import { useState } from 'react';
import HealthTips from './HealthTips';
import MinimalCurrentAqiCard from './MinimalCurrentAqiCard';
import CurrentDataCard from './CurrentDataCard';

export default function CleanAirOverviewCards() {
  const { district } = useParams('/weather-aqi/overview/:district');
  const navigate = useNavigate();

  return (
    <div className="relative w-full cursor-pointer bg-white p-6 text-gray-900 shadow-md transition-all duration-300 hover:border-blue-500 hover:shadow-lg">
              {/* Title: Clean Air */}     {' '}
      <div className="mb-5 text-3xl font-bold">Air Quality</div>
             
      <MinimalCurrentAqiCard />
      <CurrentDataCard />
      <HealthTips />   {' '}
    </div>
  );
}
