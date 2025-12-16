import { useEffect, useRef } from 'react';
import { ref, update, onValue, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import {
  COLOR_RED,
  COLOR_YELLOW,
  COLOR_GREEN,
  groupLightsByIntersection,
  calculateIntersectionLightDurations,
  calculateRedLightRemainingTime,
  getNextActiveLightInIntersection,
  sortLightsByRoadId,
  getLightDuration,
  type TrafficLightData,
} from '../utils/trafficLightCalculations';

const CYCLE_CONTROLLER_KEY = 'teams/10/traffic-cycle-controller';
const TRAFFIC_LIGHTS_PATH = 'teams/10/traffic_lights';

/**
 * Hook to manage traffic light cycles with Firebase synchronization
 * Uses leader election to ensure only one instance controls the timer
 *
 * Works directly with teams/10/traffic_lights structure
 */
export function useTrafficLightCycle() {
  const isControllerRef = useRef(false);
  const controllerIdRef = useRef<string>('');
  const trafficLightsRef = useRef<Record<string, any>>({});
  const emergencyStopRef = useRef(false);
  const stoppedIntersectionsRef = useRef<Set<number>>(new Set());
  const emergencyControlledRef = useRef<Set<number>>(new Set());
  // Track previous status of each light to detect status changes
  const prevLightStatusRef = useRef<Record<string, number>>({});

  // Listen to traffic_lights data
  useEffect(() => {
    const trafficLightsDbRef = ref(database, TRAFFIC_LIGHTS_PATH);

    const unsubscribe = onValue(trafficLightsDbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        trafficLightsRef.current = data;
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to emergency stop state
  useEffect(() => {
    const emergencyStopDbRef = ref(database, 'teams/10/emergency-stop');
    const stoppedIntersectionsDbRef = ref(
      database,
      'teams/10/stopped-intersections'
    );
    const emergencyControlledDbRef = ref(
      database,
      'teams/10/emergency-controlled-intersections'
    );

    const unsubscribeEmergencyStop = onValue(emergencyStopDbRef, (snapshot) => {
      emergencyStopRef.current = snapshot.val() === true;
    });

    const unsubscribeStoppedIntersections = onValue(
      stoppedIntersectionsDbRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const intersectionIds = Object.keys(data)
            .filter((key) => data[key] === true)
            .map((key) => parseInt(key));
          stoppedIntersectionsRef.current = new Set(intersectionIds);
        } else {
          stoppedIntersectionsRef.current = new Set();
        }
      }
    );

    const unsubscribeEmergencyControlled = onValue(
      emergencyControlledDbRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const intersectionIds = Object.keys(data)
            .filter((key) => data[key] === true)
            .map((key) => parseInt(key));
          emergencyControlledRef.current = new Set(intersectionIds);
        } else {
          emergencyControlledRef.current = new Set();
        }
      }
    );

    return () => {
      unsubscribeEmergencyStop();
      unsubscribeStoppedIntersections();
      unsubscribeEmergencyControlled();
    };
  }, []);

  // Main cycle controller
  useEffect(() => {
    // Generate unique ID for this instance
    const instanceId = `${Date.now()}-${Math.random()}`;
    controllerIdRef.current = instanceId;

    // Listen for controller assignment
    const controllerRef = ref(database, CYCLE_CONTROLLER_KEY);

    // Immediately claim controller
    update(controllerRef, {
      id: instanceId,
      timestamp: Date.now(),
    })
      .then(() => {
        isControllerRef.current = true;
        console.log('Claimed traffic cycle controller:', instanceId);
      })
      .catch((err) => {
        console.error('Failed to claim controller:', err);
      });

    const unsubscribe = onValue(controllerRef, (snapshot) => {
      const currentController = snapshot.val();

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
          'Re-claimed traffic cycle controller (stale detected):',
          instanceId
        );
      } else if (currentController.id === instanceId) {
        isControllerRef.current = true;
      } else {
        isControllerRef.current = false;
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
        return; // Skip if not controller
      }

      // Check for global emergency stop
      if (emergencyStopRef.current) {
        return; // Skip all processing if emergency stop is active
      }

      const currentTrafficLights = trafficLightsRef.current;
      if (
        !currentTrafficLights ||
        Object.keys(currentTrafficLights).length === 0
      ) {
        return;
      }

      // Group lights by intersection
      const intersections = groupLightsByIntersection(currentTrafficLights);

      // Process each intersection
      for (const [interidStr, lights] of Object.entries(intersections)) {
        const interid = parseInt(interidStr);

        // Check if this intersection is stopped or controlled by emergency vehicle
        if (stoppedIntersectionsRef.current.has(interid)) {
          continue;
        }
        if (emergencyControlledRef.current.has(interid)) {
          continue;
        }

        if (lights.length === 0) continue;

        // Filter out broken (status=1) and fixing (status=2) lights from cycle
        // Only normal lights (status=0 or undefined) participate in the cycle
        const allLights = sortLightsByRoadId(lights);
        const normalLights = allLights.filter((l) => {
          const status = parseInt(String(l.status ?? 0)) || 0;
          return status === 0; // Only normal lights
        });

        // If no normal lights, skip this intersection
        if (normalLights.length === 0) continue;

        // Check for status changes (light becoming normal from broken/fixing)
        let needsRecalculation = false;
        allLights.forEach((light) => {
          const currentStatus = parseInt(String(light.status ?? 0)) || 0;
          const prevStatus = prevLightStatusRef.current[light.key];

          // If light changed from broken/fixing (1 or 2) to normal (0)
          if (
            prevStatus !== undefined &&
            (prevStatus === 1 || prevStatus === 2) &&
            currentStatus === 0
          ) {
            needsRecalculation = true;
            console.log(
              `Light ${light.key} changed from ${prevStatus === 1 ? 'broken' : 'fixing'} to normal - recalculating intersection ${interid}`
            );
          }

          // Update tracked status
          prevLightStatusRef.current[light.key] = currentStatus;
        });

        // Find the active light (green or yellow) among normal lights only
        let activeLight = normalLights.find(
          (l) => l.color === COLOR_GREEN || l.color === COLOR_YELLOW
        );

        // If no active light, start the first normal one
        if (!activeLight) {
          activeLight = normalLights[0];
          const { greenDuration, yellowDuration } =
            getLightDuration(activeLight);
          const updates: Record<string, any> = {
            [`${TRAFFIC_LIGHTS_PATH}/${activeLight.key}/color`]: COLOR_GREEN,
            [`${TRAFFIC_LIGHTS_PATH}/${activeLight.key}/remaintime`]:
              greenDuration + yellowDuration,
            [`${TRAFFIC_LIGHTS_PATH}/${activeLight.key}/timestamp`]:
              new Date().toISOString(),
          };

          // Set red light times for other normal lights
          const lightDurations =
            calculateIntersectionLightDurations(normalLights);
          const activeIndex = normalLights.findIndex(
            (l) => l.key === activeLight!.key
          );

          normalLights.forEach((light, idx) => {
            if (light.key !== activeLight!.key) {
              const redTime = calculateRedLightRemainingTime(
                lightDurations,
                activeIndex,
                idx
              );
              updates[`${TRAFFIC_LIGHTS_PATH}/${light.key}/color`] = COLOR_RED;
              updates[`${TRAFFIC_LIGHTS_PATH}/${light.key}/remaintime`] =
                redTime;
            }
          });

          await update(ref(database), updates);
          continue;
        }

        // If a light just became normal, recalculate all remaining times based on current active light
        if (needsRecalculation) {
          const lightDurations =
            calculateIntersectionLightDurations(normalLights);
          const activeIndex = normalLights.findIndex(
            (l) => l.key === activeLight.key
          );
          const { greenDuration, yellowDuration } =
            getLightDuration(activeLight);

          // Calculate time elapsed in current cycle (how much of active light's duration has passed)
          const totalActiveDuration = greenDuration + yellowDuration;
          const elapsedTime = totalActiveDuration - activeLight.remaintime;

          const updates: Record<string, any> = {};

          // Recalculate remaining times for all red lights
          normalLights.forEach((light, idx) => {
            if (light.key !== activeLight.key) {
              const fullRedTime = calculateRedLightRemainingTime(
                lightDurations,
                activeIndex,
                idx
              );
              // Subtract elapsed time since active light started
              const adjustedRedTime = Math.max(0, fullRedTime - elapsedTime);
              updates[`${TRAFFIC_LIGHTS_PATH}/${light.key}/color`] = COLOR_RED;
              updates[`${TRAFFIC_LIGHTS_PATH}/${light.key}/remaintime`] =
                adjustedRedTime;
            }
          });

          if (Object.keys(updates).length > 0) {
            await update(ref(database), updates);
            console.log(
              `Intersection ${interid}: Recalculated remaining times after status change`
            );
          }
          continue;
        }

        const remainingTime = activeLight.remaintime;
        const newRemainingTime = Math.max(0, remainingTime - 1);
        const { greenDuration, yellowDuration } = getLightDuration(activeLight);

        // Determine new color based on remaining time
        let newColor = activeLight.color;
        if (newRemainingTime > yellowDuration) {
          newColor = COLOR_GREEN;
        } else if (newRemainingTime > 0 && newRemainingTime <= yellowDuration) {
          newColor = COLOR_YELLOW;
        } else if (newRemainingTime === 0) {
          newColor = COLOR_RED;
        }

        // Build updates object
        const updates: Record<string, any> = {
          [`${TRAFFIC_LIGHTS_PATH}/${activeLight.key}/remaintime`]:
            newRemainingTime,
          [`${TRAFFIC_LIGHTS_PATH}/${activeLight.key}/color`]: newColor,
          [`${TRAFFIC_LIGHTS_PATH}/${activeLight.key}/timestamp`]:
            new Date().toISOString(),
        };

        // Decrement all other normal red lights
        normalLights.forEach((light) => {
          if (light.key !== activeLight!.key) {
            const redRemainingTime = Math.max(0, light.remaintime - 1);
            updates[`${TRAFFIC_LIGHTS_PATH}/${light.key}/remaintime`] =
              redRemainingTime;
            updates[`${TRAFFIC_LIGHTS_PATH}/${light.key}/color`] = COLOR_RED;
          }
        });

        // If timer reached 0, cycle to next normal light
        if (newRemainingTime === 0) {
          const nextLight = getNextActiveLightInIntersection(
            normalLights,
            activeLight.key
          );

          if (nextLight) {
            const lightDurations =
              calculateIntersectionLightDurations(normalLights);
            const nextIndex = normalLights.findIndex(
              (l) => l.key === nextLight.key
            );
            const { greenDuration: nextGreen, yellowDuration: nextYellow } =
              getLightDuration(nextLight);

            // Set next light to green
            updates[`${TRAFFIC_LIGHTS_PATH}/${nextLight.key}/color`] =
              COLOR_GREEN;
            updates[`${TRAFFIC_LIGHTS_PATH}/${nextLight.key}/remaintime`] =
              nextGreen + nextYellow;
            updates[`${TRAFFIC_LIGHTS_PATH}/${nextLight.key}/timestamp`] =
              new Date().toISOString();

            // Calculate stacked remaining times for all other normal lights
            normalLights.forEach((light, idx) => {
              if (light.key !== nextLight.key) {
                const redTime = calculateRedLightRemainingTime(
                  lightDurations,
                  nextIndex,
                  idx
                );
                updates[`${TRAFFIC_LIGHTS_PATH}/${light.key}/color`] =
                  COLOR_RED;
                updates[`${TRAFFIC_LIGHTS_PATH}/${light.key}/remaintime`] =
                  redTime;
              }
            });

            console.log(
              `Intersection ${interid}: Cycled from roadid ${activeLight.roadid} to roadid ${nextLight.roadid} (Green: ${nextGreen}s, Yellow: ${nextYellow}s)`
            );
          }
        }

        // Apply updates to Firebase
        await update(ref(database), updates);
      }
    }, 1000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(cycleInterval);
      unsubscribe();

      if (isControllerRef.current) {
        remove(controllerRef).catch((err) => {
          console.error('Failed to remove controller:', err);
        });
      }
    };
  }, []);

  return {
    isController: isControllerRef.current,
  };
}
