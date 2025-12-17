import { Button } from '@/components/ui/button';
import { SlidersHorizontalIcon, AlertTriangleIcon } from 'lucide-react';
import { cn } from '@/lib/utils.ts';

interface ControlPanelProps extends React.ComponentProps<'div'> {
  onMapSettingsClick: () => void;
}

export default function ControlPanel({
  onMapSettingsClick,
  className,
}: ControlPanelProps) {
  return (
    <div
      className={cn(
        'absolute top-4 right-4 z-10 mt-12 flex flex-col gap-2',
        className
      )}
    >
      <Button
        onClick={onMapSettingsClick}
        className="rounded-full bg-blue-600 px-6 py-6 text-white shadow-lg hover:bg-blue-700"
      >
        <SlidersHorizontalIcon className="mr-2 size-5" />
        Map Setting
      </Button>
    </div>
  );
}
