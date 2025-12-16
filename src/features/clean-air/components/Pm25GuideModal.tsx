import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFaceGrinWide,
  faFaceSmile,
  faFaceMeh,
  faFaceFrown,
  faFaceDizzy,
} from '@fortawesome/free-regular-svg-icons';

export interface Pm25GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AQIData {
  range: string;
  status: string;
  color: string;
  text: string;
  icon: typeof faFaceGrinWide;
}
const data: AQIData[] = [
  {
    range: '0 - 50',
    status:
      'Good air quality. Safe for health. (Equivalent to PM 2.5 ≤ 12.0 µg/m³)',
    color: 'bg-green-500',
    text: 'text-green-500',
    icon: faFaceGrinWide,
  },
  {
    range: '51 - 100',
    status:
      'Air quality is moderate. Acceptable, but starting to affect sensitive people. (Equivalent to PM 2.5 ≤ 35.4 µg/m³)',
    color: 'bg-lime-500',
    text: 'text-lime-500',
    icon: faFaceSmile,
  },
  {
    range: '101 - 150',
    status:
      'Unhealthy for sensitive groups. It is starting to affect health. Outdoor activities should be reduced.',
    color: 'bg-yellow-500',
    text: 'text-yellow-500',
    icon: faFaceMeh,
  },
  {
    range: '151 - 200',
    status:
      'Unhealthy. Everyone may begin to experience health effects. You should avoid outdoor activities.',
    color: 'bg-orange-500',
    text: 'text-orange-500',
    icon: faFaceFrown,
  },
  {
    range: 'more than 200',
    status:
      'Very Unhealthy / Hazardous. Dangerous for your health. Avoid all outdoor activities.',
    color: 'bg-red-500',
    text: 'text-red-500',
    icon: faFaceDizzy,
  },
];

export default function Pm25GuideModal({
  isOpen,
  onClose,
}: Pm25GuideModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative mx-0 w-full max-w-2xl transform overflow-hidden rounded-t-2xl border border-gray-900 bg-white shadow-2xl transition-all duration-300 sm:mx-[100px] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 z-10 p-1 text-2xl font-bold text-gray-800 transition hover:text-red-500 sm:text-3xl"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="border-b border-gray-200 bg-gray-50 px-9 py-6 sm:px-10">
          <h2 className="flex flex-wrap items-center text-lg leading-tight font-bold text-gray-800 sm:text-xl">
            How high does <span className="mx-1 text-red-600">AQI</span> have to
            be to be dangerous?
          </h2>
        </div>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto px-9 py-6 text-[14px] sm:px-10 sm:text-[16px]">
          {data.map((item, index) => (
            <div
              key={index}
              className={`flex rounded-lg shadow-md ${item.color} min-h-[80px] text-white`}
            >
              <div
                className={`flex w-14 items-center justify-center rounded-l-lg bg-white p-2 text-3xl sm:w-16 sm:p-3 sm:text-4xl ${item.text}`}
              >
                <FontAwesomeIcon icon={item.icon} />
              </div>

              <div className="border-opacity-30 flex w-20 items-center justify-center border-l border-white px-1 text-center text-base font-bold sm:w-24 sm:px-2 sm:text-lg">
                {item.range}
              </div>

              <div className="flex flex-1 items-center p-3 text-xs leading-snug font-medium sm:text-sm">
                {item.status}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start border-t border-gray-200 bg-gray-50 px-9 py-6 text-[10px] text-gray-600 sm:px-10 sm:text-xs">
          <div className="mr-2 font-semibold whitespace-nowrap text-blue-600">
            Note:
          </div>
          <p>
            *AQI is a comprehensive index based on multiple pollutants. The
            ranges shown are primarily derived from the PM 2.5 component
            thresholds set by the US EPA for a 24-hour average.
          </p>
        </div>
      </div>
    </div>
  );
}
