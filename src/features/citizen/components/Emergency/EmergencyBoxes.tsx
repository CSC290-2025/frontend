import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  MapPin,
  Hospital,
  Ambulance,
} from 'lucide-react';
import type { TrafficEmergency } from '../../api/Emergency.api';
import { formatEmergencyStatus } from '../../api/Emergency.api';

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

type BoxProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function Box({ title, children, className }: BoxProps) {
  return (
    <section
      className={cn(
        'rounded-3xl border border-slate-200 bg-white p-6 shadow-sm',
        className
      )}
    >
      <h3 className="mb-4 text-lg font-semibold text-[#2B5991]">{title}</h3>
      {children}
    </section>
  );
}

export function Badge({ text }: { text: string }) {
  return (
    <span className="rounded-full bg-[#E9F0FB] px-3 py-1 text-xs font-semibold text-[#2B5991]">
      {text}
    </span>
  );
}

export function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl bg-[#F5F7FB] px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
        {icon}
        <span>{label}</span>
      </div>
      <div className="min-w-0 text-right text-xs text-slate-700">{value}</div>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-[#F5F7FB] px-4 py-4 text-sm text-slate-600">
      <AlertCircle className="h-4 w-4 text-slate-500" />
      <span>{text}</span>
    </div>
  );
}

export function EmergencyCard({ item }: { item: TrafficEmergency }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#2B5991]" />
            <p className="truncate text-sm font-semibold text-slate-900">
              {item.accident_location || '-'}
            </p>
          </div>

          <p className="truncate text-xs text-slate-600">
            Destination: {item.destination_hospital || '-'}
          </p>

          <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
            <Clock3 className="h-4 w-4" />
            <span>{item.created_at || '-'}</span>
          </div>
        </div>

        <Badge text={formatEmergencyStatus(item.status)} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2">
        <DetailRow
          label="Report ID"
          value={
            <span className="font-semibold text-slate-900">#{item.id}</span>
          }
        />
        <DetailRow
          label="Ambulance Vehicle"
          icon={<Ambulance className="h-4 w-4 text-slate-500" />}
          value={
            <span className="font-semibold text-slate-900">
              {item.ambulance_vehicle_id ?? '-'}
            </span>
          }
        />
        <DetailRow
          label="Hospital"
          icon={<Hospital className="h-4 w-4 text-slate-500" />}
          value={
            <span className="truncate">{item.destination_hospital || '-'}</span>
          }
        />
      </div>
    </div>
  );
}

export function MiniSection({
  title,
  icon,
  countText,
  items,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  countText: string;
  items: TrafficEmergency[];
  emptyText: string;
}) {
  return (
    <div className="rounded-2xl bg-[#F5F7FB] p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[#2B5991]">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-600">{countText}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white px-4 py-3 text-xs text-slate-600">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="rounded-2xl bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-xs font-semibold text-slate-900">
                  {it.accident_location || '-'}
                </span>
                <span className="shrink-0 text-[11px] text-slate-600">
                  {it.created_at || '-'}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="truncate text-[11px] text-slate-600">
                  {it.destination_hospital || '-'}
                </span>
                <span className="shrink-0 rounded-full bg-[#E9F0FB] px-2 py-0.5 text-[11px] font-semibold text-[#2B5991]">
                  {formatEmergencyStatus(it.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MiniJustSent({
  countText,
  items,
}: {
  countText: string;
  items: TrafficEmergency[];
}) {
  return (
    <MiniSection
      title="Reports that just sent"
      countText={countText}
      icon={<AlertCircle className="h-5 w-5" />}
      items={items}
      emptyText="No pending reports."
    />
  );
}

export function MiniFixed({
  countText,
  items,
}: {
  countText: string;
  items: TrafficEmergency[];
}) {
  return (
    <MiniSection
      title="Report that already fixed"
      countText={countText}
      icon={<CheckCircle2 className="h-5 w-5" />}
      items={items}
      emptyText="No completed reports."
    />
  );
}
