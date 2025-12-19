import { useEffect, useRef, useCallback } from 'react';
import { ref, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import type { EmergencyVehicle } from './useEmergencyVehicles';

interface TrafficSignal {
  lat: number;
  lng: number;
  junctionId: string;
  direction?: string;
  color: string;
  online: boolean;
}

const PROXIMITY_THRESHOLD = 200; // 200 meters
const EMERGENCY_OVERRIDE_DURATION = 60; // 60 seconds
const WRITE_COOLDOWN_MS = 5000; // Minimum 5 seconds between writes to same junction

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
 * Uses Firebase for emergency override
 */
export function useEmergencyTrafficControl(
  emergencyVehicles: EmergencyVehicle[],
  trafficSignals: TrafficSignal[]
) {
  // Track which junctions have been switched to green
  const switchedJunctionsRef = useRef<Set<string>>(new Set());
  const proximityInfoRef = useRef<ProximityInfo[]>([]);

  // Track last write time per junction to prevent rapid updates
  const lastWriteTimeRef = useRef<Map<string, number>>(new Map());

  // Store latest data in refs to avoid effect re-runs
  const emergencyVehiclesRef = useRef(emergencyVehicles);
  const trafficSignalsRef = useRef(trafficSignals);

  // Update refs when props change (without triggering effect)
  useEffect(() => {
    emergencyVehiclesRef.current = emergencyVehicles;
  }, [emergencyVehicles]);

  useEffect(() => {
    trafficSignalsRef.current = trafficSignals;
  }, [trafficSignals]);

  const checkProximityAndSwitch = useCallback(async () => {
    const vehicles = emergencyVehiclesRef.current;
    const signals = trafficSignalsRef.current;

    if (vehicles.length === 0 || signals.length === 0) {
      return;
    }

    const currentProximities: ProximityInfo[] = [];
    const now = Date.now();

    // For each emergency vehicle
    for (const vehicle of vehicles) {
      // Group signals by junction
      const junctionSignals = new Map<string, TrafficSignal[]>();

      for (const signal of signals) {
        if (!signal.online) continue;

        if (!junctionSignals.has(signal.junctionId)) {
          junctionSignals.set(signal.junctionId, []);
        }
        junctionSignals.get(signal.junctionId)!.push(signal);
      }

      // Check distance to each junction
      for (const [
        junctionId,
        junctionSignalList,
      ] of junctionSignals.entries()) {
        // Use the first signal's location as the junction location
        const junctionSignal = junctionSignalList[0];

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

          // Check if we haven't already switched this junction AND cooldown has passed
          const lastWriteTime = lastWriteTimeRef.current.get(junctionId) || 0;
          const timeSinceLastWrite = now - lastWriteTime;

          if (
            !switchedJunctionsRef.current.has(junctionId) &&
            timeSinceLastWrite >= WRITE_COOLDOWN_MS
          ) {
            console.log(
              `Emergency vehicle ${vehicle.vehicleId} approaching junction ${junctionId} (${Math.round(distance)}m) - Switching to GREEN`
            );

            try {
              // Update Firebase for real-time display
              const firebaseUpdates: Record<string, any> = {};

              for (const signal of junctionSignalList) {
                const lightPath = `teams/10/junctions/${junctionId}/lights/${signal.direction || 'default'}`;
                firebaseUpdates[`${lightPath}/color`] = 'green';
                firebaseUpdates[`${lightPath}/remainingTime`] =
                  EMERGENCY_OVERRIDE_DURATION;
                firebaseUpdates[`${lightPath}/emergencyOverride`] = true;
                firebaseUpdates[`${lightPath}/timestamp`] = now;
              }

              await update(ref(database), firebaseUpdates);

              console.log(
                `✅ Junction ${junctionId} switched to green (Firebase)`
              );

              // Mark this junction as switched and record write time
              switchedJunctionsRef.current.add(junctionId);
              lastWriteTimeRef.current.set(junctionId, now);
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
  }, []);

  // Set up interval only once on mount
  useEffect(() => {
    // Check every 2 seconds for proximity (interval-based, not on every data change)
    const interval = setInterval(checkProximityAndSwitch, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [checkProximityAndSwitch]);

  return {
    activeProximities: proximityInfoRef.current,
    switchedJunctions: Array.from(switchedJunctionsRef.current),
  };
}
