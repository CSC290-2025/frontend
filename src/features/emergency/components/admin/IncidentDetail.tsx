import type {
  Incident,
  IncidentStatus,
} from '@/features/emergency/types/incident';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Phone,
  MapPin,
  Clock,
  Image as ImageIcon,
  CheckCircle,
  Truck,
  XCircle,
  AlertTriangle,
  BellRing,
  Copy,
  Navigation,
  User,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useNotification } from '@/features/emergency/contexts/notification.tsx';
import { apiClient } from '@/lib/apiClient.ts';

interface IncidentDetailProps {
  incident: Incident;
  onStatusChange: (status: IncidentStatus) => void;
  onBroadcast: () => void;
  id: number;
  address?: string;
  description: string;
}

// Workflow Configuration
const statusFlow: { status: IncidentStatus; label: string; icon: any }[] = [
  { status: 'pending', label: 'Pending', icon: Clock },
  { status: 'verified', label: 'Verified', icon: CheckCircle },
  { status: 'dispatched', label: 'Dispatched', icon: Truck },
  { status: 'resolved', label: 'Resolved', icon: CheckCircle },
];

const categoryConfig: Record<string, string> = {
  fire: 'Fire',
  accident: 'Traffic Accident',
  medical: 'Medical Emergency',
  crime: 'Crime',
  natural_disaster: 'Natural Disaster',
  other: 'General Assistance',
};

export function IncidentDetail({
  incident,
  onStatusChange,
  onBroadcast,
  address,
  description,
  id,
}: IncidentDetailProps) {
  const currentStatusIndex = statusFlow.findIndex(
    (s) => s.status === incident.status
  );
  const { sendAllNotification } = useNotification();
  const activeStepIndex =
    incident.status === 'false_alarm' ? -1 : currentStatusIndex;

  const updateReport = async (id: string) => {
    await apiClient.put(`/emergency/reports/${id}`, { status: 'verified' });
  };

  return (
    // Main Container: h-full ensures it takes available height, flex-col organizes Header vs Grid
    <div className="flex h-full flex-col overflow-hidden bg-slate-50/50">
      {/* 1. Header Section (Fixed Height: shrink-0) */}
      <div className="shrink-0 border-b border-slate-200 bg-white p-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Incident #{incident.id}
              </h2>
            </div>
            <p className="flex items-center text-xs text-slate-500">
              <Clock className="mr-1.5 h-3.5 w-3.5" />
              {format(incident.createdAt, 'dd MMM, HH:mm', { locale: enUS })}
            </p>
          </div>

          <div className="flex gap-2">
            {/* Moved Images to Dialog to save space for the grid */}
            {incident.images && incident.images.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {incident.images.length} Photos
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Attached Media</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                    {incident.images.map((img, i) => (
                      <div
                        key={i}
                        className="flex aspect-video items-center justify-center rounded-lg bg-slate-100"
                      >
                        <ImageIcon className="h-8 w-8 text-slate-300" />
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Compact Status Stepper */}
      </div>

      {/* 2. Content Area (Flex-1 fills remaining space) */}
      <div className="min-h-0 flex-1 p-4">
        {/* Grid: h-full forces it to fill the container, grid-rows-2 splits height evenly */}
        <div className="grid h-full grid-cols-1 grid-rows-2 gap-4 xl:grid-cols-2">
          {/* Cell 1: Situation Report */}
          <div className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-900">
              <div className="h-4 w-1 rounded-full bg-blue-500" />
              Situation Report
            </h3>
            {/* Scrollable content area inside the box */}
            <div className="flex-1 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-sm leading-relaxed text-slate-700">
                {incident.description}
              </p>
            </div>
          </div>

          {/* Cell 2: Location */}
          <div className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex shrink-0 items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <div className="h-4 w-1 rounded-full bg-emerald-500" />
                Location
              </h3>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
              <div className="mb-2 shrink-0 rounded-full bg-white p-2 shadow-sm">
                <MapPin className="h-5 w-5 text-red-500" />
              </div>
              <p className="mb-1 line-clamp-2 text-sm font-medium text-slate-900">
                {incident.address}
              </p>
            </div>
          </div>

          {/* Cell 4: Reporter */}

          <div className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 shrink-0 text-sm font-semibold text-slate-900">
              Command Actions
            </h3>

            <div className="flex flex-1 flex-col justify-center overflow-y-auto">
              {incident.status === 'false_alarm' ||
              incident.status === 'resolved' ? (
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center">
                  <CheckCircle className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                  <p className="text-sm font-medium text-slate-600">
                    Case Closed
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      sendAllNotification('Test5', 'jjjjddd');
                      updateReport(id.toString());
                    }}
                    className="h-9 w-full bg-blue-600 text-sm"
                  >
                    <CheckCircle className="mr-2 h-3.5 w-3.5" /> Verify
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
