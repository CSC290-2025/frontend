import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off } from 'firebase/database';

interface TrafficData {
  interid: number;
  roadid: number;
  lat: number;
  lng: number;
  autoON: boolean;
  color: number;
  remaintime: number;
  timestamp: string;
}

interface TrafficRecord extends TrafficData {
  key: string;
}

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default function TrafficDashboard() {
  const [trafficData, setTrafficData] = useState<TrafficRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'auto' | 'manual'>('all');

  useEffect(() => {
    const trafficRef = ref(database, 'traffic');

    const unsubscribe = onValue(
      trafficRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const records: TrafficRecord[] = Object.keys(data).map((key) => ({
              key,
              ...data[key],
            }));
            setTrafficData(records);
          } else {
            setTrafficData([]);
          }
          setLoading(false);
        } catch (err) {
          setError('Error processing data');
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => off(trafficRef, 'value', unsubscribe);
  }, []);

  const getColorName = (color: number) => {
    const colors: { [key: number]: string } = {
      0: 'Red',
      1: 'Yellow',
      2: 'Green',
    };
    return colors[color] || 'Unknown';
  };

  const getColorClass = (color: number) => {
    const classes: { [key: number]: string } = {
      0: 'bg-red-500',
      1: 'bg-yellow-500',
      2: 'bg-green-500',
    };
    return classes[color] || 'bg-gray-500';
  };

  const filteredData = trafficData.filter((record) => {
    if (filter === 'auto') return record.autoON;
    if (filter === 'manual') return !record.autoON;
    return true;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading traffic data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-800">Error</h2>
          <p className="text-red-600">{error}</p>
          <p className="mt-2 text-sm text-red-500">
            Please check your Firebase configuration
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            Traffic Light Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time traffic light monitoring system
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-700">Filter:</span>
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-4 py-2 transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({trafficData.length})
            </button>
            <button
              onClick={() => setFilter('auto')}
              className={`rounded-lg px-4 py-2 transition ${
                filter === 'auto'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Auto Mode ({trafficData.filter((r) => r.autoON).length})
            </button>
            <button
              onClick={() => setFilter('manual')}
              className={`rounded-lg px-4 py-2 transition ${
                filter === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Manual Mode ({trafficData.filter((r) => !r.autoON).length})
            </button>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-md">
            <p className="text-lg text-gray-500">No traffic data available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredData.map((record) => (
              <div
                key={record.key}
                className="rounded-lg bg-white p-6 shadow-md transition hover:shadow-lg"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">
                    Intersection {record.interid}
                  </h3>
                  <div
                    className={`h-12 w-12 rounded-full ${getColorClass(record.color)} shadow-lg`}
                  ></div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Road ID:</span>
                    <span className="font-semibold text-gray-800">
                      {record.roadid}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold text-gray-800">
                      {getColorName(record.color)} Light
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Mode:</span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        record.autoON
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {record.autoON ? 'Auto' : 'Manual'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Remaining:</span>
                    <span className="font-semibold text-gray-800">
                      {record.remaintime}s
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-mono text-sm text-gray-800">
                      {record.lat.toFixed(4)}, {record.lng.toFixed(4)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <span className="text-xs text-gray-500">
                      Updated: {new Date(record.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
