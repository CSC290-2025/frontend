import React from 'react';
import { useParams } from '@/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faFaceGrinWide,
  faFaceSmile,
  faFaceMeh,
  faFaceFrown,
  faFaceDizzy,
} from '@fortawesome/free-regular-svg-icons';
import { useDistrictDetailQuery } from '../hooks/useDistrictDetail';

interface CurrentAqiCardProps {
  onDocumentationClick: () => void;
}

interface StatusDetails {
  status: string;
  style: string;
  icon: IconDefinition;
}

const getStatusAndStyle = (category: string): StatusDetails => {
  switch (category.toUpperCase()) {
    case 'UNHEALTHY':
    case 'BAD':
      return {
        status: 'Unhealthy',
        style: 'bg-red-600 text-white',
        icon: faFaceFrown,
      };
    case 'MODERATE':
      return {
        status: 'Moderate',
        style: 'bg-yellow-500 text-black',
        icon: faFaceMeh,
      };
    case 'HEALTHY':
    case 'GOOD':
      return {
        status: 'Good',
        style: 'bg-green-500 text-white',
        icon: faFaceGrinWide,
      };
    case 'DANGEROUS':
      return {
        status: 'Dangerous',
        style: 'bg-red-500 text-white',
        icon: faFaceDizzy,
      };
    default:
      return {
        status: 'Unknown',
        style: 'bg-gray-400 text-black',
        icon: faFaceSmile,
      };
  }
};

const getFormattedTime = (iso?: string) => {
  if (!iso) return 'No data';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Invalid date';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Bangkok',
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
};

export function CurrentAqiCard({ onDocumentationClick }: CurrentAqiCardProps) {
  const { district } = useParams<{ district: string }>();
  const {
    data: districtDetail,
    isLoading,
    error,
  } = useDistrictDetailQuery(district);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
        <div className="text-center">Loading air quality data...</div>
      </div>
    );
  }

  if (error || !districtDetail?.currentData) {
    return (
      <div className="rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
        <div className="text-center text-red-600">
          {error?.message || 'No air quality data available'}
        </div>
      </div>
    );
  }

  const currentData = districtDetail.currentData;
  const aqi = currentData.aqi || 0;
  const pm25 = currentData.pm25 || 0;
  const category = currentData.category || 'Unknown';

  const lastUpdated = getFormattedTime(currentData.measured_at);

  const { status, style: statusStyle, icon } = getStatusAndStyle(category);

  const badgeColorClass = statusStyle.split(' ')[0];
  const iconColorClass = badgeColorClass.replace('bg-', 'text-');

  return (
    <div className="rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
      <div className="relative mb-4 flex items-start justify-between">
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

        <div className="flex flex-col items-end text-right">
          <FontAwesomeIcon
            icon={icon}
            className={`text-6xl ${iconColorClass}`}
          />

          <h2 className="mt-6 text-xl text-black">{district}, Bangkok</h2>
          <p className="text-sm text-gray-600">Last updated: {lastUpdated}</p>
        </div>
      </div>
    </div>
  );
}
