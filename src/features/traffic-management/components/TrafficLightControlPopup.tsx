import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getBaseAPIURL } from '@/lib/apiClient';
import { ref, update, get } from 'firebase/database';
import { database } from '@/lib/firebase';

interface SignalWithMeta {
  color: 'red' | 'yellow' | 'green';
  direction: string;
  lat: number;
  lng: number;
  online: boolean;
  remainingTime: number;
  timestamp: number;
  junctionId: string;
  source?: 'legacy' | 'backend'; // Track if this is from junctions (legacy) or traffic_lights (backend)
  trafficLightId?: string; // ID for traffic_lights updates (only for backend signals)
}

interface TrafficLightControlPopupProps {
  open: boolean;
  signal: SignalWithMeta | null;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export default function TrafficLightControlPopup({
  open,
  signal,
  onOpenChange,
  onUpdate,
}: TrafficLightControlPopupProps) {
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [greenDuration, setGreenDuration] = useState<number>(27);
  const [yellowDuration, setYellowDuration] = useState<number>(3);
  const [savingDurations, setSavingDurations] = useState(false);

  // Load current durations from Firebase when signal changes
  useEffect(() => {
    if (!signal) return;

    const loadDurations = async () => {
      try {
        const junctionRef = ref(database, `teams/10/junctions/${signal.junctionId}/lights/${signal.direction}`);
        const snapshot = await get(junctionRef);

        if (snapshot.exists()) {
          const lightData = snapshot.val();
          setGreenDuration(parseInt(lightData.greenDuration) || parseInt(lightData.duration) || 27);
          setYellowDuration(parseInt(lightData.yellowDuration) || 3);
        }
      } catch (err) {
        console.error('Failed to load durations:', err);
      }
    };

    loadDurations();
  }, [signal]);

  if (!signal) return null;

  const colorMap = {
    red: { bg: 'bg-red-500', name: 'Red', code: 1 },
    yellow: { bg: 'bg-yellow-400', name: 'Yellow', code: 2 },
    green: { bg: 'bg-green-500', name: 'Green', code: 3 },
  };

  const currentColorInfo = colorMap[signal.color];

  const handleForceGreen = async () => {
    setSwitching(true);
    setError(null);

    try {
      // 1. Update Firebase teams/10/junctions structure
      const junctionRef = ref(database, `teams/10/junctions/${signal.junctionId}/lights/${signal.direction}`);
      const junctionUpdate: any = {
        color: 'green',
        remainingTime: 60,
        timestamp: Date.now(),
      };

      // Store trafficLightId for cycle controller if this is a backend signal
      if (signal.trafficLightId) {
        junctionUpdate.trafficLightId = signal.trafficLightId;
      }

      await update(junctionRef, junctionUpdate);

      // 2. Update Firebase teams/10/traffic_lights structure
      // Find all lights matching this intersection
      const trafficLightsRef = ref(database, 'teams/10/traffic_lights');
      const snapshot = await get(trafficLightsRef);

      if (snapshot.exists()) {
        const allLights = snapshot.val();
        const firebaseUpdates: Record<string, any> = {};

        // Find lights that match this junction/intersection
        Object.entries(allLights).forEach(([key, lightData]: [string, any]) => {
          // Match by intersection ID or auto-generated junction ID
          const lightJunctionId = `junction-${lightData.interid || key}`;
          if (lightData.interid === signal.junctionId || lightJunctionId === signal.junctionId) {
            firebaseUpdates[`teams/10/traffic_lights/${key}/color`] = 3; // 3 = green in admin format
            firebaseUpdates[`teams/10/traffic_lights/${key}/remaintime`] = 60;
            firebaseUpdates[`teams/10/traffic_lights/${key}/timestamp`] = new Date().toISOString();
          }
        });

        if (Object.keys(firebaseUpdates).length > 0) {
          await update(ref(database), firebaseUpdates);
        }
      }

      // 3. Update backend API (only if this is not a legacy light)
      if (signal.source === 'backend') {
        const response = await fetch(
          `${getBaseAPIURL}/traffic-lights?intersection_id=${signal.junctionId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch intersection lights');
        }

        const data = await response.json();
        const lights = data?.data?.trafficLights || [];

        if (lights.length > 0) {
          const updatePromises = lights.map((light: any) => {
            const updatePayload = {
              current_color: 3, // 3 = green
              auto_mode: false, // Disable auto mode during manual override
              status: 0, // 0 = active
            };

            return fetch(`${getBaseAPIURL}/traffic-lights/${light.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatePayload),
            });
          });

          await Promise.all(updatePromises);
        }

