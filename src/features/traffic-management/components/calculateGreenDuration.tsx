//GreenDuration
import { ref, update } from 'firebase/database';
import { getBaseAPIURL } from '@/lib/apiClient.ts'; // Assuming this function exists
import { loadGoogleMaps } from '@/features/traffic-management/lib/loadGoogleMaps.ts';
import { database as db } from '@/lib/firebase.ts';

// --- 1. Type Definitions for Custom API & Data Structure (Modified TrafficLightData) ---

interface Location {
  type: 'Point';
  coordinates: [number, number];
}

interface Intersection {
  id: number;
  location: Location;
}

interface RoadDetailsResponse {
  success: boolean;
  data: {
    road: object;
    startIntersection: Intersection;
    endIntersection: Intersection;
  };
}

interface TrafficLightData {
  green_duration: number;
  density_level: number;
  timestamp: string;
}

const updateRealtimeDatabase = async (
  trafficID: number,
  data: Partial<TrafficLightData>
): Promise<void> => {
  const dbPath = `teams/10/traffic_lights/${trafficID}`;
  const trafficRef = ref(db, dbPath);

  try {
    console.log(`[DB] Attempting to update ref: ${dbPath}`);
    await update(trafficRef, data);
    console.log(`✅ [DB] Successfully updated ${dbPath}`);
  } catch (error) {
    console.error(
      `🔴 [DB] Error updating Firebase reference ${dbPath}:`,
      error
    );
    throw error;
  }
};

// --- 4. The Main Calculation Function (UPDATED) ---

/**
 * Calculates real-time and non-traffic-dependent travel times for a road segment
 * using Google Maps Distance Matrix API and updates the Firebase Realtime Database.
 *
 * NOTE: This version ONLY takes trafficID, roadID, and interID.
 * It will NOT update green_duration or density_level in the database.
 *
 * @param trafficID The ID of the traffic light.
 * @param roadID The ID of the road segment to fetch coordinates for.
 * @param interID The ID of the intersection associated (for DB record).
 * @returns A promise that resolves when the calculation and update are complete.
 */
export async function calculateGreenDuration(
  trafficID: number,
  interID: number,
  roadID: number
): Promise<void> {
  const roadDetailsURL = getBaseAPIURL + `/roads/${roadID}/details`;
  let startCoords: google.maps.LatLngLiteral;
  let endCoords: google.maps.LatLngLiteral;

  // --- Step 1: Fetch Road Coordinates from Custom API ---
  try {
    const response = await fetch(roadDetailsURL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const apiResponse: RoadDetailsResponse = await response.json();

    // Coordinates are [longitude, latitude] in the response
    const [startLng, startLat] =
      apiResponse.data.startIntersection.location.coordinates;
    const [endLng, endLat] =
      apiResponse.data.endIntersection.location.coordinates;

    startCoords = { lat: startLat, lng: startLng };
    endCoords = { lat: endLat, lng: endLng };
  } catch (error) {
    console.error(
      `🔴 Error fetching road details for roadID ${roadID}:`,
      error
    );
    return;
  }

  // --- Step 2: Calculate Travel Time using Google Maps Distance Matrix API ---

  try {
    const google = await loadGoogleMaps();
    const service = new google.maps.DistanceMatrixService();

    const distanceResult = await new Promise<{
      realtime: number;
      normal: number;
    }>((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [startCoords],
          destinations: [endCoords],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          drivingOptions: {
            departureTime: new Date(), // REQUIRED for traffic
            trafficModel: google.maps.TrafficModel.BEST_GUESS,
          },
        },
        (response, status) => {
          if (status !== 'OK' || !response) {
            reject(`DistanceMatrix failed: ${status}`);
            return;
          }

          const element = response.rows[0]?.elements[0];

          if (!element || element.status !== 'OK') {
            reject(`Element error: ${element?.status}`);
            return;
          }

          resolve({
            realtime:
              element.duration_in_traffic?.value ?? element.duration.value,
            normal: element.duration.value,
          });
        }
      );
    });

    console.log(
      `✅ Google Maps Distance Matrix API response for TrafficID ${trafficID}:`,
      distanceResult
    );

    // Calculate green duration and density level here

    console.log(
      `TrafficID ${trafficID} - Realtime: ${distanceResult.realtime}s, Normal: ${distanceResult.normal}s`
    );

    const density_level = distanceResult.realtime / distanceResult.normal;
    let green_duration;
    if (density_level) {
      green_duration = 15 * density_level;
      if (green_duration > 60) {
        green_duration = 60;
      }
      green_duration = Math.round(green_duration);
    }

    // --- Step 3: Update Firebase Real-time Database (UPDATED) ---

    const updateData: Partial<TrafficLightData> = {
      green_duration: green_duration,
      density_level: density_level,
      timestamp: new Date().toISOString(),
    };

    await updateRealtimeDatabase(trafficID, updateData);
  } catch (error) {
    console.error(
      `🔴 Error during Maps calculation or Firebase update for roadID ${roadID}:`,
      error
    );
  }
}
