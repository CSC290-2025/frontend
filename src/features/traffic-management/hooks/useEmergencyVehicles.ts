import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';

export interface EmergencyVehicle {
  lat: number;
  lng: number;
  updatedAt: number;
  vehicleId: string;
  type: 'ambulance' | 'fire' | 'police';
}

interface UseEmergencyVehiclesReturn {
  vehicles: EmergencyVehicle[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to track emergency vehicles from Firebase in real-time
 * Monitors the teams/13/ambulance_car path for emergency vehicle locations
 */
export function useEmergencyVehicles(): UseEmergencyVehiclesReturn {
  const [vehicles, setVehicles] = useState<EmergencyVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reference to emergency vehicle in Firebase
    const emergencyVehicleRef = ref(database, 'teams/13/ambulance_car');

    const unsubscribe = onValue(
      emergencyVehicleRef,
      (snapshot) => {
        try {
          const data = snapshot.val();

          if (!data) {
            setVehicles([]);
            setError(null);
            setLoading(false);
            return;
          }

          // Check if we have valid coordinates
          if (
            typeof data.lat === 'number' &&
            typeof data.lng === 'number' &&
            !isNaN(data.lat) &&
            !isNaN(data.lng) &&
            isFinite(data.lat) &&
            isFinite(data.lng)
          ) {
            const vehicle: EmergencyVehicle = {
              lat: data.lat,
              lng: data.lng,
              updatedAt: data.updatedAt || Date.now(),
              vehicleId: 'ambulance-13',
              type: 'ambulance',
            };

            setVehicles([vehicle]);
            setError(null);
          } else {
            setVehicles([]);
            setError('Invalid vehicle coordinates');
          }

          setLoading(false);
        } catch (err) {
          console.error('Error processing emergency vehicle data:', err);
          setError('Error processing emergency vehicle data');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Firebase error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      off(emergencyVehicleRef);
    };
  }, []);

  return { vehicles, loading, error };
}
