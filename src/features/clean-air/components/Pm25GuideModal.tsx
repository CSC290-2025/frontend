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

const data = [
  {
    range: '0 - 25',
    status: 'Good air quality. Safe for health.',
    color: 'bg-green-500',
    text: 'text-green-500',
    icon: faFaceGrinWide,
  },
  {
    range: '26 - 37.5',
    status:
      "Air quality is moderate. It's starting to be unhealthy for sensitive people.",
    color: 'bg-lime-500',
    text: 'text-lime-500',
    icon: faFaceSmile,
  },
  {
    range: '37.6 - 50',
    status:
      'It is starting to affect health. Outdoor activities should be reduced.',
    color: 'bg-yellow-500',
    text: 'text-yellow-500',
    icon: faFaceMeh,
  },
  {
    range: '50.1 - 90',
    status: 'Very unhealthy. You should avoid outdoor activities.',
    color: 'bg-orange-500',
    text: 'text-orange-500',
    icon: faFaceFrown,
  },
  {
    range: 'more than 90',
    status: 'Dangerous for your health. Avoid all outdoor activities.',
    color: 'bg-red-500',
    text: 'text-red-500',
    icon: faFaceDizzy,
  },
];

export function Pm25GuideModal({ isOpen, onClose }: Pm25GuideModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="bg-non bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl scale-100 transform overflow-hidden rounded-lg border border-gray-900 bg-white shadow-2xl transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 z-10 p-1 text-3xl font-bold text-gray-800 transition hover:text-red-500"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="overflow-hidden border-b border-gray-200 bg-gray-50 p-6">
          <h2 className="flex items-center text-xl font-bold whitespace-nowrap text-gray-800">
            How high does <span className="mx-1 text-red-600">PM 2.5</span> have
            to be to be dangerous?
          </h2>
        </div>

        <div className="space-y-3 p-6">
          {data.map((item, index) => (
            <div
              key={index}
              className={`flex rounded-lg shadow-md ${item.color} text-white`}
            >
              <div
                className={`flex w-16 items-center justify-center rounded-l-lg bg-white p-3 text-4xl ${item.text}`}
              >
                <FontAwesomeIcon icon={item.icon} />
              </div>

              <div className="border-opacity-30 flex w-1/4 items-center justify-center border-l border-white px-2 text-center text-lg font-bold">
                {item.range}
              </div>

              <div className="flex flex-1 items-center p-3 text-sm font-medium">
                {item.status}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start border-t border-gray-200 bg-gray-50 p-6 text-xs text-gray-600">
          <div className="mr-2 font-semibold text-blue-600">Longevity:</div>
          <p>
            *Air quality control data sets the PM 2.5 health impact threshold at
            50 µg/m³ &nbsp;However, the data defined in this table is based on a
            24-hour daily average.
          </p>
        </div>
      </div>
    </div>
  );
}
export default Pm25GuideModal;
