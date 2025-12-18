import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface IncidentFeedProps {
  incidents: Incident[];
  maxItems?: number;
}

const categoryIcons = {
  fire: Flame,
  accident: Car,
  medical: Heart,
  crime: ShieldAlert,
  natural_disaster: CloudRain,
  other: HelpCircle,
};

const categoryLabels = {
  fire: 'Fire',
  accident: 'Accident',
  medical: 'Medical',
  crime: 'Crime',
  natural_disaster: 'Natural Disaster',
  other: 'Other',
};

const statusLabels: Record<IncidentStatus, string> = {
  pending: 'Pending',
  verified: 'Verified',
  dispatched: 'Dispatched',
  resolved: 'Resolved',
  false_alarm: 'False Alarm',
};

const statusStyles: Record<IncidentStatus, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  verified: 'bg-info/10 text-info border-info/20',
  dispatched: 'bg-primary/10 text-primary border-primary/20',
  resolved: 'bg-success/10 text-success border-success/20',
  false_alarm: 'bg-muted text-muted-foreground border-border',
};

export function IncidentFeed({ incidents, maxItems = 10 }: IncidentFeedProps) {
  const navigate = useNavigate();
  const displayIncidents = incidents.slice(0, maxItems);

  return (
    <div className="space-y-3">
      {displayIncidents.map((incident) => {
        const Icon = categoryIcons[incident.category];
        return (
          <div
            key={incident.id}
            onClick={() => navigate(`/incidents/${incident.id}`)}
            className={cn(
              'card-elevated cursor-pointer p-4 transition-all',
              'hover:border-primary/50 animate-slide-in',
              incident.isSOS &&
                incident.status === 'pending' &&
                'border-primary bg-primary/5 animate-alert-pulse'
            )}
          >
            <div className="flex items-start gap-3">
              {/* Category Icon */}
              <div
                className={cn(
                  'flex-shrink-0 rounded-xl p-2.5',
                  incident.status === 'pending'
                    ? 'bg-warning/10'
                    : 'bg-secondary'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    incident.status === 'pending'
                      ? 'text-warning'
                      : 'text-muted-foreground'
                  )}
                />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-2">
                  {incident.isSOS && (
                    <Badge className="bg-primary text-primary-foreground h-5 rounded-md px-2 py-0.5 text-[10px]">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      SOS
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      'h-5 rounded-md px-2 py-0.5 text-[10px]',
                      statusStyles[incident.status]
                    )}
                  >
                    {statusLabels[incident.status]}
                  </Badge>
                </div>

                <p className="text-foreground truncate text-sm font-medium">
                  {categoryLabels[incident.category]}:{' '}
                  {incident.description.slice(0, 40)}...
                </p>

                <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(incident.createdAt, {
                      addSuffix: true,
                      locale: enUS,
                    })}
                  </span>
                </div>
              </div>

              {/* SOS Indicator */}
              {incident.isSOS && incident.status === 'pending' && (
                <div className="bg-primary h-3 w-3 flex-shrink-0 animate-pulse rounded-full" />
              )}
            </div>
          </div>
        );
      })}

      {displayIncidents.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">
          No active incidents
        </div>
      )}
    </div>
  );
}
