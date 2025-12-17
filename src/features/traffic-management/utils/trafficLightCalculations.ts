/**
 * Utility functions for traffic light duration calculations
 * All traffic management code should use these functions - NO DUPLICATION!
 *
 * Works with teams/10/traffic_lights structure:
 * {
 *   color: number (1=red, 2=yellow, 3=green),
 *   green_duration: number,
 *   yellow_duration: number,
 *   remaintime: number,
 *   interid: number,
 *   roadid: number,
 *   ...
 * }
 */

export const DEFAULT_GREEN_DURATION = 27; // seconds
export const DEFAULT_YELLOW_DURATION = 3; // seconds

// Color mappings for traffic_lights format
export const COLOR_RED = 1;
export const COLOR_YELLOW = 2;
export const COLOR_GREEN = 3;

export function colorNumberToString(color: number): 'red' | 'yellow' | 'green' {
  const map: Record<number, 'red' | 'yellow' | 'green'> = {
    1: 'red',
    2: 'yellow',
    3: 'green',
  };
  return map[color] || 'red';
}

export function colorStringToNumber(color: string): number {
  const map: Record<string, number> = { red: 1, yellow: 2, green: 3 };
  return map[color] || 1;
}

/**
 * Sort lights by roadid numerically
 */
export function sortLightsByRoadId<T extends { roadid: number }>(
  lights: T[]
): T[] {
  return [...lights].sort((a, b) => a.roadid - b.roadid);
}

/**
 * Sort light keys numerically (for legacy format: Road-1, Road-2, Road-10)
 */
export function sortLightKeysNumerically(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  });
}

/**
 * Get duration for a single light (green + yellow)
 * Supports both traffic_lights format (snake_case) and legacy format (camelCase)
 */
export function getLightDuration(light: any): {
  greenDuration: number;
  yellowDuration: number;
  totalDuration: number;
} {
  // Support both snake_case (traffic_lights) and camelCase (legacy)
  const greenDuration =
    parseInt(light?.green_duration) ||
    parseInt(light?.greenDuration) ||
    parseInt(light?.duration) ||
    DEFAULT_GREEN_DURATION;
  const yellowDuration =
    parseInt(light?.yellow_duration) ||
    parseInt(light?.yellowDuration) ||
    DEFAULT_YELLOW_DURATION;
  return {
    greenDuration,
    yellowDuration,
    totalDuration: greenDuration + yellowDuration,
  };
}

/**
 * Traffic light data from Firebase traffic_lights
 */
export interface TrafficLightData {
  key: string; // Firebase key
  interid: number;
  roadid: number;
  color: number; // 1=red, 2=yellow, 3=green
  green_duration: number;
  yellow_duration: number;
  remaintime: number;
  lat: number;
  lng: number;
  autoON?: boolean;
  status?: number;
  density_level?: number;
  marker_id?: number;
  timestamp?: string;
}

/**
 * Group traffic lights by intersection ID
 */
export function groupLightsByIntersection(
  lights: Record<string, any>
): Record<number, TrafficLightData[]> {
  const groups: Record<number, TrafficLightData[]> = {};

  Object.entries(lights).forEach(([key, light]) => {
    if (light && typeof light === 'object') {
      const interid = parseInt(light.interid) || 0;
      if (!groups[interid]) {
        groups[interid] = [];
      }
      groups[interid].push({
        key,
        interid,
        roadid: parseInt(light.roadid) || 0,
        color: parseInt(light.color) || COLOR_RED,
        green_duration:
          parseInt(light.green_duration) || DEFAULT_GREEN_DURATION,
        yellow_duration:
          parseInt(light.yellow_duration) || DEFAULT_YELLOW_DURATION,
        remaintime: parseInt(light.remaintime) || 0,
        lat: parseFloat(light.lat) || 0,
        lng: parseFloat(light.lng) || 0,
        autoON: light.autoON,
        status: light.status,
        density_level: light.density_level,
        marker_id: light.marker_id,
        timestamp: light.timestamp,
      });
    }
  });

  // Sort lights within each intersection by roadid
  Object.keys(groups).forEach((interid) => {
    groups[parseInt(interid)] = sortLightsByRoadId(groups[parseInt(interid)]);
  });

  return groups;
}

/**
 * Calculate all light durations for an intersection
 * Returns array in sorted order (by roadid) with each light's duration info
 */
export function calculateIntersectionLightDurations(
  lights: TrafficLightData[]
): Array<{
  key: string;
  roadid: number;
  greenDuration: number;
  yellowDuration: number;
  totalDuration: number;
}> {
  const sorted = sortLightsByRoadId(lights);
  return sorted.map((light) => {
    const { greenDuration, yellowDuration, totalDuration } =
      getLightDuration(light);
    return {
      key: light.key,
      roadid: light.roadid,
      greenDuration,
      yellowDuration,
      totalDuration,
    };
  });
}

