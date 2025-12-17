import React, { useMemo } from 'react';
import { useNavigate } from '@/router';

import Layout from '@/components/main/Layout';
import { useGetAuthMe } from '@/api/generated/authentication';

import { useEmergencyStats, useMyEmergencies } from '../hooks/useMyEmergency';
import {
  Box,
  EmptyState,
  MiniFixed,
  MiniJustSent,
  EmergencyCard,
} from '../components/Emergency/EmergencyBoxes';

export default function EmergencyPage() {
  const navigate = useNavigate();

  const authMe = useGetAuthMe();
  const authUserId = authMe.data?.data?.userId;

  const userId = useMemo(() => {
    if (typeof authUserId === 'number') return authUserId;
    return undefined;
  }, [authUserId]);

  const statsQ = useEmergencyStats();
  const myQ = useMyEmergencies(userId);

  const stats = statsQ.data?.data?.stats;
  const emergencies = myQ.data?.data?.emergencies ?? [];

  const loading = statsQ.isLoading || myQ.isLoading || authMe.isLoading;

  const history = useMemo(() => {
    return [...emergencies].sort((a, b) =>
      String(b.created_at).localeCompare(String(a.created_at))
    );
  }, [emergencies]);

  const pendingList = useMemo(
    () =>
      history
        .filter((x) => String(x.status).toLowerCase() === 'pending')
        .slice(0, 3),
    [history]
  );

  const completedList = useMemo(
    () =>
      history
        .filter((x) => String(x.status).toLowerCase() === 'completed')
        .slice(0, 3),
    [history]
  );

  const pendingCount = stats?.pending ?? pendingList.length;
  const completedCount = stats?.completed ?? completedList.length;

  return (
    <Layout>
      <main className="min-h-screen bg-[#F5F7FB] px-4 py-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="rounded-3xl bg-white p-8 shadow-xl md:p-10">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#2B5991]">Emergency</h1>
              <p className="mt-1 text-sm text-slate-600">
                View your emergency reports and history
              </p>
            </div>

            {loading ? (
              <div className="rounded-2xl bg-[#F5F7FB] py-16 text-center text-sm text-slate-600">
                Loading...
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-1">
                  <Box title="reports that just sent">
                    <MiniJustSent
                      countText={`${pendingCount} pending`}
                      items={pendingList}
                    />
                  </Box>

                  <Box title="report that already fixed">
                    <MiniFixed
                      countText={`${completedCount} completed`}
                      items={completedList}
                    />
                  </Box>
                </div>

                <div className="lg:col-span-2">
                  <Box title="history of reports" className="h-[520px]">
                    <div className="h-[440px] overflow-y-auto pr-2">
                      {history.length === 0 ? (
                        <EmptyState text="No emergency reports yet." />
                      ) : (
                        <div className="space-y-4">
                          {history.map((item) => (
                            <EmergencyCard key={item.id} item={item} />
                          ))}
                        </div>
                      )}
                    </div>
                  </Box>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}
