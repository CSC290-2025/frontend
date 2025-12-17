import { useEffect } from 'react';
import { useNavigate } from '@/router';
import { ChevronLeft } from 'lucide-react';

import { useMyProfile } from '../../hooks/ProfileUser';
import { useMyHealthcare } from '../../hooks/useMyHealthcare';
import type { ProfileVM } from '../../api/ProfileUser';
import type { HealthcareVM } from '../../api/healthcare.api';

type Props = {
  userId?: number;
};

function safeText(v: unknown, fallback = '-') {
  if (v === null || v === undefined) return fallback;
  const s = String(v).trim();
  return s.length ? s : fallback;
}

export default function HealthcareCard({ userId }: Props) {
  const navigate = useNavigate();

  const profileQ = useMyProfile();
  const healthcareQ = useMyHealthcare(userId);

  useEffect(() => {
    profileQ.refetch?.();
    healthcareQ.refetch?.();
  }, []);

  const isLoading = profileQ.isLoading || healthcareQ.isLoading;
  const errorMsg =
    (profileQ.error as Error | undefined)?.message ||
    (healthcareQ.error as Error | undefined)?.message ||
    null;

  const profile = profileQ.data as ProfileVM | undefined;
  const healthcare = healthcareQ.data as HealthcareVM | undefined;

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        {/* BACK — OUTSIDE FRAME */}
        <button
          onClick={() => navigate('/citizen/profile')}
          className="mb-6 inline-flex items-center gap-3 text-[#2B5991] hover:opacity-80"
        >
          <ChevronLeft className="h-10 w-10" />
          <span className="text-2xl font-semibold">Profile</span>
        </button>

        {/* OUTER FRAME */}
        <div className="rounded-[28px] bg-white p-12 shadow-[0_18px_45px_rgba(17,24,39,0.12)]">
          {/* HEADER INSIDE FRAME */}
          <div className="mb-10">
            <h1 className="font-poppins text-4xl leading-none font-bold tracking-[-0.05em] text-[#2B5991]">
              Healthcare services
            </h1>

            <p className="mt-2 text-lg text-[#2B5991]">
              View your healthcare information and history
            </p>
          </div>

          {/* CONTENT */}
          {isLoading ? (
            <div className="rounded-3xl bg-white p-16 text-center text-[#2B5991]">
              Loading...
            </div>
          ) : errorMsg ? (
            <div className="rounded-3xl bg-white p-16 text-center text-red-500">
              {errorMsg}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_2fr]">
              {/* LEFT (smaller) */}
              <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow">
                <div className="flex flex-col items-center">
                  <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full border bg-white">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 100 100"
                      fill="none"
                    >
                      <circle cx="50" cy="35" r="20" fill="#6B7280" />
                      <path
                        d="M20 85 Q20 60 50 60 Q80 60 80 85"
                        fill="#6B7280"
                      />
                    </svg>
                  </div>

                  <h2 className="mb-3 text-xl font-bold text-[#2B5991]">
                    {safeText(profile?.username, 'Firstname Lastname')}
                  </h2>

                  <div className="mb-6 w-full rounded-2xl bg-[#01CCFF] px-6 py-4 text-center">
                    <p className="text-sm font-medium text-white">
                      Card ID: {safeText((profile as any)?.cardId, 'N/A')}
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">
                      Bus card balance:{' '}
                      {safeText((profile as any)?.busCardBalance, 'N/A')}
                    </p>
                  </div>

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

              {/* RIGHT (bigger) */}
              <section className="min-h-[520px] rounded-3xl border border-gray-100 bg-white p-10 shadow">
                <h2 className="mb-6 text-center text-xl font-bold text-[#2B5991]">
                  Medical Records
                </h2>

                <div className="space-y-3 text-sm">
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
