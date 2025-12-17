import type {
  Incident,
  IncidentStatus,
} from '@/features/emergency/interfaces/incident.ts';
import { cn } from '@/lib/utils';
import { Plus, Minus, Navigation, MapPin } from 'lucide-react'; // Added icons for map controls

interface MapViewProps {
  incidents: Incident[];
  onSelectIncident?: (incident: Incident) => void;
}

const statusConfig: Record<
  IncidentStatus,
  { color: string; label: string; ring: string }
> = {
  pending: {
    color: 'bg-amber-500',
    label: 'Pending',
    ring: 'ring-amber-500/30',
  },
  verified: { color: 'bg-sky-500', label: 'Verified', ring: 'ring-sky-500/30' },
  dispatched: {
    color: 'bg-rose-500',
    label: 'Dispatched',
    ring: 'ring-rose-500/30',
  },
  resolved: {
    color: 'bg-emerald-500',
    label: 'Resolved',
    ring: 'ring-emerald-500/30',
  },
  false_alarm: {
    color: 'bg-slate-400',
    label: 'False Alarm',
    ring: 'ring-slate-400/30',
  },
};

export function MapView({ incidents, onSelectIncident }: MapViewProps) {
  const centerLat = 13.7563;
  const centerLng = 100.5018;

  return (
    // Responsive height: min-h-[300px] on mobile, min-h-[500px] on desktop
    <div className="group relative h-full min-h-[300px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner select-none lg:min-h-[500px]">
      {/* 1. Tech Background Pattern (Dot Matrix) */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* 2. Floating Legend (Glassmorphism) */}
      <div className="absolute top-4 left-4 z-20 hidden rounded-xl border border-white/50 bg-white/80 p-3 shadow-lg backdrop-blur-md sm:block md:p-4">
        <h3 className="mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase">
          Live Status
        </h3>
        <div className="space-y-2.5">
          {(Object.keys(statusConfig) as IncidentStatus[]).map((status) => (
            <div key={status} className="flex items-center gap-3">
              <span className={cn('relative flex h-2.5 w-2.5')}>
                <span
                  className={cn(
                    'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                    statusConfig[status].color
                  )}
                ></span>
                <span
                  className={cn(
                    'relative inline-flex h-2.5 w-2.5 rounded-full',
                    statusConfig[status].color
                  )}
                ></span>
              </span>
              <span className="text-sm font-medium text-slate-700">
                {statusConfig[status].label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Map Controls (Mock) */}
      <div className="absolute right-6 bottom-6 z-20 flex flex-col gap-2">
        <button className="rounded-lg border border-slate-100 bg-white p-2 text-slate-600 shadow-md transition-colors hover:bg-slate-50">
          <Navigation className="h-5 w-5" />
        </button>
        <div className="flex flex-col overflow-hidden rounded-lg border border-slate-100 bg-white shadow-md">
          <button className="border-b border-slate-100 p-2 text-slate-600 hover:bg-slate-50">
            <Plus className="h-5 w-5" />
          </button>
          <button className="p-2 text-slate-600 hover:bg-slate-50">
            <Minus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 4. Incident Markers */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-full max-h-[500px] w-full max-w-4xl">
          {incidents.map((incident) => {
            // Logic for Mock Positioning
            const x = 20 + (incident.longitude - centerLng + 0.1) * 300;
            const y = 30 + (centerLat - incident.latitude + 0.05) * 400;
            const config = statusConfig[incident.status];
            const isSOS = incident.isSOS && incident.status === 'pending';

            return (
              <div
                key={incident.id}
                onClick={() => onSelectIncident?.(incident)}
                className={cn(
                  'group pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 transform cursor-pointer',
                  'transition-all duration-300 hover:z-50 hover:scale-110',
                  'z-10'
                )}
                style={{
                  left: `${Math.min(Math.max(x, 10), 90)}%`,
                  top: `${Math.min(Math.max(y, 10), 90)}%`,
                }}
              >
                {/* Tooltip on Hover */}
                <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block">
                  <div className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-xs text-white shadow-lg">
                    <MapPin className="h-3 w-3" />
                    <span>{incident.category || 'Emergency'}</span>
                  </div>
                  {/* Tooltip Arrow */}
                  <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-t-[4px] border-r-[4px] border-l-[4px] border-t-slate-800 border-r-transparent border-l-transparent"></div>
                </div>

                {/* Marker Visual */}
                <div className="relative">
                  {/* Ripple Effect for SOS */}
                  {isSOS && (
                    <>
                      <div
                        className={cn(
                          'absolute -inset-4 animate-ping rounded-full opacity-75',
                          config.color
                        )}
                      />
                      <div
                        className={cn(
                          'absolute -inset-2 animate-pulse rounded-full opacity-50',
                          config.color
                        )}
                      />
                    </>
                  )}

                  {/* Main Dot */}
                  <div
                    className={cn(
                      'h-4 w-4 rounded-full border-[3px] border-white shadow-lg transition-shadow',
                      config.color,
                      'group-hover:shadow-xl group-hover:ring-2',
                      config.ring
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Location Label */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/60 px-3 py-1 text-[10px] font-medium tracking-widest whitespace-nowrap text-slate-500 uppercase backdrop-blur-sm">
        Bangkok Metropolitan Area
      </div>
    </div>
  );
}
