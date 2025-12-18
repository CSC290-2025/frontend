import type {
  Incident,
  IncidentStatus,
} from '@/features/emergency/interfaces/incident.ts';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Flame,
  Car,
  Heart,
  ShieldAlert,
  CloudRain,
  HelpCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface IncidentFeedProps {
  incidents: Incident[];
  maxItems?: number;
  onSelectIncident?: (incident: Incident) => void;
}

// Unified Configuration for Categories
const categoryConfig = {
  fire: { icon: Flame, label: 'Fire', color: 'text-orange-600 bg-orange-100' },
  accident: {
    icon: Car,
    label: 'Accident',
    color: 'text-blue-600 bg-blue-100',
  },
  medical: {
    icon: Heart,
    label: 'Medical',
    color: 'text-rose-600 bg-rose-100',
  },
  crime: {
    icon: ShieldAlert,
    label: 'Crime',
    color: 'text-purple-600 bg-purple-100',
  },
  natural_disaster: {
    icon: CloudRain,
    label: 'Disaster',
    color: 'text-cyan-600 bg-cyan-100',
  },
  other: {
    icon: HelpCircle,
    label: 'Other',
    color: 'text-slate-600 bg-slate-100',
  },
};

// Unified Configuration for Status
const statusConfig: Record<IncidentStatus, { label: string; style: string }> = {
  pending: {
    label: 'Pending',
    style: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  },
  verified: {
    label: 'Verified',
    style: 'bg-sky-100 text-sky-700 hover:bg-sky-200',
  },
  dispatched: {
    label: 'Dispatched',
    style: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
  },
  resolved: {
    label: 'Resolved',
    style: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  },
  false_alarm: {
    label: 'False Alarm',
    style: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
  },
};

export function IncidentFeed({
  incidents,
  maxItems = 10,
  onSelectIncident,
}: IncidentFeedProps) {
  const displayIncidents = incidents.slice(0, maxItems);

  return (
    <div className="space-y-3">
      {displayIncidents.map((incident) => {
        const config =
          categoryConfig[incident.category] || categoryConfig.other;
        const Icon = config.icon;
        const isSOS = incident.isSOS && incident.status === 'pending';

        return (
          <div
            key={incident.id}
            onClick={() => onSelectIncident?.(incident)}
            className={cn(
              'group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3 transition-all duration-300 md:p-4',
              'cursor-pointer hover:border-slate-300 hover:shadow-md',
              // Subtle background tint for SOS
              isSOS && 'border-red-200 bg-red-50/50 hover:border-red-300'
            )}
          >
            {/* SOS Indicator Strip (Left Side) */}
            {isSOS && (
              <div className="absolute top-0 bottom-0 left-0 w-1 animate-pulse bg-red-500" />
            )}

            <div className="flex gap-3 md:gap-4">
              {/* Icon Box */}
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 md:h-12 md:w-12',
                  config.color
                )}
              >
                <Icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>

              {/* Content Area */}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900 md:text-base">
                      {config.label}
                    </h4>
                    {isSOS && (
                      <span className="flex animate-pulse items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        SOS
                      </span>
                    )}
                  </div>
                  {/* Timestamp */}
                  <span className="ml-2 flex items-center text-[10px] whitespace-nowrap text-slate-400 md:text-[11px]">
                    <Clock className="mr-1 h-3 w-3" />
                    {formatDistanceToNow(incident.createdAt, {
                      addSuffix: true,
                      locale: enUS,
                    })}
                  </span>
                </div>

                <p className="mb-2 line-clamp-1 text-xs text-slate-600 md:text-sm">
                  {incident.description}
                </p>

                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'border-0 px-2.5 text-[10px] font-medium md:text-xs',
                      statusConfig[incident.status].style
                    )}
                  >
                    {statusConfig[incident.status].label}
                  </Badge>

                  {/* Hover Arrow Indicator */}
                  <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-500" />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {displayIncidents.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
          <div className="mb-3 rounded-full bg-slate-100 p-3">
            <Clock className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-900">
            No recent incidents
          </p>
          <p className="text-xs text-slate-500">
            New alerts will appear here automatically.
          </p>
        </div>
      )}
    </div>
  );
}
