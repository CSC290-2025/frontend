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
import type { TrafficSignal } from '../types/traffic.types';

interface TrafficSettingPopupProps {
  open: boolean;
  signal: TrafficSignal | null;
  onOpenChange?: (open: boolean) => void;
  onSave?: (signal: TrafficSignal) => void;
}

export default function TrafficSettingPopup({
  open,
  signal,
  onOpenChange,
  onSave,
}: TrafficSettingPopupProps) {
  const [intersectionId, setIntersectionId] = useState(1);
  const [color, setColor] = useState<TrafficSignal['color']>('red');
  const [duration, setDuration] = useState(30);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<TrafficSignal | null>(
    null
  );
  const [Automode, setAutomode] = useState(true);
  const [greenduration, setGreenduration] = useState(30);
  const [redduration, setRedduration] = useState(120);

  // Sync local state when signal or open changes
  useEffect(() => {
    if (signal) {
      setIntersectionId(signal.intersectionId ?? 1);
      setColor(signal.color ?? 'red');
      setDuration(typeof signal.duration === 'number' ? signal.duration : 30);
    }
  }, [signal, open]);

  function handleSave() {
    if (!signal) return;
    const updated: TrafficSignal = {
      ...signal,
      intersectionId,
      color,
      duration: Number(duration),
      automode: Automode,
    };
    setPendingUpdate(updated);
    setConfirmOpen(true);
  }

  function handleConfirm() {
    if (pendingUpdate) {
      onSave?.(pendingUpdate);
      onOpenChange?.(false);
      setPendingUpdate(null);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Traffic light Settings</DialogTitle>
            <DialogDescription>
              View or edit settings for the selected traffic signal.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 py-2">
            <div>
              <label className="ml-2">Current Status</label>
              <div className="mt-1 flex flex-row gap-2 rounded-md bg-gray-200 p-2">
                <div className="row flex w-1/2 items-center gap-4 rounded-lg bg-white p-4 shadow-md">
                  {color == 'red' ? (
                    <div className="h-15 w-15 rounded-full bg-red-500"></div>
                  ) : color == 'yellow' ? (
                    <div className="h-15 w-15 rounded-full bg-yellow-400"></div>
                  ) : (
                    <div className="h-15 w-15 rounded-full bg-green-500"></div>
                  )}
                  <div className="mx-auto text-2xl font-bold">{duration}</div>
                </div>
                <div className="flex w-1/2 flex-col rounded-lg bg-white p-4 shadow-md">
                  <div className="ml-2 font-bold">
                    Intersection : {intersectionId}
                  </div>
                  <div className="ml-2 font-bold">
                    Light NO : {intersectionId}
                  </div>
                  <div className="ml-2 text-xs font-bold">
                    Location : แยกนาหลวง
                  </div>
                  <div className="ml-2 text-xs font-bold">
                    Auto-mode : {signal?.automode ? 'on' : 'off'}
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
                      value={greenduration}
                      onChange={(e) => setGreenduration(Number(e.target.value))}
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
                      value={redduration}
                      onChange={(e) => setRedduration(Number(e.target.value))}
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
        description={`Are you sure you want to change the traffic light NO.${intersectionId} at intersection ${intersectionId}? This process will impact the system`}
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
                  setColor(e.target.value as TrafficSignal['color'])
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