/**
 * Calculate the remaining time for a red light based on its position in the cycle
 *
 * @param lightDurations - Array of all light durations in sorted order
 * @param activeIndex - Index of the currently active (green/yellow) light
 * @param targetIndex - Index of the light we want to calculate remaining time for
 * @returns The remaining time in seconds until this light turns green
 *
 * Example with 4 lights (30s each):
 * - activeIndex = 0 (Road-1 is green)
 * - targetIndex = 1 (Road-2): wait for Road-1 = 30s
 * - targetIndex = 2 (Road-3): wait for Road-1 + Road-2 = 60s
 * - targetIndex = 3 (Road-4): wait for Road-1 + Road-2 + Road-3 = 90s
 */
export function calculateRedLightRemainingTime(
  lightDurations: Array<{
    totalDuration: number;
    key?: string;
    roadid?: number;
  }>,
  activeIndex: number,
  targetIndex: number
): number {
  if (activeIndex === targetIndex) {
    return 0; // This light is active, not red
  }

  const numLights = lightDurations.length;
  let remainingTime = 0;

  // Calculate how many steps from active light to target light
  // Going in cycle order: active -> next -> next -> ... -> target
  let currentIdx = activeIndex;

  while (currentIdx !== targetIndex) {
    // Add the duration of the current light (we need to wait for it to finish)
    remainingTime += lightDurations[currentIdx].totalDuration;

    // Move to next light in cycle
    currentIdx = (currentIdx + 1) % numLights;

    // Safety check to prevent infinite loop
    if (remainingTime > 10000) {
      console.error('calculateRedLightRemainingTime: infinite loop detected');
      break;
    }
  }

  return remainingTime;
}

/**
 * Find the active light (green or yellow) in an intersection
 * Returns the index in the sorted lights array
 */
export function findActiveLightIndex(lights: TrafficLightData[]): number {
  const sorted = sortLightsByRoadId(lights);
  const activeIdx = sorted.findIndex(
    (l) => l.color === COLOR_GREEN || l.color === COLOR_YELLOW
  );
  return activeIdx >= 0 ? activeIdx : 0; // Default to first light if none active
}

/**
 * Calculate remaining times for all lights in an intersection given the active light
 * Returns a map of lightKey -> remainingTime
 */
export function calculateAllRemainingTimesForIntersection(
  lights: TrafficLightData[],
  activeKey: string
): Record<string, number> {
  const lightDurations = calculateIntersectionLightDurations(lights);
  const activeIndex = lightDurations.findIndex((l) => l.key === activeKey);

  if (activeIndex === -1) {
    console.error(
      'calculateAllRemainingTimesForIntersection: activeKey not found',
      activeKey
    );
    return {};
  }

  const result: Record<string, number> = {};

  // Active light gets its full duration
  result[activeKey] = lightDurations[activeIndex].totalDuration;

  // Calculate remaining time for each red light
  lightDurations.forEach((light, idx) => {
    if (idx !== activeIndex) {
      result[light.key] = calculateRedLightRemainingTime(
        lightDurations,
        activeIndex,
        idx
      );
    }
  });

  return result;
}

/**
 * Get the next light in the cycle after the current one finishes
 */
export function getNextActiveLightInIntersection(
  lights: TrafficLightData[],
  currentActiveKey: string
): TrafficLightData | null {
  const sorted = sortLightsByRoadId(lights);
  const currentIndex = sorted.findIndex((l) => l.key === currentActiveKey);
  if (currentIndex === -1) return sorted[0] || null;
  const nextIndex = (currentIndex + 1) % sorted.length;
  return sorted[nextIndex];
}

// Legacy functions for backward compatibility
export function calculateAllLightDurations(lights: Record<string, any>): Array<{
  key: string;
  greenDuration: number;
  yellowDuration: number;
  totalDuration: number;
}> {
  const lightKeys = sortLightKeysNumerically(Object.keys(lights));
  return lightKeys.map((key) => {
    const { greenDuration, yellowDuration, totalDuration } = getLightDuration(
      lights[key]
    );
    return { key, greenDuration, yellowDuration, totalDuration };
  });
}

export function calculateAllRemainingTimes(
  lights: Record<string, any>,
  activeKey: string
): Record<string, number> {
  const lightDurations = calculateAllLightDurations(lights);
  const activeIndex = lightDurations.findIndex((l) => l.key === activeKey);

  if (activeIndex === -1) {
    console.error('calculateAllRemainingTimes: activeKey not found', activeKey);
    return {};
  }

  const result: Record<string, number> = {};

  // Active light gets its full duration
  result[activeKey] = lightDurations[activeIndex].totalDuration;

  // Calculate remaining time for each red light
  lightDurations.forEach((light, idx) => {
    if (idx !== activeIndex) {
      result[light.key] = calculateRedLightRemainingTime(
        lightDurations,
        activeIndex,
        idx
      );
    }
  });

  return result;
}

export function getNextActiveLight(
  lights: Record<string, any>,
  currentActiveKey: string
): string {
  const lightKeys = sortLightKeysNumerically(Object.keys(lights));
  const currentIndex = lightKeys.indexOf(currentActiveKey);
  const nextIndex = (currentIndex + 1) % lightKeys.length;
  return lightKeys[nextIndex];
}
