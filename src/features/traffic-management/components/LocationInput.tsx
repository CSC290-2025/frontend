import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';

interface LocationInputProps {
  currentLocation: string;
  destination: string;
  onCurrentLocationChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onStart: () => void;
}

export default function LocationInput({
  currentLocation,
  destination,
  onCurrentLocationChange,
  onDestinationChange,
  onStart,
}: LocationInputProps) {
  return (
    <div className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white px-4 py-2 shadow-lg">
      <Input
        placeholder="current Location"
        value={currentLocation}
        onChange={(e) => onCurrentLocationChange(e.target.value)}
        className="min-w-[200px] rounded-full border-none shadow-none"
      />

      <ArrowRightIcon className="size-10 text-gray-400" />

      <Input
        placeholder="destination"
        value={destination}
        onChange={(e) => onDestinationChange(e.target.value)}
        className="min-w-[200px] rounded-full border-none shadow-none"
      />

      <Button
        onClick={onStart}
        className="rounded-full bg-blue-600 px-8 text-white hover:bg-blue-700"
      >
        Start
      </Button>
    </div>
  );
}
