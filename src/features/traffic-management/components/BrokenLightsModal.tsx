import React, { useState, useEffect } from 'react';

type TrafficLight = {
  id: number;
  intersection_id: string;
  status: number;
  statusLabel?: string;
  last_updated?: string;
  location?: {
    coordinates: [number, number];
  };
};

type BrokenLightsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function BrokenLightsModal({
  isOpen,
  onClose,
}: BrokenLightsModalProps) {
  const [lights, setLights] = useState<TrafficLight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchBrokenLights();
    }
  }, [isOpen]);

  const fetchBrokenLights = async () => {
    setLoading(true);
    setError(null);
    try {
      const BASE =
        (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3333';
      const res = await fetch(`${BASE}/traffic-lights/status`);
      if (!res.ok) throw new Error('Failed to fetch status');
      const json = await res.json();
      const allLights = Array.isArray(json)
        ? json
        : json?.data?.trafficLights || json?.trafficLights || [];

      // Filter for broken (status=1) and maintenance (status=2)
      const problematicLights = allLights.filter((light: TrafficLight) => {
        const status = light.status;
        const label = (light.statusLabel || '').toString().toLowerCase();
        return (
          status === 1 ||
          status === 2 ||
          /broken/.test(label) ||
          /maintenance/.test(label)
        );
      });

      setLights(problematicLights);
    } catch (err) {
      console.error('Failed to fetch broken lights:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (light: TrafficLight) => {
    if (light.status === 1) {
      return {
        label: 'BROKEN',
        color: 'bg-red-100 text-red-800 border-red-300',
      };
    } else if (light.status === 2) {
      return {
        label: 'MAINTENANCE',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
      };
    }
    return {
      label: light.statusLabel || 'UNKNOWN',
      color: 'bg-gray-100 text-gray-800 border-gray-300',
    };
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-[100] flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-4xl rounded-lg bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Problematic Traffic Lights
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Showing all broken and maintenance-required traffic lights
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
            aria-label="Close modal"
          >
            <svg
              className="h-6 w-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[600px] overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <span className="ml-4 text-gray-600">
                Loading traffic lights...
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="font-medium text-red-800">Error: {error}</p>
            </div>
          )}

          {!loading && !error && lights.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <svg
                className="mb-4 h-16 w-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg font-medium text-gray-900">
                All traffic lights are operational!
              </p>
              <p className="mt-1 text-sm text-gray-500">
                No broken or maintenance-required lights found.
              </p>
            </div>
          )}

          {!loading && !error && lights.length > 0 && (
            <div className="space-y-3">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  Found {lights.length} problematic light
                  {lights.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={fetchBrokenLights}
                  className="flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </button>
              </div>

              {lights.map((light) => {
                const statusInfo = getStatusInfo(light);
                const coords = light.location?.coordinates;

                return (
                  <div
                    key={light.id}
                    className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4 transition-all duration-200 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-900">
                            ID: {light.id}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium text-gray-700">
                              Intersection:
                            </span>{' '}
                            {light.intersection_id || 'N/A'}
                          </p>
                          {coords && (
                            <p>
                              <span className="font-medium text-gray-700">
                                Location:
                              </span>{' '}
                              {coords[1].toFixed(6)}, {coords[0].toFixed(6)}
                            </p>
                          )}
                          {light.last_updated && (
                            <p>
                              <span className="font-medium text-gray-700">
                                Last Updated:
                              </span>{' '}
                              {new Date(light.last_updated).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="ml-4">
                        {light.status === 1 ? (
                          <svg
                            className="h-12 w-12 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                          </svg>
                        ) : (
                          <svg
                            className="h-12 w-12 text-amber-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
