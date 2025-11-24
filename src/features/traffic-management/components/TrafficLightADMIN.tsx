import { cn } from '@/lib/utils';
import type { trafficLight } from '../types/traffic.types';

interface TrafficLightSignalProps {
  Light: trafficLight;
}

const colorClasses: Record<'red' | 'yellow' | 'green', string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
};

export default function TrafficLightSignal({ Light }: TrafficLightSignalProps) {
  const { status, current_color } = Light;

  return (
    <div
      data-slot="traffic-light-signal"
      className="flex size-10 cursor-pointer items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white shadow-lg transition-transform hover:scale-110"
      title={`Intersection: ${Light.intersection_id}`}
    >
      {Light.status}
    </div>
  );
}
