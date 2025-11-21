import React from 'react';
import { ShieldAlert, PhoneCall, MapPin } from 'lucide-react';
import { QuickActionCard } from '@/features/_healthcare/components/cards/QuickActionCard';

const AdminEmergencyPage: React.FC = () => (
  <div className="space-y-6">
    <section className="grid gap-4 md:grid-cols-3">
      <QuickActionCard
        icon={PhoneCall}
        title="Hotline"
        description="+1 (555) 443-0021"
      />
      <QuickActionCard
        icon={ShieldAlert}
        title="Incident command"
        description="Central triage channel"
      />
      <QuickActionCard
        icon={MapPin}
        title="Nearest facility"
        description="Routing to emergency hub"
      />
    </section>
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
      <h2 className="text-lg font-bold">Emergency Broadcast</h2>
      <p className="mt-2 text-sm">
        Mobilize rapid response units and sync with field teams. This space is
        reserved for situational awareness feeds that will be integrated in a
        later sprint.
      </p>
    </div>
  </div>
);

export default AdminEmergencyPage;
