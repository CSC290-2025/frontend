import { useNavigate } from '@/router';
import { Button } from '@/features/emergency/components/ui/button';
import { Badge } from '@/features/emergency/components/ui/badge';
import { Input } from '@/features/emergency/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/emergency/components/ui/select';
import { useSearchParams } from 'react-router';
import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  Flame,
  Car,
  CloudRain,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useState, useEffect } from 'react';

import type { Incident } from '@/features/emergency/types/incident';
import ReportApi from '@/features/emergency/api/report.api.ts';
import { toast } from 'sonner';
import config from '@/features/emergency/config/env.ts';
import axios from 'axios';
import { useReportFrom } from '@/features/emergency/contexts/report-from.tsx';
import { PaginationWithLinks } from '@/features/emergency/components/ui/pagination-with-link.tsx';

const statusConfig: Record<
  string,
  { label: string; icon: typeof Clock; style: string }
> = {
  pending: {
    label: 'Pending Review',
    icon: Clock,
    style:
      'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  },
  verified: {
    label: 'Verified',
    icon: CheckCircle,
    style:
      'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle,
    style:
      'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  },
};

const categoryConfig: Record<
  string,
  { label: string; icon: typeof Flame; color: string }
> = {
  traffic: { label: 'traffic', icon: Car, color: 'text-orange-500' },
  accident: { label: 'accident', icon: AlertTriangle, color: 'text-red-500' },
  disaster: { label: 'disaster', icon: CloudRain, color: 'text-cyan-500' },
  other: { label: 'Other', icon: AlertTriangle, color: 'text-slate-500' },
};

export default function AdminIncidents() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('_page') || '1');
  const limit = Number(searchParams.get('_limit') || '10');

  const { report, setStatus, totalPage } = useReportFrom();
  const [address, setAddress] = useState('');
  const [addressMap, setAddressMap] = useState<Record<string, string>>({});

  const convertPo = async (
    lat: string | null,
    long: string | null,
    id: number
  ) => {
    if (!lat || !long || addressMap[id]) return;
    try {
      const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${long}&apiKey=${config.GEO_API_KEY}`;
      const res = await axios.get(url);
      const formatted =
        res.data?.features?.[0]?.properties?.formatted ?? 'Unknown location';

      setAddressMap((prev) => ({ ...prev, [id]: formatted }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    report.forEach((r) => {
      convertPo(r.lat, r.long, r.id);
    });
  }, [report]);

  useEffect(() => {
    setStatus('pending');
  }, [setStatus]);

  console.log('Report data:', report);

  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const currentPage = parseInt(searchParams.get('_page') || '1', 10);
  const perPage = parseInt(searchParams.get('_limit') || '5', 10);

  useEffect(() => {
    const fetchCounts = async () => {
      const keys = ['pending', 'verified', 'resolved'];
      const counts: Record<string, number> = {};

      await Promise.all(
        keys.map(async (key) => {
          try {
            const { headers } = await ReportApi.getReportByStatusPag(
              key,
              '1',
              '1'
            );
            counts[key] = parseInt(headers['x-total-count'] || '0', 10);
          } catch {
            counts[key] = 0;
          }
        })
      );

      setStatusCounts(counts);
    };
    fetchCounts();
  }, []);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="mt-15 min-h-screen space-y-6 bg-slate-50/50">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b border-slate-100 bg-slate-50/80">
            <tr>
              <th className="p-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Case ID
              </th>
              <th className="p-2 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase"></th>
              <th className="p-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Category
              </th>
              <th className="p-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Location
              </th>
              <th className="p-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Status
              </th>
              <th className="p-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {report.map((r) => {
              // Fallbacks
              const statusKey = r.status?.toLowerCase() || 'pending';
              const categoryKey = r.report_category;

              const statusInfo =
                statusConfig[statusKey] || statusConfig.pending;
              const categoryInfo =
                categoryConfig[categoryKey] || categoryConfig.other;

              const StatusIcon = statusInfo.icon;
              const CategoryIcon = categoryInfo.icon;

              return (
                <tr
                  key={r.id}
                  onClick={() =>
                    navigate('/sos/AdminIncidents/:id', {
                      params: { id: String(r.id) },
                    })
                  }
                  className="group cursor-pointer transition-all duration-200 hover:bg-slate-50"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">
                        #{r.id}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {/*<div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 shadow-sm ring-2 ring-white transition-all group-hover:bg-white group-hover:ring-slate-200">*/}
                      {/*  {incident.userName?.charAt(0) || '?'}*/}
                      {/*</div>*/}
                      <div>
                        {/*<p className="text-sm font-medium text-slate-900">*/}
                        {/*  {incident.userName || 'Unknown'}*/}
                        {/*</p>*/}
                        {/*<p className="text-xs text-slate-500">*/}
                        {/*  {incident.userPhone || 'No Phone'}*/}
                        {/*</p>*/}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'rounded-lg bg-slate-50 p-1.5',
                          categoryInfo.color
                            .replace('text-', 'bg-')
                            .replace('500', '100')
                        )}
                      >
                        <CategoryIcon
                          className={cn('h-4 w-4', categoryInfo.color)}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {categoryInfo.label}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="max-w-[200px] truncate text-sm text-slate-600">
                      {addressMap[r.id] || 'No address'}
                    </p>
                  </td>
                  <td className="p-4">
                    <div
                      className={cn(
                        'inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                        statusInfo.style
                      )}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      <span>{statusInfo.label}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-slate-500">
                      {new Date(r.created_at).toLocaleDateString('en-EN')}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginationWithLinks
        page={currentPage}
        pageSize={perPage}
        totalCount={totalPage}
        pageSizeSelectOptions={{
          pageSizeOptions: [5, 10, 25, 50],
        }}
      />

      <div className="admin-incidents" />
    </div>
  );
}