        console.log(`✅ Junction ${signal.junctionId} manually switched to GREEN (Firebase + Backend updated)`);
      } else {
        console.log(`✅ Junction ${signal.junctionId} manually switched to GREEN (Firebase only - legacy light)`);
      }

      onUpdate?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to switch light:', err);
      setError(err instanceof Error ? err.message : 'Failed to switch light');
    } finally {
      setSwitching(false);
    }
  };

  const handleSaveDurations = async () => {
    setSavingDurations(true);
    setError(null);

    try {
      const junctionRef = ref(database, `teams/10/junctions/${signal.junctionId}/lights/${signal.direction}`);
      const durationUpdate: any = {
        greenDuration: greenDuration,
        yellowDuration: yellowDuration,
        duration: greenDuration, // Keep old duration field for backwards compatibility
      };

      // Store trafficLightId for cycle controller if this is a backend signal
      if (signal.trafficLightId) {
        durationUpdate.trafficLightId = signal.trafficLightId;
      }

      await update(junctionRef, durationUpdate);

      console.log(`✅ Updated durations for ${signal.junctionId} ${signal.direction}: Green=${greenDuration}s, Yellow=${yellowDuration}s`);

      onUpdate?.();
    } catch (err) {
      console.error('Failed to save durations:', err);
      setError(err instanceof Error ? err.message : 'Failed to save durations');
    } finally {
      setSavingDurations(false);
    }
  };

  const handleResumeAuto = async () => {
    setSwitching(true);
    setError(null);

    try {
      // 1. Update Firebase teams/10/junctions structure - reset to auto mode
      // Note: Auto mode is typically handled by the backend, so we just need to ensure
      // the data is not locked in manual override state
      const junctionRef = ref(database, `teams/10/junctions/${signal.junctionId}`);
      const junctionSnapshot = await get(junctionRef);

      if (junctionSnapshot.exists()) {
        const junctionData = junctionSnapshot.val();
        // Update all lights in this junction to resume normal operation
        const junctionUpdates: Record<string, any> = {};

        if (junctionData.lights) {
          Object.keys(junctionData.lights).forEach((direction) => {
            junctionUpdates[`teams/10/junctions/${signal.junctionId}/lights/${direction}/timestamp`] = Date.now();
          });

          if (Object.keys(junctionUpdates).length > 0) {
            await update(ref(database), junctionUpdates);
          }
        }
      }

      // 2. Update Firebase teams/10/traffic_lights structure
      const trafficLightsRef = ref(database, 'teams/10/traffic_lights');
      const snapshot = await get(trafficLightsRef);

      if (snapshot.exists()) {
        const allLights = snapshot.val();
        const firebaseUpdates: Record<string, any> = {};

        // Find lights that match this junction/intersection
        Object.entries(allLights).forEach(([key, lightData]: [string, any]) => {
          const lightJunctionId = `junction-${lightData.interid || key}`;
          if (lightData.interid === signal.junctionId || lightJunctionId === signal.junctionId) {
            firebaseUpdates[`teams/10/traffic_lights/${key}/timestamp`] = new Date().toISOString();
          }
        });

        if (Object.keys(firebaseUpdates).length > 0) {
          await update(ref(database), firebaseUpdates);
        }
      }

      // 3. Update backend API to resume auto mode (only if this is not a legacy light)
      if (signal.source === 'backend') {
        const response = await fetch(
          `${getBaseAPIURL}/traffic-lights?intersection_id=${signal.junctionId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch intersection lights');
        }

        const data = await response.json();
        const lights = data?.data?.trafficLights || [];

        if (lights.length > 0) {
          const updatePromises = lights.map((light: any) => {
            const updatePayload = {
              auto_mode: true, // Re-enable auto mode
              status: 0, // 0 = active
            };

            return fetch(`${getBaseAPIURL}/traffic-lights/${light.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatePayload),
            });
          });

          await Promise.all(updatePromises);
        }

        console.log(`✅ Junction ${signal.junctionId} resumed AUTO mode (Firebase + Backend updated)`);
      } else {
        console.log(`✅ Junction ${signal.junctionId} resumed AUTO mode (Firebase only - legacy light)`);
      }

      onUpdate?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to resume auto mode:', err);
      setError(err instanceof Error ? err.message : 'Failed to resume auto mode');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Traffic Light Control</DialogTitle>
          <DialogDescription>
            Manual control for Junction {signal.junctionId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Current Status
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-16 w-16 rounded-full ${currentColorInfo.bg}`} />
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {currentColorInfo.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {signal.remainingTime}s remaining
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  Direction: {signal.direction}
                </p>
                <p className="text-xs text-gray-500">
                  Junction: {signal.junctionId}
                </p>
              </div>
            </div>
          </div>

          {/* Duration Settings */}
          <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Light Duration Settings
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="greenDuration" className="text-sm text-gray-600">
                  Green Light Duration (seconds)
                </Label>
                <Input
                  id="greenDuration"
                  type="number"
                  min="1"
                  max="300"
                  value={greenDuration}
                  onChange={(e) => setGreenDuration(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="yellowDuration" className="text-sm text-gray-600">
                  Yellow Light Duration (seconds)
                </Label>
                <Input
                  id="yellowDuration"
                  type="number"
                  min="1"
                  max="10"
                  value={yellowDuration}
                  onChange={(e) => setYellowDuration(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center justify-between rounded bg-white p-2 text-sm">
                <span className="text-gray-600">Total Cycle Time:</span>
                <span className="font-bold text-gray-900">{greenDuration + yellowDuration}s</span>
              </div>
              <Button
                onClick={handleSaveDurations}
                disabled={savingDurations || greenDuration < 1 || yellowDuration < 1}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {savingDurations ? 'Saving...' : 'Save Duration Settings'}
              </Button>
            </div>
          </div>

          {/* Manual Controls */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">
              Manual Override
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={handleForceGreen}
                disabled={switching || signal.color === 'green'}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {switching ? 'Switching...' : 'Force Green'}
              </Button>
              <Button
                onClick={handleResumeAuto}
                disabled={switching}
                variant="outline"
                className="flex-1"
              >
                {switching ? 'Resuming...' : 'Resume Auto'}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              ⚠️ Manual override will disable automatic mode. Use "Resume Auto" to return to normal operation.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
