import { useEffect, useState } from 'react';
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
import ConfirmPopup from './Comfirmpopup';
import type { trafficLight } from '../types/traffic.types';
import { putTrafficLight } from '../api/signal.api';
import { set } from 'firebase/database';

interface TrafficSettingPopupProps {
  open: boolean;
  trafficLight: trafficLight | null;
  onOpenChange: (open: boolean) => void;
  onSave?: (trafficLight: trafficLight) => void;
}

export default function TrafficSettingPopup({
  open,
  trafficLight,
  onOpenChange,
  onSave,
}: TrafficSettingPopupProps) {
  const [intersectionId, setIntersectionId] = useState(
    trafficLight?.intersection_id ?? 0
  );
  const [TrafficID, setTrafficID] = useState(trafficLight?.id ?? 0);
  const [color, setColor] = useState(trafficLight?.current_color);
  const [duration, setDuration] = useState(trafficLight?.status);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<trafficLight | null>(null);
  const [Automode, setAutomode] = useState(trafficLight?.auto_mode);
  const [greenduration, setGreenduration] = useState(
    trafficLight?.green_duration
  );
  const [redduration, setRedduration] = useState(trafficLight?.red_duration);

  // Sync local state when the traffic light or open changes
  useEffect(() => {
    if (trafficLight) {
      setIntersectionId(trafficLight.intersection_id);
      setTrafficID(trafficLight.id);

      (async () => {
        try {
          const base = import.meta.env.VITE_API_BASE_URL ?? '';
          const url = `http://localhost:3333/traffic-lights/${trafficLight.id}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error('Failed to fetch traffic light');
          const response: any = await res.json();

          console.log('This traffic light data:', response);

          console.log('Current traffic data:', response.data.trafficLight);
          // Normalize current_color (API may return number or string)
          setColor(response.data.trafficLight.current_color);
          setGreenduration(response.data.trafficLight.green_duration);
          setRedduration(response.data.trafficLight.red_duration);
          setAutomode(response.data.trafficLight.auto_mode);
        } catch (err) {
          console.error('Error loading traffic light details', err);
          // fallback to values from the provided signal
          setColor(trafficLight.current_color);
          setGreenduration(trafficLight.green_duration ?? greenduration);
          setRedduration(trafficLight.red_duration ?? redduration);
          setAutomode(trafficLight.auto_mode ?? Automode);
        }
      })();
      setDuration(
        typeof trafficLight.status === 'number' ? trafficLight.status : 0
      );
    }
  }, [trafficLight, open]);

  function handleSave() {
    if (!trafficLight) return;
    const updated: trafficLight = {
      ...trafficLight,
      // ensure we carry UI-edited values into the pending update
      green_duration: greenduration ?? trafficLight.green_duration,
      red_duration: redduration ?? trafficLight.red_duration,
      auto_mode: Automode ?? trafficLight.auto_mode,
      // status/current_color come from duration/color state
      status:
        typeof duration === 'number' && duration > 0
          ? duration
          : trafficLight.status,
      current_color:
        typeof color === 'number' && color > 0
          ? color
          : trafficLight.current_color,
    };
    setPendingUpdate(updated);
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    if (!pendingUpdate) return;

    // Build request body following the API shape (snake_case)
    const body = {
      status: pendingUpdate.status,
      current_color: pendingUpdate.current_color,
      auto_mode: pendingUpdate.auto_mode,
      ip_address: pendingUpdate.ip_address,
      location: pendingUpdate.location,
      density_level: pendingUpdate.density_level,
      green_duration: pendingUpdate.green_duration,
      red_duration: pendingUpdate.red_duration,
      last_color: pendingUpdate.last_color,
    } as any;

    try {
      const updatedFromServer = await putTrafficLight(TrafficID, body);

      // Call onSave with the updated record (prefer server response)
      onSave?.(updatedFromServer ?? pendingUpdate);
      onOpenChange(false);
      setPendingUpdate(null);
      setConfirmOpen(false);
    } catch (err) {
      console.error('Error updating traffic light', err);
      alert('Error saving traffic light. See console for details.');
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Traffic light Settings</DialogTitle>
            <DialogDescription>
              View or edit settings for the selected traffic light.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 py-2">
            <div>
              <label className="ml-2">Current Status</label>
              <div className="mt-1 flex flex-row gap-2 rounded-md bg-gray-200 p-2">
                <div className="row flex w-1/2 items-center gap-4 rounded-lg bg-white p-4 shadow-md">
                  {color == 1 ? (
                    <div className="h-15 w-15 rounded-full bg-red-500"></div>
                  ) : color == 2 ? (
                    <div className="h-15 w-15 rounded-full bg-yellow-400"></div>
                  ) : (
                    <div className="h-15 w-15 rounded-full bg-green-500"></div>
                  )}
                  <div className="mx-auto text-2xl font-bold">{duration}</div>
                </div>
                <div className="flex w-1/2 flex-col rounded-lg bg-white p-4 shadow-md">
                  <div className="ml-2 font-bold">
                    Intersection : {trafficLight?.intersection_id}
                  </div>
                  <div className="ml-2 font-bold">
                    Light NO : {trafficLight?.id}
                  </div>
                  <div className="ml-2 text-xs font-bold">
                    Location : wait for connect with road
                  </div>
                  <div className="ml-2 text-xs font-bold">
                    Auto-mode : {Automode ? 'on' : 'off'}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="ml-2">Edit Traffic light</label>
              <div className="mt-1 flex flex-col gap-2 rounded-md bg-gray-200 p-2">
                <div className="flex w-full items-center gap-4 rounded-lg bg-white p-4 shadow-md">
                  <div className="h-15 w-15 rounded-full bg-red-500"></div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium">
                      Red Duration (seconds)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={redduration}
                      onChange={(e) => setRedduration(Number(e.target.value))}
                      className="rounded-md border px-3 py-2"
                    />
                  </div>
                </div>
                <div className="row flex w-full items-center gap-4 rounded-lg bg-white p-4 shadow-md">
                  <div className="h-15 w-15 rounded-full bg-green-500"></div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium">
                      Green Duration (seconds)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={greenduration}
                      onChange={(e) => setGreenduration(Number(e.target.value))}
                      className="rounded-md border px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => setAutomode(!Automode)}
                    className={`rounded-md px-6 py-2 font-medium text-white transition-all ${
                      Automode
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-400 hover:bg-gray-500'
                    }`}
                  >
                    {Automode ? 'Auto Mode: ON' : 'Auto Mode: OFF'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmPopup
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Traffic light Settings"
        description={`Are you sure you want to change the traffic light NO.${trafficLight?.id} at intersection ${trafficLight?.intersection_id}? This process will impact the system`}
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={handleConfirm}
      />
    </>
  );
}

{
  /*<div className="grid grid-cols-1 gap-1">
              <label className="text-sm font-medium">Current status</label>
              <input
                value={intersectionId}
                onChange={(e) => setIntersectionId(Number(e.target.value))}
                className="rounded-md border px-3 py-2"
                readOnly
              />
            </div>

                <div className="grid grid-cols-1 gap-1">
              <label className="text-sm font-medium">Color</label>
              <select
                value={color}
                onChange={(e) =>
                  setColor(e.target.value as TrafficLight['color'])
                }
                className="rounded-md border px-3 py-2"
              >
                <option value="red">Red</option>
                <option value="yellow">Yellow</option>
                <option value="green">Green</option>
              </select>
            </div> 
            
            <div className="grid grid-cols-1 gap-1">
              <label className="text-sm font-medium">Duration (seconds)</label>
              <input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="rounded-md border px-3 py-2"
              />
            </div>*/
}
