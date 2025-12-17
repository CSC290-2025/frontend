import { useState } from 'react';
import { useNavigate } from '@/router';
import { mockIncidents } from '@/features/emergency/data/mockData.ts';
import type {
  IncidentStatus,
  IncidentCategory,
} from '@/features/emergency/interfaces/incident';
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

import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Flame,
  Car,
  Heart,
  ShieldAlert,
  CloudRain,
} from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

// ปรับปรุง Config สีของสถานะ (ใช้ bg และ text เพื่อทำ Badge สวยๆ)
const statusConfig: Record<
  IncidentStatus,
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
  dispatched: {
    label: 'Dispatched',
    icon: Truck,
    style:
      'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle,
    style:
      'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  },
  false_alarm: {
    label: 'False Alarm',
    icon: XCircle,
    style:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  },
};

// เพิ่มสีให้กับ Categories
const categoryConfig: Record<
  IncidentCategory,
  { label: string; icon: typeof Flame; color: string }
> = {
  fire: { label: 'Fire', icon: Flame, color: 'text-red-500' },
  accident: { label: 'Accident', icon: Car, color: 'text-amber-500' },
  medical: { label: 'Medical', icon: Heart, color: 'text-rose-500' },
  crime: { label: 'Crime', icon: ShieldAlert, color: 'text-indigo-500' },
  natural_disaster: {
    label: 'Natural Disaster',
    icon: CloudRain,
    color: 'text-cyan-500',
  },
  other: { label: 'Other', icon: AlertTriangle, color: 'text-slate-500' },
};

export default function AdminIncidents() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredIncidents = mockIncidents.filter((incident) => {
    const matchesSearch =
      incident.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || incident.status === statusFilter;
    const matchesCategory =
      categoryFilter === 'all' || incident.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="min-h-screen space-y-6 bg-slate-50/50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Reports</h1>
          <p className="text-slate-500">Manage and track emergency reports</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="focus-visible:ring-primary h-10 rounded-xl border-slate-200 pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-[180px] rounded-xl border-slate-200">
            <Filter className="mr-2 h-4 w-4 text-slate-500" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="dispatched">Dispatched</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="false_alarm">False Alarm</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-10 w-[180px] rounded-xl border-slate-200">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="fire">Fire</SelectItem>
            <SelectItem value="accident">Accident</SelectItem>
            <SelectItem value="medical">Medical</SelectItem>
            <SelectItem value="crime">Crime</SelectItem>
            <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = mockIncidents.filter((i) => i.status === status).length;
          const Icon = config.icon;
          const isActive = statusFilter === status;

          return (
            <Button
              key={status}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(isActive ? 'all' : status)}
              className={cn(
                'gap-2 rounded-xl border transition-all',
                isActive
                  ? 'shadow-md'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4',
                  isActive ? 'text-primary-foreground' : 'text-slate-500'
                )}
              />
              <span>{config.label}</span>
              <Badge
                variant="secondary"
                className={cn(
                  'ml-1 rounded-md',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b border-slate-100 bg-slate-50/80">
            <tr>
              <th className="p-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Case ID
              </th>
              <th className="p-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Reporter
              </th>
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
            {filteredIncidents.map((incident) => {
              const StatusIcon = statusConfig[incident.status].icon;
              const CategoryIcon = categoryConfig[incident.category].icon;

              return (
                <tr
                  key={incident.id}
                  onClick={() =>
                    navigate('/sos/AdminIncidents/:id', {
                      params: { id: String(incident.id) },
                    })
                  }
                  className={cn(
                    'group cursor-pointer transition-all duration-200 hover:bg-slate-50',
                    // Highlight SOS rows slightly red
                    incident.isSOS &&
                      incident.status === 'pending' &&
                      'bg-red-50/50 hover:bg-red-50'
                  )}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {incident.isSOS && (
                        <Badge className="animate-pulse rounded bg-red-600 px-1.5 py-0.5 text-[10px] text-white shadow-sm shadow-red-200 hover:bg-red-700">
                          SOS
                        </Badge>
                      )}
                      <span className="text-sm font-semibold text-slate-700">
                        #{incident.id}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 shadow-sm ring-2 ring-white transition-all group-hover:bg-white group-hover:ring-slate-200">
                        {incident.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {incident.userName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {incident.userPhone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'rounded-lg bg-slate-50 p-1.5',
                          categoryConfig[incident.category].color
                            .replace('text-', 'bg-')
                            .replace('500', '100')
                        )}
                      >
                        <CategoryIcon
                          className={cn(
                            'h-4 w-4',
                            categoryConfig[incident.category].color
                          )}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {categoryConfig[incident.category].label}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="max-w-[200px] truncate text-sm text-slate-600">
                      {incident.address}
                    </p>
                  </td>
                  <td className="p-4">
                    <div
                      className={cn(
                        'inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                        statusConfig[incident.status].style
                      )}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      <span>{statusConfig[incident.status].label}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-slate-500">
                      {format(incident.createdAt, 'd MMM HH:mm', {
                        locale: enUS,
                      })}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredIncidents.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
            <Search className="mb-3 h-10 w-10 opacity-20" />
            <p className="text-lg font-medium text-slate-600">
              No reports found
            </p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
