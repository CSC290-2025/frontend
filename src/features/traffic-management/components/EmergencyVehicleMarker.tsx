import { AdvancedMarker } from '@vis.gl/react-google-maps';
import type { EmergencyVehicle } from '../hooks/useEmergencyVehicles';

interface EmergencyVehicleMarkerProps {
  vehicle: EmergencyVehicle;
}

export default function EmergencyVehicleMarker({
  vehicle,
}: EmergencyVehicleMarkerProps) {
  const vehicleIcons = {
    ambulance: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-ambulance size-9 text-white"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
        <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
        <path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5" />
        <path d="M6 10h4m-2 -2v4" />
      </svg>
    ),
    fire: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-white"
      >
        <path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.08-3.61 5.75-2.39 8.9.04.1.08.2.08.33 0 .22-.15.42-.35.5-.23.1-.47.04-.66-.12a.58.58 0 0 1-.14-.17c-1.13-1.43-1.31-3.48-.55-5.12C5.78 10 4.87 12.3 5 14.47c.06.5.12 1 .29 1.5.14.6.41 1.2.71 1.73 1.08 1.73 2.95 2.97 4.96 3.22 2.14.27 4.43-.12 6.07-1.6 1.83-1.66 2.47-4.32 1.53-6.6l-.13-.26c-.21-.46-.77-1.26-.77-1.26m-3.16 6.3c-.28.24-.74.5-1.1.6-1.12.4-2.24-.16-2.9-.82 1.19-.28 1.9-1.16 2.11-2.05.17-.8-.15-1.46-.28-2.23-.12-.74-.1-1.37.17-2.06.19.38.39.76.63 1.06.77 1 1.98 1.44 2.24 2.8.04.14.06.28.06.43.03.82-.33 1.72-.93 2.27z" />
      </svg>
    ),
    police: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-white"
      >
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
      </svg>
    ),
  };

  const vehicleColors = {
    ambulance: '#ef4444', // red-500
    fire: '#f97316', // orange-500
    police: '#3b82f6', // blue-500
  };

  return (
    <AdvancedMarker
      position={{ lat: vehicle.lat, lng: vehicle.lng }}
      title={`${vehicle.type.toUpperCase()} - ${vehicle.vehicleId}`}
    >
      <div className="flex cursor-pointer flex-col items-center">
        {/* Main marker with pulsing background */}
        <div className="relative">
          {/* Pulsing animation ring - centered on marker */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full opacity-75"
            style={{
              backgroundColor: vehicleColors[vehicle.type],
              width: '56px',
              height: '56px',
            }}
          />

          {/* Main marker */}
          <div
            className="relative flex items-center justify-center rounded-full border-4 border-white shadow-2xl"
            style={{
              backgroundColor: vehicleColors[vehicle.type],
              width: '56px',
              height: '56px',
            }}
          >
            {vehicleIcons[vehicle.type]}
          </div>
        </div>

        {/* Label */}
        <div
          className="mt-1 rounded px-3 py-1 text-xs font-bold text-white shadow-lg"
          style={{
            backgroundColor: vehicleColors[vehicle.type],
          }}
        >
          {vehicle.type.toUpperCase()}
        </div>
      </div>
    </AdvancedMarker>
  );
}
