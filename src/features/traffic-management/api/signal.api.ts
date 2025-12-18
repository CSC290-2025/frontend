import { getBaseAPIURL } from '@/lib/apiClient';
import { ref, set, onValue, off, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import type { TrafficSignal, trafficLight } from '../types/traffic.types';

// Get traffic signal status from Firebase
export function subscribeToTrafficSignal(
  callback: (signal: TrafficSignal) => void
) {
  const signalRef = ref(database, 'teams/10/traffic-signals/0');

  const unsubscribe = onValue(signalRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data as TrafficSignal);
    }
  });

  return () => off(signalRef);
}

// Get current traffic signal (one-time)
export async function getTrafficSignal(): Promise<TrafficSignal | null> {
  const signalRef = ref(database, 'teams/10/traffic-signals/0');
  const snapshot = await get(signalRef);
  return snapshot.val() as TrafficSignal | null;
}

// Control traffic light via ESP32 HTTP endpoint
export async function controlTrafficLight(
  esp32Ip: string,
  command: 'manual' | 'auto',
  color?: 'red' | 'yellow' | 'green'
) {
  try {
    const response = await fetch(`http://${esp32Ip}/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: command,
        color: color,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to control traffic light:', error);
    throw error;
  }
}

// Update traffic durations
export async function updateTrafficDurations(durations: {
  red: number;
  yellow: number;
  green: number;
}) {
  const durationsRef = ref(database, 'teams/10/traffic-signals/0/durations');
  await set(durationsRef, durations);
}

// Update traffic light via PUT endpoint
export async function putTrafficLight(
  trafficLightId: number,
  payload: Partial<trafficLight>
): Promise<trafficLight> {
  const url = getBaseAPIURL + `/traffic-lights/${trafficLightId}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Failed to update traffic light', response.status, text);
    throw new Error(
      `Failed to update traffic light: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as trafficLight;
}
