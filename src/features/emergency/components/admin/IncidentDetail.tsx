import type {
  Incident,
  IncidentStatus,
} from '@/features/emergency/interfaces/incident';
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

interface IncidentDetailProps {
  incident: Incident;
  onStatusChange: (status: IncidentStatus) => void;
  onBroadcast: () => void;
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
}: IncidentDetailProps) {
  const currentStatusIndex = statusFlow.findIndex(
    (s) => s.status === incident.status
  );
  const activeStepIndex =
    incident.status === 'false_alarm' ? -1 : currentStatusIndex;

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
              {incident.isSOS && (
                <span className="flex animate-pulse items-center gap-1 rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  SOS
                </span>
              )}
              <Badge
                variant="outline"
                className="border-slate-200 bg-slate-50 text-slate-600"
              >
                {categoryConfig[incident.category] || 'Unknown'}
              </Badge>
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

            <Button
              onClick={onBroadcast}
              variant="outline"
              size="sm"
              className="h-9 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
            >
              <BellRing className="mr-2 h-4 w-4" />
              Broadcast
            </Button>
          </div>
        </div>

        {/* Compact Status Stepper */}
        <div className="relative mt-6 px-2">
          <div className="absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 rounded-full bg-slate-100" />
          <div
            className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full bg-slate-900 transition-all duration-500"
            style={{
              width:
                activeStepIndex >= 0
                  ? `${(activeStepIndex / (statusFlow.length - 1)) * 100}%`
                  : '0%',
            }}
          />
          <div className="relative flex justify-between">
            {statusFlow.map((step, index) => {
              const isActive = index <= activeStepIndex;
              const Icon = step.icon;
              return (
                <div key={step.status} className="flex flex-col items-center">
                  <div
                    className={cn(
                      'z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white',
                      isActive
                        ? 'border-slate-900 text-slate-900'
                        : 'border-slate-200 text-slate-300'
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
              >
                <Navigation className="mr-1 h-3 w-3" />
                Map
              </Button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
              <div className="mb-2 shrink-0 rounded-full bg-white p-2 shadow-sm">
                <MapPin className="h-5 w-5 text-red-500" />
              </div>
              <p className="mb-1 line-clamp-2 text-sm font-medium text-slate-900">
                {incident.address}
              </p>
              <p className="flex items-center gap-2 font-mono text-xs text-slate-500">
                {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                <Copy className="h-3 w-3 cursor-pointer hover:text-slate-700" />
              </p>
            </div>
          </div>

          {/* Cell 3: Command Actions */}
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
                  {incident.status === 'pending' && (
                    <Button
                      onClick={() => onStatusChange('verified')}
                      className="h-9 w-full bg-blue-600 text-sm"
                    >
                      <CheckCircle className="mr-2 h-3.5 w-3.5" /> Verify
                    </Button>
                  )}
                  {incident.status === 'verified' && (
                    <Button
                      onClick={() => onStatusChange('dispatched')}
                      className="h-9 w-full bg-red-600 text-sm"
                    >
                      <Truck className="mr-2 h-3.5 w-3.5" /> Dispatch
                    </Button>
                  )}
                  {incident.status === 'dispatched' && (
                    <Button
                      onClick={() => onStatusChange('resolved')}
                      className="h-9 w-full bg-emerald-600 text-sm"
                    >
                      <CheckCircle className="mr-2 h-3.5 w-3.5" /> Resolve
                    </Button>
                  )}
                  <Button
                    onClick={() => onStatusChange('false_alarm')}
                    variant="ghost"
                    className="h-8 w-full text-xs text-slate-500"
                  >
                    Mark False Alarm
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Cell 4: Reporter */}
          <div className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 shrink-0 text-sm font-semibold text-slate-900">
              Reporter Profile
            </h3>
            <div className="flex flex-1 flex-col justify-center overflow-hidden">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 font-bold text-indigo-600">
                  {incident.userName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {incident.userName}
                  </p>
                  <p className="text-xs text-slate-500">Civilian</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate font-mono text-xs text-slate-700">
                    {incident.userPhone}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Copy className="h-3 w-3 text-slate-400" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
