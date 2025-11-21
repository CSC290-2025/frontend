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
import useDistrictDetailQuery from '../hooks/useDistrictDetail';

interface StatusDetails {
  status: string;
  style: string;
  icon: IconDefinition;
  iconStyle: string;
}

const getStatusAndStyle = (category: string): StatusDetails => {
  switch (category.toUpperCase()) {
    case 'GOOD':
    case 'HEALTHY':
      return {
        status: 'Good',
        style: 'bg-green-600 text-white',
        icon: faFaceGrinWide,
        iconStyle: 'text-green-600',
      };
    case 'MODERATE':
      return {
        status: 'Moderate',
        style: 'bg-lime-500 text-black',
        icon: faFaceSmile,
        iconStyle: 'text-lime-500',
      };
    case 'UNHEALTHY_FOR_SENSITIVE_GROUPS':
    case 'USG':
      return {
        status: 'USG',
        style: 'bg-yellow-500 text-black',
        icon: faFaceMeh,
        iconStyle: 'text-yellow-500',
      };
    case 'UNHEALTHY':
    case 'BAD':
      return {
        status: 'Unhealthy',
        style: 'bg-orange-500 text-white',
        icon: faFaceFrown,
        iconStyle: 'text-orange-500',
      };
    case 'VERY_UNHEALTHY':
    case 'DANGEROUS':
    case 'HAZARDOUS':
      return {
        status: 'Very Unhealthy',
        style: 'bg-red-600 text-white',
        icon: faFaceDizzy,
        iconStyle: 'text-red-600',
      };
    default:
      return {
        status: 'Unknown',
        style: 'bg-gray-400 text-black',
        icon: faFaceMeh,
        iconStyle: 'text-gray-600',
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

export default function MinimalCurrentAqiCard() {
  const { district } = useParams('/clean-air/district-detail/:district');
  const displayDistrict = decodeURIComponent(district || '');
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

  const {
    status,
    style: statusStyle,
    icon,
    iconStyle,
  } = getStatusAndStyle(category);

  const pm25Display = pm25.toFixed(1);

  return (
    <div className="rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
      <div className="relative mb-4 flex items-start justify-between">
        <h1 className="text-xl font-semibold">Current Air Quality</h1>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-6xl font-bold">
            {aqi} <span className="text-2xl font-light">AQI</span>
          </p>
          <p className="mt-1 text-xl">PM2.5: {pm25Display} µg/m³</p>

          <span
            className={`mt-3 inline-block rounded-full px-4 py-1 font-medium ${statusStyle}`}
          >
            {status}
          </span>
        </div>

        <div className="flex flex-col items-end text-right">
          <FontAwesomeIcon icon={icon} className={`text-6xl ${iconStyle}`} />

          <h2 className="mt-6 text-xl text-black">
            {displayDistrict}, Bangkok
          </h2>
          <p className="text-sm text-gray-600">Last updated: {lastUpdated}</p>
        </div>
      </div>
    </div>
  );
}
