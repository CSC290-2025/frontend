//calRedduration
import { getDatabase, ref, set, get } from 'firebase/database';
import { getBaseAPIURL } from '@/lib/apiClient.ts'; // Assuming this function exists
import { database as db } from '@/lib/firebase.ts';

interface BackendTrafficLight {
  id: number;
  intersection_id: number;
  road_id: number;
  ip_address: string;
  location: { type: string; coordinates: number[] };
  status: number;
  current_color: number;
  density_level: number;
  auto_mode: boolean;
  green_duration: number;
  red_duration: number;
  last_color: number;
  last_updated: string;
}

interface TrafficData {
  interid: number;
  roadid: number;
  lat: number;
  lng: number;
  marker_id: number;
  status: number;
  autoON: boolean;
  color: number;
  remaintime: number;
  green_duration: number;
  red_duration: number;
  density_level: number;
  timestamp: string;
}

/**
 * Calculates and updates the red duration and remaining time for all
 * traffic lights in a given intersection.
 * @param interID The ID of the intersection to process.
 * @param db The Firebase Realtime Database instance.
 * @returns A promise that resolves to a summary of the updates, or null if an error occurred.
 */

export async function calculateRedDuration(
  interID: number,
  db: ReturnType<typeof getDatabase>
): Promise<{
  success: boolean;
  updates: {
    id: number;
    oldRed: number;
    newRed: number;
    remainTimeUpdated: boolean;
  }[];
} | null> {
  console.log(`Starting calculation for Intersection ID: ${interID}`);
  const YELLOW_DURATION = 3; // Given yellow duration in seconds
  const RED_COLOR = 1; // Assuming 1 represents the Red color

  // --- 1. Fetch Traffic Light IDs from Backend ---
  let trafficLightIDs: number[] = [];
  try {
    const backendUrl =
      getBaseAPIURL + `/traffic-lights/intersection/${interID}`;
    const response = await fetch(backendUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.log(`Fetched traffic lights for intersection ${interID}:`, result);

    if (
      result.success &&
      result.data &&
      Array.isArray(result.data.trafficLights)
    ) {
      // We only need the IDs from the backend response
      trafficLightIDs = result.data.trafficLights.map(
        (tl: BackendTrafficLight) => tl.id
      );
    } else {
      console.error('Backend response format is invalid or success is false.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching traffic light IDs from backend:', error);
    return null;
  }

  if (trafficLightIDs.length === 0) {
    console.log(`No traffic lights found for intersection ${interID}.`);
    return { success: true, updates: [] };
  }

  const N = trafficLightIDs.length; // Total number of traffic lights
  const nMinus1Yellow = (N - 1) * YELLOW_DURATION;

  // --- 2. Fetch Traffic Light Data from Firebase ---
  const firebaseData: Record<number, TrafficData> = {};
  const fetchPromises = trafficLightIDs.map(async (id) => {
    const dbRef = ref(db, `teams/10/traffic_lights/${id}`);
    try {
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        firebaseData[id] = snapshot.val() as TrafficData;
      } else {
        console.warn(`No data found in Firebase for traffic light ID: ${id}`);
      }
    } catch (error) {
      console.error(`Error reading Firebase for ID ${id}:`, error);
    }
  });

  await Promise.all(fetchPromises);

  const trafficLightsInFirebase = Object.values(firebaseData);

  // --- 3. Calculate Sum of Other Green Durations ---
  // The sum of all green durations in the intersection
  const totalGreenDuration = trafficLightsInFirebase.reduce(
    (sum, tl) => sum + tl.green_duration,
    0
  );

  // --- 4. Calculate New Durations and Update Firebase ---
  const updates: {
    id: number;
    oldRed: number;
    newRed: number;
    remainTimeUpdated: boolean;
  }[] = [];
  const updatePromises = trafficLightIDs.map(async (id) => {
    const tl = firebaseData[id];
    if (!tl) return; // Skip if data wasn't found in Firebase

    // --- Calculation for new_red_duration (applies to all lights) ---
    const otherGreenDurationSum = totalGreenDuration - tl.green_duration;

    // Formula: new_red_duration = green_duration of other traffic lights + (n-1)(3)
    const newRedDuration = otherGreenDurationSum + nMinus1Yellow;
    const oldRedDuration = tl.red_duration;

    const durationDifference = newRedDuration - oldRedDuration;

    // Prepare data for update (Red Duration update applies to all)
    const updatedData: Partial<TrafficData> = {
      red_duration: newRedDuration,
      timestamp: new Date().toISOString(),
    };

    let remainTimeUpdated = false;

    // --- Conditional remaintime update (ONLY for Red lights) ---
    if (tl.color === RED_COLOR) {
      const newRemainTime = tl.remaintime + durationDifference;

      updatedData.remaintime = newRemainTime > 0 ? newRemainTime : 0;
      remainTimeUpdated = true;
      console.log(
        `TL ${id} (RED): Remaintime updated from ${tl.remaintime} to ${updatedData.remaintime}.`
      );
    } else {
      updatedData.remaintime = tl.remaintime;
      console.log(
        `TL ${id} (NOT RED - Color: ${tl.color}): Remaintime not changed (${tl.remaintime}).`
      );
    }

    // --- 5. Update to Firebase ---
    try {
      console.log(
        `Updating TL ID ${id}: Old Red: ${oldRedDuration}, New Red: ${newRedDuration}, Remaintime Updated: ${remainTimeUpdated}`
      );
      const dbRef = ref(db, `teams/10/traffic_lights/${id}`);
      console.log(
        `[DB] Attempting to update ref: teams/10/traffic_lights/${id} with data:`,
        updatedData
      );
      await set(dbRef, { ...tl, ...updatedData });
      /*
      updates.push({
        id: id,
        oldRed: oldRedDuration,
        newRed: newRedDuration,
        remainTimeUpdated: remainTimeUpdated
      });*/
    } catch (error) {
      console.error(`Error updating Firebase for ID ${id}:`, error);
    }
  });

  await Promise.all(updatePromises);

  console.log(
    `Finished calculation and update for Intersection ID: ${interID}`
  );
  return { success: true, updates };
}
