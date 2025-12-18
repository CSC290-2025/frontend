import { useEffect, useState } from 'react';
import { useNavigate } from '@/router';
import { StatsCard } from '@/features/emergency/components/admin/StatsCard';
import { IncidentFeed } from '@/features/emergency/components/admin/IncidentFeed';
import { MapView } from '@/features/emergency/components/admin/MapView';
import AdminIncidents from '@/features/emergency/pages/AdminIncidents.tsx';
import ReportApi from '@/features/emergency/api/report.api.ts';
import {
  mockIncidents,
  mockStats,
} from '@/features/emergency/data/mockData.ts';
import type { Incident } from '@/features/emergency/types/incident.ts';
import { Loader2 } from 'lucide-react';

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

  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    resolved: 0,
  });

  const [pendingIncidents, setPendingIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        console.log('Fetching dashboard data...');

        const [pendingRes, verifiedRes, resolvedRes] = await Promise.all([
          ReportApi.getReportByStatusPag('pending', '1', '50'),
          ReportApi.getReportByStatusPag('verified', '1', '1'),
          ReportApi.getReportByStatusPag('resolved', '1', '1'),
        ]);

        console.log('1. Full API Responses:', {
          pendingRes,
          verifiedRes,
          resolvedRes,
        });
        console.log('2. Pending Headers:', pendingRes.headers);
        console.log('3. Raw Pending Data:', pendingRes.data);
        // ------------------

        const newStats = {
          pending: parseInt(pendingRes.headers['x-total-count'] || '0', 10),
          verified: parseInt(verifiedRes.headers['x-total-count'] || '0', 10),
          resolved: parseInt(resolvedRes.headers['x-total-count'] || '0', 10),
        };
        console.log('4. Parsed Stats:', newStats);
        setStats(newStats);

        const data = pendingRes.data;

        if (Array.isArray(data)) {
          console.log('5. Data is a direct array. Setting state.');
          setPendingIncidents(data);
        } else if (data && Array.isArray(data.data)) {
          console.log('5. Data is nested inside data.data. Setting state.');
          setPendingIncidents(data.data);
        } else if (data && Array.isArray(data.items)) {
          console.log('5. Data is nested inside data.items. Setting state.');
          setPendingIncidents(data.items);
        } else {
          console.warn(
            '5. WARNING: Data is NOT an array. Fallback to empty.',
            data
          );
          setPendingIncidents([]);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
        setPendingIncidents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Pending"
          value={loading ? '-' : stats.pending}
          icon={
            loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Clock className="h-5 w-5" />
            )
          }
          variant="warning"
        />
        <StatsCard
          title="Verified"
          value={loading ? '-' : stats.verified}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="info"
        />
        <StatsCard
          title="Resolved Today"
          value={loading ? '-' : stats.resolved}
          icon={<CheckCircle className="h-5 w-5" />}
          variant="success"
        />
      </div>

      <div>
        <div className="lg:col-span-1">
          <div className="card-elevated h-full">
            <AdminIncidents />
          </div>
        </div>
      </div>

      {!loading &&
        Array.isArray(pendingIncidents) &&
        pendingIncidents.some((i) => i.isSOS) && (
          <div
            className="text-primary-foreground fixed bottom-6 left-1/2 z-50 flex w-[90%] -translate-x-1/2 cursor-pointer items-center gap-3 rounded-2xl bg-red-600 px-6 py-3 shadow-lg transition-opacity hover:bg-red-500 md:w-auto"
            onClick={() => {
              const sosIncident = pendingIncidents.find((i) => i.isSOS);
              console.log('Clicked SOS Banner, incident:', sosIncident);
              if (sosIncident) navigate('/chat');
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
