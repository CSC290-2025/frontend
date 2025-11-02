import React from 'react';

interface CurrentAqiCardProps {
  onDocumentationClick: () => void;
}

type AqiStatus =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy (Sens.)'
  | 'Unhealthy'
  | 'Dangerous';

interface CurrentAqiData {
  aqi: number;
  pm25: number;
  location: string;
  lastUpdated: string;
}

const mockData: CurrentAqiData = {
  aqi: 162,
  pm25: 56,
  location: 'Bangmod, Bangkok',
  lastUpdated: '14 Sept 2025, 20:05',
};

const getStatusAndStyle = (pm25: number) => {
  if (pm25 <= 25) {
    return { status: 'Good', style: 'bg-green-500 text-white' };
  } else if (pm25 <= 37.5) {
    return { status: 'Moderate', style: 'bg-lime-500 text-gray-900' };
  } else if (pm25 <= 50) {
    return {
      status: 'Unhealthy (Sens.)',
      style: 'bg-yellow-500 text-gray-900',
    };
  } else if (pm25 <= 90) {
    return { status: 'Unhealthy', style: 'bg-orange-500 text-white' };
  } else {
    return { status: 'Dangerous', style: 'bg-red-500 text-white' };
  }
};

export function CurrentAqiCard({ onDocumentationClick }: CurrentAqiCardProps) {
  const { aqi, pm25, location, lastUpdated } = mockData;

  const { status, style: statusStyle } = getStatusAndStyle(pm25);

  return (
    <div className="rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
      <div className="mb-4 flex items-start justify-between">
        <h1 className="text-xl font-semibold">Current Air Quality</h1>
        <span
          className="cursor-pointer rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-200"
          onClick={onDocumentationClick}
        >
          Documentation
        </span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-6xl font-bold">
            {aqi} <span className="text-2xl font-light">AQI</span>
          </p>
          <p className="mt-1 text-xl">PM2.5: {pm25} µg/m³</p>
          <span
            className={`mt-3 inline-block rounded-full px-4 py-1 font-medium ${statusStyle}`}
          >
            {status}
          </span>
        </div>

        <div className="text-right">
          <p className="text-6xl text-gray-700" role="img" aria-label=""></p>
          <p className="mt-2 text-lg font-medium">{location}</p>
          <p className="text-sm text-gray-600">Last updated: {lastUpdated}</p>
        </div>
      </div>
    </div>
  );
}
