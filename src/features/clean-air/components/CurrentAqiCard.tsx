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

interface CurrentAqiCardProps {
  onDocumentationClick: () => void;
}

interface StatusDetails {
  status: string;
  style: string;
  icon: IconDefinition;
  iconStyle: string;
}

const getStatusAndStyle = (category: string): StatusDetails => {
  switch (category.toUpperCase()) {
    case 'GOOD':
      return {
        status: 'GOOD',
        style: 'bg-teal-500 text-white',
        icon: faFaceGrinWide,
        iconStyle: 'text-teal-600',
      };
    case 'MODERATE':
      return {
        status: 'MODERATE',
        style: 'bg-lime-500 text-black',
        icon: faFaceSmile,
        iconStyle: 'text-lime-500',
      };
    case 'UNHEALTHY_FOR_SENSITIVE':
      return {
        status: 'UNHEALTHY FOR SENSITIVE',
        style: 'bg-yellow-500 text-black',
        icon: faFaceMeh,
        iconStyle: 'text-yellow-500',
      };
    case 'UNHEALTHY':
    case 'BAD':
      return {
        status: 'UNHEALTHY',
        style: 'bg-orange-500 text-white',
        icon: faFaceFrown,
        iconStyle: 'text-orange-500',
      };
    case 'VERY_UNHEALTHY':
    case 'DANGEROUS':
    case 'HAZARDOUS':
      return {
        status: 'VERY UNHEALTHY',
        style: 'bg-red-500 text-white',
        icon: faFaceDizzy,
        iconStyle: 'text-red-600',
      };
    default:
      console.log(
        'CurrentAqiCard category not matched, showing Unknown:',
        category
      ); // Debug
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

export default function CurrentAqiCard({
  onDocumentationClick,
}: CurrentAqiCardProps) {
  const { district } = useParams('/clean-air/district-detail/:district');
  const displayDistrict = decodeURIComponent(district || '');
  const {
    data: districtDetail,
    isLoading,
    error,
  } = useDistrictDetailQuery(district);

  if (isLoading) {
    return (
      <div className="h-full rounded-xl border border-black bg-white p-6 text-center text-gray-900 shadow-md">
        Loading air quality data...
      </div>
    );
  }

  if (error || !districtDetail?.currentData) {
    return (
      <div className="h-full rounded-xl border border-black bg-white p-6 text-center text-gray-900 shadow-md">
        {error?.message || 'No air quality data available'}
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
    <div className="h-full rounded-xl border border-black bg-white p-6 text-gray-900 shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <h1 className="text-base font-semibold text-gray-800">
          Current Air Quality
        </h1>
        <button
          onClick={onDocumentationClick}
          className="hidden rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-300 sm:block"
        >
          Information
        </button>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="flex flex-col">
          <div className="flex items-end leading-none">
            <p className="text-6xl font-bold">{aqi}</p>
            <span className="mb-2 ml-1 align-top text-3xl font-normal">
              AQI
            </span>
          </div>

          <p className="mt-2 text-base font-normal text-gray-700">
            PM 2.5: {pm25Display} µg/m³
          </p>

          <span
            className={`mt-1 rounded px-2 py-0.5 text-sm font-semibold ${statusStyle} `}
          >
            {status}
          </span>
        </div>
        <div className="flex h-full flex-col items-start justify-start sm:items-end">
          <div className="relative mt-1 inline-block">
            <FontAwesomeIcon icon={icon} className={`text-6xl ${iconStyle}`} />

            <button
              onClick={onDocumentationClick}
              className="absolute -right-4 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border border-gray-400 bg-white text-[10px] font-bold text-gray-500 shadow-sm active:bg-gray-100 sm:hidden"
            >
              ?
            </button>
          </div>

          <div className="mt-4 flex flex-col text-left sm:text-right">
            <p className="text-sm font-semibold whitespace-nowrap text-black">
              {displayDistrict}, Bangkok
            </p>
            <p className="text-xs whitespace-nowrap text-gray-500">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
