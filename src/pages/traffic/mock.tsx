'use client';

import { useEffect, useState, useRef } from 'react';
import { database } from '@/lib/firebase';
import { ref, set } from 'firebase/database';

const mapColor = (colorNumber: number) => {
  switch (colorNumber) {
    case 1:
      return 'green';
    case 2:
      return 'yellow';
    case 3:
      return 'red';
    default:
      return 'red';
  }
};

const convertLight = (light: any) => {
  const [lng, lat] = light.location.coordinates;

  return {
    color: mapColor(light.current_color),
    direction: light.road_id.toString(),
    lat,
    lng,
    online: light.status > 0,
    remainingTime: light.green_duration ?? 0,
    timestamp: light.timestamp,
  };
};

export default function TrafficSyncPage() {
  const [polling, setPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAndPush = async () => {
    try {
      const res = await fetch('http://localhost:3000/traffic-lights');
      const apiData = await res.json();

      const lightsArray = apiData.data.trafficLights;

      const grouped: Record<string, any[]> = {};

      for (const light of lightsArray) {
        const junctionId = light.intersection_id.toString();
        if (!grouped[junctionId]) grouped[junctionId] = [];
        grouped[junctionId].push(light);
      }

      for (const junctionId in grouped) {
        const lights = grouped[junctionId];
        const lightsObj: any = {};

        lights.forEach((light, index) => {
          const key = String.fromCharCode(65 + index); // A/B/C/D...
          lightsObj[key] = convertLight(light);
        });

        const currentActive =
          Object.entries(lightsObj).find(
            ([_, v]: any) => v.color === 'green'
          )?.[0] || '';

        const firebaseRef = ref(database, `teams/10/junctions/${junctionId}`);

        await set(firebaseRef, {
          currentActive,
          lights: lightsObj,
        });

        console.log('Firebase updated for junction', junctionId);
      }
    } catch (err) {
      console.error('Error syncing traffic lights:', err);
    }
  };

  // Enable/disable polling
  useEffect(() => {
    if (polling) {
      intervalRef.current = setInterval(() => {
        fetchAndPush();
      }, 1000); // Every 1 second
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [polling]);

  // Initial fetch when page loads
  useEffect(() => {
    fetchAndPush();
  }, []);

  return (
    <>
      <div className="p-6">
        <h1 className="text-xl font-bold">Traffic Light Sync</h1>

        <p className="mt-2 text-gray-600">
          Fetching traffic lights and pushing to Firebase.
        </p>

        <button
          onClick={() => setPolling(!polling)}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          {polling ? 'Stop Polling' : 'Start Polling'}
        </button>

        <p className="mt-2 text-sm text-gray-700">
          Status: {polling ? 'Polling every 1 second' : 'Polling stopped'}
        </p>
      </div>
    </>
  );
}
