import Layout from '@/components/main/Layout';
import { useNavigate } from '@/router';
import { ChevronLeft } from 'lucide-react';

import { useGetAuthMe } from '@/api/generated/authentication';
import { useVolunteer } from '../hooks/useVolunteer';
import {
  useVolunteerHistory,
  useFreecycleHistory,
} from '../hooks/useVolunteerHistory';

import VolunteerCard from '../components/VolunteerPage/VolunteerCard';
import UpcomingVolunteerCard from '../components/VolunteerPage/UpcomingVolunteerCard';
import VolunteerHistoryCard from '../components/VolunteerPage/VolunteerHistoryCard';

export default function VolunteerPage() {
  const navigate = useNavigate();

  const authMe = useGetAuthMe();
  const userId = authMe.data?.data?.userId;

  const listQ = useVolunteer();
  const historyQ = useVolunteerHistory(userId);
  const freecycleQ = useFreecycleHistory(userId);

  const loading =
    authMe.isLoading ||
    listQ.isLoading ||
    historyQ.isLoading ||
    freecycleQ.isLoading;

  if (loading) return null;

  if (authMe.error) {
    return <div className="p-6 text-red-500">Auth load failed</div>;
  }
  if (listQ.isError)
    return <div className="p-6 text-red-500">Load list failed</div>;
  if (historyQ.isError)
    return (
      <div className="p-6 text-red-500">Load volunteer history failed</div>
    );
  if (freecycleQ.isError)
    return (
      <div className="p-6 text-red-500">Load freecycle history failed</div>
    );

  const events = listQ.data?.events ?? [];
  const volunteerHistory = historyQ.data ?? [];
  const freecycleHistory = freecycleQ.data ?? [];

  return (
    <Layout>
      <main className="min-h-screen bg-[#F6F7FB] px-6 py-10">
        <div className="mx-auto w-full max-w-6xl rounded-3xl bg-white p-10 shadow-2xl">
          <h2 className="text-4xl font-semibold text-[#2B5991]">
            Volunteer list & registration
          </h2>
          <h2 className="mb-8 text-lg font-semibold text-black">
            Find and join community volunteer programs
          </h2>

          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-1">
              <div className="rounded-3xl bg-[#F9FAFB] p-4 shadow-md">
                <div className="h-[620px] overflow-y-auto pr-2">
                  {events.map((event) => (
                    <VolunteerCard key={event.id} event={event} />
                  ))}
                  {events.length === 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
                      No volunteer events
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-2 space-y-8">
              <div>
                <h3 className="mb-3 font-semibold text-[#2B5991]">
                  Upcoming event
                </h3>
                {events[0] ? (
                  <UpcomingVolunteerCard event={events[0]} />
                ) : (
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
                    No upcoming event
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-[#2B5991]">
                  History of Volunteering
                </h3>

                {volunteerHistory.length === 0 ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
                    No history yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {volunteerHistory.map((h) => (
                      <VolunteerHistoryCard
                        key={h.id}
                        title={h.title}
                        status={h.status}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
