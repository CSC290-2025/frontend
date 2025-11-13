import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { TrafficSignal } from '../types/traffic.types';

interface TrafficSignalMarkerProps {
  signal: TrafficSignal;
  onUpdate?: (signal: TrafficSignal) => void;
}

const colorClasses: Record<TrafficSignal['color'], string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-400',
  green: 'bg-green-500',
};

export default function TrafficSignalMarker({
  signal,
  onUpdate,
}: TrafficSignalMarkerProps) {
  const [currentDuration, setCurrentDuration] = useState(signal.duration);
  const [currentColor, setCurrentColor] = useState(signal.color);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDuration((prev) => {
        if (prev <= 1) {
          // Switch to next color
          const nextColor =
            currentColor === 'red'
              ? 'green'
              : currentColor === 'green'
                ? 'yellow'
                : 'red';

          const nextDuration =
            nextColor === 'red' ? 45 : nextColor === 'green' ? 30 : 5;

          setCurrentColor(nextColor);

          if (onUpdate) {
            onUpdate({
              ...signal,
              color: nextColor,
              duration: nextDuration,
            });
          }

          return nextDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentColor, signal, onUpdate]);

  return (
    <div
      data-slot="traffic-signal-marker"
      className={cn(
        'flex size-12 cursor-pointer items-center justify-center rounded-full border-3 border-white text-base font-bold text-white shadow-lg transition-all hover:scale-110',
        colorClasses[currentColor]
      )}
      title={`Intersection: ${signal.intersectionId} - ${currentColor.toUpperCase()}`}
    >
      {currentDuration}
    </div>
  );
}
