import type {
  Incident,
  IncidentStatus,
} from '@/features/emergency/types/incident';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
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
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

interface IncidentDetailProps {
  incident: Incident;
  onStatusChange?: (status: IncidentStatus) => void;
  onBroadcast?: () => void;
  id: string;
  address: string;
}

export function IncidentDetail({ incident, id, address }: IncidentDetailProps) {
  const { sendAllNotification } = useNotification();
  const [data, setData] = useState<Record<string, any>>({});
  const navigate = useNavigate();
  console.log(address);

  // Fetch incident details from backend
  const fetchReport = async (id: string) => {
    try {
      const res = await apiClient.get(`/emergency/report/${id}`);
      setData(res.data.data.report);
      console.log('Fetched incident data:', res.data.data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    }
  };

  useEffect(() => {
    fetchReport(id);
  }, [id]);

  // Update report status to 'verified'
  const updateReport = async (id: string) => {
    try {
      await apiClient.put(`/emergency/reports/${id}`, { status: 'verified' });
      if (typeof incident.status !== 'undefined') {
        incident.status = 'verified';
      }
    } catch (error) {
      console.error('Failed to update report status:', error);
    }
  };
  console.log(data.id);

  const formattedDate = data.created_at
    ? format(parseISO(data.created_at), 'dd MMM, HH:mm', { locale: enUS })
    : '';

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50/50">
      {/* Header */}
      <div className="shrink-0 border-b border-slate-200 bg-white p-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Incident #{data?.id}
              </h2>
            </div>
            <p className="flex items-center text-xs text-slate-500">
              <Clock className="mr-1.5 h-3.5 w-3.5" />
              {data.created_at}
            </p>
          </div>

          {/* Images */}
          <div className="flex gap-2">
            {data.image_url && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <ImageIcon className="mr-2 h-4 w-4" />1 Photo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Attached Media</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 flex justify-center">
                    <img
                      src={data.image_url}
                      alt="Incident"
                      className="max-h-80 rounded-lg shadow-sm"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 p-4">
        <div className="grid h-full grid-cols-1 grid-rows-2 gap-4 xl:grid-cols-2">
          {/* Situation Report */}
          <div className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-900">
              <div className="h-4 w-1 rounded-full bg-blue-500" />
              Situation Report
            </h3>
            <div className="flex-1 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-sm leading-relaxed text-slate-700">
                {data.description}
              </p>
            </div>
          </div>

          {/* Location */}
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
                {address}
              </p>
            </div>
          </div>

          {/* Command Actions */}
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
                    onClick={async () => {
                      await sendAllNotification(
                        `Incident Alert #${data.id}`,
                        data.description ?? incident.description
                      );
                      await updateReport(id.toString());
                      navigate(-1);
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
