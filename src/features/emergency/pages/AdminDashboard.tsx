import { useState } from 'react';
import { useNavigate } from '@/router';
import { StatsCard } from '@/features/emergency/components/admin/StatsCard';
import { IncidentFeed } from '@/features/emergency/components/admin/IncidentFeed';
import { MapView } from '@/features/emergency/components/admin/MapView';
import {
  mockIncidents,
  mockStats,
} from '@/features/emergency/data/mockData.ts';
import type { Incident } from '@/features/emergency/interfaces/incident.ts';

import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Ambulance,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );

  const pendingIncidents =
    mockIncidents?.filter((i) => i.status === 'pending') || [];
  const activeIncidents =
    mockIncidents?.filter((i) =>
      ['pending', 'verified', 'dispatched'].includes(i.status)
    ) || [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Stats Row - 1 col mobile, 2 col tablet, 4 col desktop */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Pending"
          value={mockStats.pending}
          icon={<Clock className="h-5 w-5" />}
          variant="warning"
          trend={{ value: 12, isUp: true }}
        />
        <StatsCard
          title="In Progress"
          value={mockStats.inProgress}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="info"
        />
        <StatsCard
          title="Resolved Today"
          value={mockStats.resolved}
          icon={<CheckCircle className="h-5 w-5" />}
          variant="success"
        />
        <StatsCard
          title="Ambulances Available"
          value={mockStats.ambulancesAvailable}
          icon={<Ambulance className="h-5 w-5" />}
        />
      </div>

      {/* Main Content - Stacked on mobile, 2:1 Split on Desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="card-elevated flex h-full flex-col overflow-hidden">
            <div className="border-border flex items-center justify-between border-b p-4">
              <h2 className="text-foreground font-semibold">Real-time Map</h2>
              <span className="text-muted-foreground text-sm">
                {activeIncidents.length} active cases
              </span>
            </div>
            {/* Height adjustment: shorter on mobile (300px), tall on desktop (500px) */}
            <div className="h-[350px] w-full lg:h-[500px]">
              <MapView
                incidents={activeIncidents}
                //onSelectIncident={(incident) => navigate(`/AdminIncidents/${incidentId}`)}
              />
            </div>
          </div>
        </div>

        {/* Incident Feed */}
        <div className="lg:col-span-1">
          <div className="card-elevated h-full">
            <div className="border-border flex items-center justify-between border-b p-4">
              <h2 className="text-foreground font-semibold">
                Recent Incidents
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground text-xs"
                onClick={() => navigate('/sos/AdminIncidents')}
              >
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-4 lg:max-h-[500px]">
              <IncidentFeed
                incidents={mockIncidents}
                maxItems={5}
                onSelectIncident={(incident) =>
                  navigate('/sos/AdminIncidents/:id', {
                    params: { id: String(incident.id) },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* SOS Alert Banner */}
      {pendingIncidents.some((i) => i.isSOS) && (
        <div
          className="text-primary-foreground fixed bottom-6 left-1/2 z-50 flex w-[90%] -translate-x-1/2 animate-pulse cursor-pointer items-center gap-3 rounded-2xl bg-red-600 px-6 py-3 shadow-lg transition-opacity hover:bg-red-500 md:w-auto"
          onClick={() => {
            const sosIncident = pendingIncidents.find((i) => i.isSOS);
            if (sosIncident)
              navigate(`/sos/AdminIncidents/:id`, {
                params: { id: String(sosIncident.id) },
              });
          }}
        >
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="truncate text-sm font-semibold md:text-base">
            SOS Alert: Verification Required!
          </span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </div>
      )}
    </div>
  );
}
