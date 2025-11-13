import { Card, CardContent } from '@/components/ui/card';
import { ClockIcon, MapPinIcon } from 'lucide-react';

interface RouteInfoProps {
  distance: string;
  duration: string;
  trafficCondition: 'low' | 'medium' | 'high';
}

const trafficColors = {
  low: 'text-green-500',
  medium: 'text-yellow-500',
  high: 'text-red-500',
};

export default function RouteInfo({
  distance,
  duration,
  trafficCondition,
}: RouteInfoProps) {
  return (
    <Card className="absolute top-4 left-4 z-10 min-w-[200px]">
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center gap-2">
          <MapPinIcon className="size-4" />
          <span className="font-semibold">{distance}</span>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="size-4" />
          <span className={trafficColors[trafficCondition]}>{duration}</span>
        </div>
      </CardContent>
    </Card>
  );
}
