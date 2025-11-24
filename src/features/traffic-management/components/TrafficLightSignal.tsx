import { cn } from '@/lib/utils';
import type { TrafficSignal } from '../types/traffic.types';

interface TrafficLightSignalProps {
  signal: TrafficSignal;
}

const colorClasses: Record<TrafficSignal['color'], string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
};

export default function TrafficLightSignal({
  signal,
}: TrafficLightSignalProps) {
  const { duration, color } = signal;

  return (
    <div
      data-slot="traffic-light-signal"
      className={cn(
        'flex size-10 cursor-pointer items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white shadow-lg transition-transform hover:scale-110',
        colorClasses[color]
      )}
      title={`Intersection: ${signal.intersectionId}`}
    >
      {duration}
    </div>
  );
}
