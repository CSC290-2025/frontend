import { useEffect, useRef, useMemo } from 'react';
import { ref, update, onValue, remove } from 'firebase/database';
import { database } from '@/lib/firebase';

const DEFAULT_GREEN_DURATION = 27; // seconds
const DEFAULT_YELLOW_DURATION = 3; // seconds
const CYCLE_CONTROLLER_KEY = 'teams/10/traffic-cycle-controller';

/**
 * Hook to manage traffic light cycles with Firebase synchronization
 * Uses leader election to ensure only one instance controls the timer
 *
 * Updates both:
 * - teams/10/junctions (legacy format with color as string)
 * - teams/10/traffic_lights (backend format with color as number 1/2/3)
 *
 * Note: For traffic_lights to update, junction lights must have a 'trafficLightId' field
 * that maps to the key in teams/10/traffic_lights
 */
export function useTrafficLightCycle(junctionsData: Record<string, any>) {
  const isControllerRef = useRef(false);
  const controllerIdRef = useRef<string>('');
  const junctionsDataRef = useRef(junctionsData);

  // Update ref with latest data, but don't cause re-renders
  useEffect(() => {
    junctionsDataRef.current = junctionsData;
  }, [junctionsData]);

  // Only re-initialize when junction structure changes (junction IDs), not on every data update
  const junctionIds = useMemo(() => {
    return Object.keys(junctionsData || {})
      .sort()
      .join(',');
  }, [junctionsData]);

  useEffect(() => {
    if (!junctionsData || Object.keys(junctionsData).length === 0) {
      console.log('⏳ Waiting for junctions data to load...');
      return; // Wait for junctions data to load
    }

    console.log(
      '📍 Junctions data loaded:',
      Object.keys(junctionsData).length,
      'junctions'
    );

    // Check if any lights have trafficLightId mapping
    let hasTrafficLightMapping = false;
    Object.values(junctionsData).forEach((junction: any) => {
      if (junction?.lights) {
        Object.values(junction.lights).forEach((light: any) => {
          if (light?.trafficLightId) {
            hasTrafficLightMapping = true;
          }
        });
      }
    });

    if (hasTrafficLightMapping) {
      console.log(
        '✅ Found trafficLightId mappings - will update both junctions and traffic_lights'
      );
    } else {
      console.log(
        '⚠️ No trafficLightId mappings found - will only update junctions (legacy format)'
      );
      console.log(
        '💡 To enable traffic_lights updates, add trafficLightId field to junction lights'
      );
    }

    // Generate unique ID for this instance
    const instanceId = `${Date.now()}-${Math.random()}`;
    controllerIdRef.current = instanceId;

    // Listen for controller assignment
    const controllerRef = ref(database, CYCLE_CONTROLLER_KEY);

    // Immediately claim controller (aggressive approach)
    update(controllerRef, {
      id: instanceId,
      timestamp: Date.now(),
    })
      .then(() => {
        isControllerRef.current = true;
        console.log(
          '🎮 Aggressively claimed traffic cycle controller:',
          instanceId
        );
      })
      .catch((err) => {
        console.error('Failed to claim controller:', err);
      });

    const unsubscribe = onValue(controllerRef, (snapshot) => {
      const currentController = snapshot.val();

      // If no controller or controller is stale (>10 seconds old), claim it
      if (
        !currentController ||
        Date.now() - currentController.timestamp > 10000
      ) {
        update(controllerRef, {
          id: instanceId,
          timestamp: Date.now(),
        });
        isControllerRef.current = true;
        console.log(
          '🎮 Re-claimed traffic cycle controller (stale detected):',
          instanceId
        );
      } else if (currentController.id === instanceId) {
        isControllerRef.current = true;
        console.log('✅ Confirmed as controller:', instanceId);
      } else {
        isControllerRef.current = false;
        console.log('❌ Another instance is controller:', currentController.id);
      }
    });

    // Heartbeat to maintain controller status
    const heartbeatInterval = setInterval(() => {
      if (isControllerRef.current) {
        update(controllerRef, {
          id: instanceId,
          timestamp: Date.now(),
        });
      }
    }, 5000);

    // Traffic light cycle management
    const cycleInterval = setInterval(async () => {
      if (!isControllerRef.current) {
        return; // Silently skip if not controller
      }

      const currentJunctionsData = junctionsDataRef.current;
      if (!currentJunctionsData) return;

      // Process each junction
      for (const [junctionId, junctionData] of Object.entries(
        currentJunctionsData
      )) {
        if (!junctionData?.lights || !junctionData?.currentActive) continue;

        const lights = junctionData.lights;
        const currentActive = junctionData.currentActive;
        const currentLight = lights[currentActive];

        if (!currentLight) continue;

        const remainingTime = parseInt(currentLight.remainingTime) || 0;
        const newRemainingTime = Math.max(0, remainingTime - 1);

        // Get durations for this light (support both old 'duration' field and new 'greenDuration'/'yellowDuration')
        const greenDuration =
          parseInt(currentLight.greenDuration) ||
          parseInt(currentLight.duration) ||
          DEFAULT_GREEN_DURATION;
        const yellowDuration =
          parseInt(currentLight.yellowDuration) || DEFAULT_YELLOW_DURATION;
        const totalDuration = greenDuration + yellowDuration;

        // Determine new color based on remaining time
        let newColor = currentLight.color;
        if (remainingTime > yellowDuration) {
          newColor = 'green';
        } else if (remainingTime > 0 && remainingTime <= yellowDuration) {
          newColor = 'yellow';
        } else if (remainingTime === 0) {
          newColor = 'red';
        }

        // Helper to convert color string to number for backend format
        const colorToNumber = (color: string): number => {
          const map: Record<string, number> = { red: 1, yellow: 2, green: 3 };
          return map[color] || 1;
        };

        // Update current light in BOTH junctions (legacy) and traffic_lights (backend) formats
        const updates: Record<string, any> = {
          // Legacy junctions format
          [`teams/10/junctions/${junctionId}/lights/${currentActive}/remainingTime`]:
            newRemainingTime,
          [`teams/10/junctions/${junctionId}/lights/${currentActive}/color`]:
            newColor,
          [`teams/10/junctions/${junctionId}/lights/${currentActive}/timestamp`]:
            Date.now(),
        };

        // Also update traffic_lights format if this light has a traffic light ID
        // Check if the light has an ID or interid that maps to traffic_lights
        if (currentLight.trafficLightId) {
          updates[
            `teams/10/traffic_lights/${currentLight.trafficLightId}/color`
          ] = colorToNumber(newColor);
          updates[
            `teams/10/traffic_lights/${currentLight.trafficLightId}/remaintime`
          ] = newRemainingTime;
          updates[
            `teams/10/traffic_lights/${currentLight.trafficLightId}/timestamp`
          ] = new Date().toISOString();
        }

        // If timer reached 0, cycle to next light
        if (newRemainingTime === 0) {
          const lightKeys = Object.keys(lights);
          const currentIndex = lightKeys.indexOf(currentActive);
          const nextIndex = (currentIndex + 1) % lightKeys.length;
          const nextActive = lightKeys[nextIndex];

          // Set all lights to red first
          lightKeys.forEach((key) => {
            updates[`teams/10/junctions/${junctionId}/lights/${key}/color`] =
              'red';
            updates[
              `teams/10/junctions/${junctionId}/lights/${key}/remainingTime`
            ] = 0;

            // Also update traffic_lights if this light has a mapping
            const light = lights[key];
            if (light?.trafficLightId) {
              updates[`teams/10/traffic_lights/${light.trafficLightId}/color`] =
                1; // red
              updates[
                `teams/10/traffic_lights/${light.trafficLightId}/remaintime`
              ] = 0;
            }
          });

          // Set next light to green with its duration
          const nextLight = lights[nextActive];
          const nextGreenDuration =
            parseInt(nextLight.greenDuration) ||
            parseInt(nextLight.duration) ||
            DEFAULT_GREEN_DURATION;
          const nextYellowDuration =
            parseInt(nextLight.yellowDuration) || DEFAULT_YELLOW_DURATION;
          const nextTotalDuration = nextGreenDuration + nextYellowDuration;

          updates[`teams/10/junctions/${junctionId}/currentActive`] =
            nextActive;
          updates[
            `teams/10/junctions/${junctionId}/lights/${nextActive}/color`
          ] = 'green';
          updates[
            `teams/10/junctions/${junctionId}/lights/${nextActive}/remainingTime`
          ] = nextTotalDuration;
          updates[
            `teams/10/junctions/${junctionId}/lights/${nextActive}/timestamp`
          ] = Date.now();

          // Also update traffic_lights for next light
          if (nextLight?.trafficLightId) {
            updates[
              `teams/10/traffic_lights/${nextLight.trafficLightId}/color`
            ] = 3; // green
            updates[
              `teams/10/traffic_lights/${nextLight.trafficLightId}/remaintime`
            ] = nextTotalDuration;
            updates[
              `teams/10/traffic_lights/${nextLight.trafficLightId}/timestamp`
            ] = new Date().toISOString();
          }

          console.log(
            `🚦 Junction ${junctionId}: Cycled from ${currentActive} to ${nextActive} (Green: ${nextGreenDuration}s, Yellow: ${nextYellowDuration}s, Total: ${nextTotalDuration}s)`
          );
        }

        // Apply updates to Firebase
        await update(ref(database), updates);
      }
    }, 1000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(cycleInterval);
      unsubscribe();

      // Release controller if we own it - use remove() instead of setting to null
      if (isControllerRef.current) {
        remove(controllerRef).catch((err) => {
          console.error('Failed to remove controller:', err);
        });
      }
    };
  }, [junctionIds]); // Only re-run when junction structure changes, not on every data update

  return {
    isController: isControllerRef.current,
  };
}
