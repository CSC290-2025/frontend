import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
import { SlidersHorizontalIcon, AlertTriangleIcon } from 'lucide-react';

interface ControlPanelProps {
  onMapSettingsClick: () => void;
  onEmergencyClick: () => void;
}

export default function ControlPanel({
  onMapSettingsClick,
  onEmergencyClick,
}: ControlPanelProps) {
  return (
    <div className="absolute top-4 right-4 z-10 mt-12 flex flex-col gap-2">
      <Button
        onClick={onMapSettingsClick}
        className="rounded-full bg-blue-600 px-6 py-6 text-white shadow-lg hover:bg-blue-700"
      >
        <SlidersHorizontalIcon className="mr-2 size-5" />
        Map Setting
      </Button>

      <Button
        onClick={onEmergencyClick}
        className="rounded-full bg-red-600 px-6 py-6 text-white shadow-lg hover:bg-red-700"
      >
        <AlertTriangleIcon className="mr-2 size-5" />
        Emergency request
      </Button>
    </div>
  );
}
