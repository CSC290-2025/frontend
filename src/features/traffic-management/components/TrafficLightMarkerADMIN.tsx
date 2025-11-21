import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { trafficLight } from '../types/traffic.types';

interface TrafficSignalMarkerProps {
  Light: trafficLight;
  onUpdate?: (Light: trafficLight) => void;
}

/*const colorClasses: Record<'red' | 'yellow' | 'green', string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-400',
  green: 'bg-green-500',
};*/

export default function TrafficSignalMarker({
  Light,
  onUpdate,
}: TrafficSignalMarkerProps) {
  const [currentDuration, setCurrentDuration] = useState(Light.status);
  const [currentColor, setCurrentColor] = useState(Light.current_color);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDuration((prev) => {
        if (prev <= 1) {
          // Switch to next color
          const nextColor = currentColor === 1 ? 3 : currentColor === 3 ? 2 : 1;

          const nextDuration =
            nextColor === 1
              ? Light.red_duration
              : nextColor === 3
                ? Light.green_duration
                : 3;

          setCurrentColor(nextColor);

          if (onUpdate) {
            onUpdate({
              ...Light,
            });
          }

          return nextDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentColor, Light, onUpdate]);

  return (
    <div
      data-slot="traffic-signal-marker"
      className="flex size-12 cursor-pointer items-center justify-center rounded-full border-3 border-white text-base font-bold text-white shadow-lg transition-all hover:scale-110"
      title={`Intersection: ${Light.intersection_id} - ${Light.current_color}`}
    >
      {Light.status}
    </div>
  );
}
