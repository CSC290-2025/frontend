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
  const [intersectionId, setIntersectionId] = useState('');
  const [color, setColor] = useState<TrafficSignal['color']>('red');
  const [duration, setDuration] = useState(30);

  // Sync local state when signal or open changes
  useEffect(() => {
    if (signal) {
      setIntersectionId(signal.intersectionId ?? '');
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
    };
    onSave?.(updated);
    onOpenChange?.(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Traffic Signal Settings</DialogTitle>
          <DialogDescription>
            View or edit settings for the selected traffic signal.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-1 gap-1">
            <label className="text-sm font-medium">Intersection ID</label>
            <input
              value={intersectionId}
              onChange={(e) => setIntersectionId(e.target.value)}
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
  );
}
