import { useEffect, useRef } from 'react';
import { ref, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { getBaseAPIURL } from '@/lib/apiClient';
import type { EmergencyVehicle } from './useEmergencyVehicles';

interface TrafficSignal {
  lat: number;
  lng: number;
  junctionId: string;
  direction?: string;
  color: string;
  online: boolean;
  source?: 'legacy' | 'backend'; // Track if this is from junctions (legacy) or traffic_lights (backend)
}

const PROXIMITY_THRESHOLD = 200; // 200 meters
const EMERGENCY_OVERRIDE_DURATION = 60; // 60 seconds

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

interface ProximityInfo {
  junctionId: string;
  distance: number;
  vehicleId: string;
}

/**
 * Hook to automatically switch traffic lights to green when emergency vehicles approach
 * Uses both Firebase and Backend API for emergency override
 */
export function useEmergencyTrafficControl(
  emergencyVehicles: EmergencyVehicle[],
  trafficSignals: TrafficSignal[]
) {
  // Track which junctions have been switched to green
  const switchedJunctionsRef = useRef<Set<string>>(new Set());
  const proximityInfoRef = useRef<ProximityInfo[]>([]);

  useEffect(() => {
    if (emergencyVehicles.length === 0 || trafficSignals.length === 0) {
      return;
    }

    const checkProximityAndSwitch = async () => {
      const currentProximities: ProximityInfo[] = [];

      // For each emergency vehicle
      for (const vehicle of emergencyVehicles) {
        // Group signals by junction
        const junctionSignals = new Map<string, TrafficSignal[]>();

        for (const signal of trafficSignals) {
          if (!signal.online) continue;

          if (!junctionSignals.has(signal.junctionId)) {
            junctionSignals.set(signal.junctionId, []);
          }
          junctionSignals.get(signal.junctionId)!.push(signal);
        }

        // Check distance to each junction
        for (const [junctionId, signals] of junctionSignals.entries()) {
          // Use the first signal's location as the junction location
          const junctionSignal = signals[0];

          const distance = calculateDistance(
            vehicle.lat,
            vehicle.lng,
            junctionSignal.lat,
            junctionSignal.lng
          );

          // If emergency vehicle is within threshold
          if (distance <= PROXIMITY_THRESHOLD) {
            currentProximities.push({
              junctionId,
              distance,
              vehicleId: vehicle.vehicleId,
            });

            // If we haven't already switched this junction
            if (!switchedJunctionsRef.current.has(junctionId)) {
              console.log(
                `🚨 Emergency vehicle ${vehicle.vehicleId} approaching junction ${junctionId} (${Math.round(distance)}m) - Switching to GREEN`
              );

              try {
                // Update Firebase for real-time display
                const firebaseUpdates: Record<string, any> = {};

                for (const signal of signals) {
                  const lightPath = `teams/10/junctions/${junctionId}/lights/${signal.direction || 'default'}`;
                  firebaseUpdates[`${lightPath}/color`] = 'green';
                  firebaseUpdates[`${lightPath}/remainingTime`] = EMERGENCY_OVERRIDE_DURATION;
                  firebaseUpdates[`${lightPath}/emergencyOverride`] = true;
                  firebaseUpdates[`${lightPath}/timestamp`] = Date.now();
                }

                await update(ref(database), firebaseUpdates);

                // Also update via Backend API to persist the change (only for backend lights)
                // Check if any signal in this junction is from the backend
                const hasBackendLights = signals.some(s => s.source === 'backend');

                if (hasBackendLights) {
                  try {
                    const response = await fetch(
                      `${getBaseAPIURL}/traffic-lights?intersection_id=${junctionId}`
                    );

                    if (response.ok) {
                      const data = await response.json();
                      const lights = data?.data?.trafficLights || [];

                      // Update each light to green
                      for (const light of lights) {
                        const updatePayload = {
                          current_color: 3, // 3 = green in the backend system
                          auto_mode: false, // Disable auto mode during emergency
                          status: 0, // 0 = active
                        };

                        await fetch(`${getBaseAPIURL}/traffic-lights/${light.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(updatePayload),
                        });
                      }

                      console.log(
                        `✅ Junction ${junctionId} switched to green (Firebase + Backend API)`
                      );
                    }
                  } catch (apiError) {
                    console.warn(
                      `⚠️ Firebase updated but Backend API failed:`,
                      apiError
                    );
                  }
                } else {
                  console.log(
                    `✅ Junction ${junctionId} switched to green (Firebase only - legacy light)`
                  );
                }

                // Mark this junction as switched
                switchedJunctionsRef.current.add(junctionId);
              } catch (error) {
                console.error(
                  `❌ Failed to switch junction ${junctionId} to green:`,
                  error
                );
              }
            }
          }
        }
      }

      // Clear switched junctions that are no longer in proximity
      const currentJunctionIds = new Set(
        currentProximities.map((p) => p.junctionId)
      );

      for (const junctionId of switchedJunctionsRef.current) {
        if (!currentJunctionIds.has(junctionId)) {
          // Emergency vehicle has passed, remove from switched set
          switchedJunctionsRef.current.delete(junctionId);
          console.log(
            `✓ Emergency vehicle cleared junction ${junctionId} - Normal operation can resume`
          );
        }
      }

      proximityInfoRef.current = currentProximities;
    };

    checkProximityAndSwitch();

    // Check every 2 seconds for proximity
    const interval = setInterval(checkProximityAndSwitch, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [emergencyVehicles, trafficSignals]);

  return {
    activeProximities: proximityInfoRef.current,
    switchedJunctions: Array.from(switchedJunctionsRef.current),
  };
}