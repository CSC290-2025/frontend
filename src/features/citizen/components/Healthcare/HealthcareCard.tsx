import React from 'react';
import { ChevronLeft } from 'lucide-react';

import type { ProfileVM } from '../../api/ProfileUser';
import type { HealthcareVM } from '../../api/healthcare.api';

type Props = {
  profile?: ProfileVM;
  healthcare?: HealthcareVM;
  loading?: boolean;
  error?: string | null;
  onBack: () => void;
};

function safeText(v: unknown, fallback = '-') {
  if (v === null || v === undefined) return fallback;
  const s = String(v).trim();
  return s.length ? s : fallback;
}

export default function HealthcareCard({
  profile,
  healthcare,
  loading,
  error,
}: Props) {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="rounded-[28px] bg-white p-12 shadow-[0_18px_45px_rgba(17,24,39,0.12)]">
          <div className="mb-10">
            <h1 className="font-poppins text-4xl leading-none font-bold tracking-[-0.05em] text-[#2B5991]">
              Healthcare services
            </h1>
            <p className="mt-2 text-lg text-black">
              View your healthcare information and history
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-16 text-center text-[#2B5991]">
              Loading...
            </div>
          ) : error ? (
            <div className="rounded-3xl bg-white p-16 text-center text-red-500">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_2fr]">
              <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow">
                <div className="flex flex-col items-center">
                  <h2 className="mb-3 text-xl font-bold text-[#2B5991]">
                    {safeText((profile as any)?.username, 'Firstname Lastname')}
                  </h2>

                  <div className="w-full space-y-3 text-sm">
                    <Row
                      label="Patient Id"
                      value={safeText((healthcare as any)?.patientId)}
                    />
                    <Row
                      label="Date of Birth"
                      value={safeText((healthcare as any)?.dateOfBirth)}
                    />
                    <Row
                      label="Appointment"
                      value={safeText((healthcare as any)?.appointment)}
                    />
                    <Row
                      label="Address"
                      value={safeText((profile as any)?.address)}
                    />
                    <Row
                      label="Phone"
                      value={safeText((profile as any)?.phone)}
                      last
                    />
                  </div>
                </div>
              </section>

              <section className="min-h-[520px] rounded-3xl border border-gray-100 bg-white p-10 shadow">
                <h2 className="mb-6 text-center text-xl font-bold text-[#2B5991]">
                  Medical Records
                </h2>

                <div className="space-y-3 text-sm text-black">
                  <RowPlain
                    label="Diagnosis"
                    value={safeText((healthcare as any)?.diagnosis)}
                  />
                  <RowPlain
                    label="Medications"
                    value={safeText((healthcare as any)?.medications)}
                  />
                  <RowPlain
                    label="Notes"
                    value={safeText((healthcare as any)?.notes)}
                    last
                  />
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${!last ? 'border-b border-gray-100 pb-2' : 'pb-2'}`}
    >
      <span className="font-medium text-[#2B5991]">{label}</span>
      <span className="text-right text-[#2B5991]">{value}</span>
    </div>
  );
}

function RowPlain({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${!last ? 'border-b border-gray-100 pb-2' : 'pb-2'}`}
    >
      <span className="font-semibold text-[#2B5991]">{label}</span>
      <span className="text-right text-[#2B5991]">{value}</span>
    </div>
  );
}
