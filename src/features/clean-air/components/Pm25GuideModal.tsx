import React from 'react';

export interface Pm25GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const data = [
  {
    range: '0 - 25',
    status: 'Good air quality. Safe for health.',
    color: 'bg-green-500',
    icon: '',
  },
  {
    range: '26 - 37.5',
    status:
      "Air quality is moderate. It's starting to be unhealthy for sensitive people.",
    color: 'bg-lime-500',
    icon: '',
  },
  {
    range: '37.6 - 50',
    status:
      'It is starting to affect health. Outdoor activities should be reduced.',
    color: 'bg-yellow-500',
    icon: '',
  },
  {
    range: '50.1 - 90',
    status: 'Very unhealthy. You should avoid outdoor activities.',
    color: 'bg-orange-500',
    icon: '',
  },
  {
    range: 'more than 90',
    status: 'Dangerous for your health. Avoid all outdoor activities.',
    color: 'bg-red-500',
    icon: '',
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
        className="w-full max-w-2xl scale-100 transform overflow-hidden rounded-lg border border-gray-900 bg-white shadow-2xl transition-all duration-300"
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
              className={`flex items-center rounded-lg shadow-lg ${item.color} text-white`}
            >
              <div className="bg-opacity-10 flex w-12 items-center justify-center rounded-l-lg p-3 text-3xl">
                {item.icon}
              </div>
              <div className="border-opacity-30 w-1/4 border-l border-white text-center text-lg font-bold">
                {item.range}
              </div>
              <div className="border-opacity-30 flex-1 border-l border-white p-3 text-sm font-medium">
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
