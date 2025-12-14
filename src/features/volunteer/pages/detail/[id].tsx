import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@/router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Users,
  X,
  Share2,
  CheckCircle,
  AlertCircle,
  Heart,
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { DonateModal } from '@/features/volunteer/components/DonateModal';
import { useGetWalletsUserUserId } from '@/api/generated/wallets';
import { useGetAuthMe } from '@/api/generated/authentication';

// --- Interfaces ---
interface VolunteerEvent {
  id: number;
  title: string;
  description: string | null;
  start_at: string | null;
  end_at: string | null;
  registration_deadline: string | null;
  current_participants: number;
  total_seats: number;
  image_url: string | null;
  created_by_user_id: number | null;
  organization_name?: string | null;
  duration?: string | null;
  tag: string | undefined;
}

interface Participant {
  id: number;
  username: string;
  email: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface EventDetailResponse {
  event: VolunteerEvent;
  is_joined: boolean;
}

interface ParticipantsResponse {
  count: number;
  participants: Participant[];
}

// --- Skeleton Component ---
const DetailSkeleton = () => (
  <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="mb-8 h-8 w-32 animate-pulse rounded bg-gray-200" />
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="h-64 w-full animate-pulse rounded-3xl bg-gray-200 sm:h-96" />
        <div className="h-10 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="h-64 w-full animate-pulse rounded-2xl bg-gray-200" />
      </div>
    </div>
  </div>
);

export default function VolunteerDetailPage() {
  const navigate = useNavigate();
  const userId = useGetAuthMe().data?.data?.userId ?? '';
  const { id } = useParams('/volunteer/detail/:id');

  const { data: wallets, refetch } = useGetWalletsUserUserId(Number(userId));
  const [event, setEvent] = useState<VolunteerEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const wallet = wallets?.data?.wallet;
  const [creatorId, setCreatorId] = useState<number | null>(null);

  // Participants modal state
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<ApiResponse<EventDetailResponse>>(
          `/api/v1/volunteer/${id}`
        );

        if (response.data.success) {
          const { event: fetchedEvent, is_joined: userJoinedStatus } =
            response.data.data;
          setEvent(fetchedEvent);
          setIsJoined(userJoinedStatus);
          setCreatorId(fetchedEvent.created_by_user_id);
        } else {
          throw new Error('API did not return success');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const fetchParticipants = async () => {
    setLoadingParticipants(true);
    setParticipantsError(null);
    try {
      const response = await apiClient.get<ApiResponse<ParticipantsResponse>>(
        `/api/v1/volunteer/${id}/participants?requesterId=${userId}`
      );

      if (response.data.success) {
        setParticipants(response.data.data.participants);
      } else {
        throw new Error('Failed to fetch participants');
      }
    } catch (err: any) {
      setParticipantsError(err.response?.data?.message || err.message);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleShowParticipants = () => {
    setShowParticipants(true);
    fetchParticipants();
  };

  const handleJoinEvent = async () => {
    if (!userId) return;
    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = await apiClient.post<
        ApiResponse<{ event: VolunteerEvent }>
      >(`/api/v1/volunteer/${id}/join`, { userId: userId });
      if (response.data.success) {
        setEvent(response.data.data.event);
        setIsJoined(true);
      } else {
        throw new Error(response.data.message || 'Failed to join event');
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!userId) return;
    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = await apiClient.delete<
        ApiResponse<{ event: VolunteerEvent }>
      >(`/api/v1/volunteer/${id}/join`, { data: { userId: userId } });
      if (response.data.success) {
        setEvent(response.data.data.event);
        setIsJoined(false);
      } else {
        throw new Error(response.data.message || 'Failed to leave event');
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      const response = await apiClient.delete(`/api/v1/volunteer/${id}`);
      if (response.data.success) {
        navigate('/volunteer/board');
      } else {
        throw new Error(response.data.message || 'Failed to delete event');
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormattedDate = (dateString: string | null) =>
    dateString
      ? new Date(dateString).toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '-';

  const getFormattedTime = (start: string | null, end: string | null) => {
    if (!start || !end) return '-';
    const startTime = new Date(start).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const endTime = new Date(end).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${startTime} - ${endTime}`;
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-slate-50 pt-20">
        <DetailSkeleton />
      </div>
    );
  if (error)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-red-500">
        Error: {error}
      </div>
    );
  if (!event)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-gray-500">
        Event not found.
      </div>
    );

  const isEventFull = event.current_participants >= event.total_seats;
  const progressPercent = Math.min(
    (event.current_participants / event.total_seats) * 100,
    100
  );
  const isFunding = event.tag === 'Funding';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* --- Header / Navigation --- */}
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/volunteer/board')}
            className="group flex items-center gap-2 rounded-lg py-2 pr-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 group-hover:bg-white group-hover:shadow-sm">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Back to Events
          </button>

          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
              <Share2 className="h-5 w-5" />
            </button>
            {/* Owner Actions */}
            {Number(event.created_by_user_id) === Number(userId) && (
              <>
                <div className="mx-1 h-6 w-px bg-slate-300"></div>
                <button
                  onClick={() =>
                    navigate('/volunteer/edit/:id', { params: { id } })
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                  title="Edit Event"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={handleDeleteEvent}
                  disabled={isSubmitting}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                  title="Delete Event"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Image & Details */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            <div className="relative mb-8 overflow-hidden rounded-3xl shadow-xl shadow-slate-200/50">
              <img
                src={
                  event.image_url ||
                  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=2000'
                }
                alt={event.title}
                className="h-64 w-full object-cover sm:h-96"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

              <div className="absolute right-6 bottom-6 left-6">
                {event.tag && (
                  <span
                    className={`mb-3 inline-block rounded-lg px-3 py-1 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-sm ${isFunding ? 'bg-emerald-600/90' : 'bg-blue-600/90'}`}
                  >
                    {event.tag}
                  </span>
                )}
                <h1 className="text-3xl font-extrabold text-white drop-shadow-sm sm:text-4xl md:text-5xl">
                  {event.title}
                </h1>
                {event.organization_name && (
                  <p className="mt-2 text-lg font-medium text-slate-200">
                    by {event.organization_name}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-10">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-slate-800">
                About this opportunity
              </h2>
              <div className="prose prose-slate max-w-none leading-relaxed whitespace-pre-wrap text-slate-600">
                {event.description || 'No description provided.'}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="relative lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Action Card */}
              <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 shadow-slate-200/60 ring-slate-100">
                <div className="border-b border-slate-100 bg-slate-50 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
                      Availability
                    </span>
                    <span className="flex items-center gap-1 text-sm font-bold text-slate-700">
                      <Users className="h-4 w-4" />
                      {getFormattedDate(event.registration_deadline) !== '-'
                        ? 'Reg closes soon'
                        : 'Open'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2 flex items-end justify-between">
                    <span className="text-3xl font-bold text-slate-900">
                      {event.total_seats - event.current_participants}
                    </span>
                    <span className="mb-1 text-sm font-medium text-slate-500">
                      {isFunding ? 'supporters needed' : 'spots remaining'}
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        isFunding
                          ? 'bg-emerald-500'
                          : isEventFull
                            ? 'bg-red-500'
                            : 'bg-blue-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="mt-2 text-right text-xs text-slate-400">
                    {event.current_participants} / {event.total_seats} filled
                  </div>
                </div>

                <div className="p-6">
                  {/* MAIN ACTION: DONATE or JOIN */}
                  {isFunding ? (
                    // Funding -> Donate Component
                    <div className="w-full">
                      <DonateModal
                        wallet={wallet}
                        userId={userId.toString()}
                        transferToUserId={creatorId ? creatorId.toString() : ''}
                        onSuccess={refetch}
                      />
                    </div>
                  ) : (
                    // Standard -> Join/Leave Buttons
                    <>
                      {isJoined ? (
                        <button
                          onClick={handleLeaveEvent}
                          disabled={isSubmitting}
                          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-4 font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95 disabled:opacity-50"
                        >
                          {isSubmitting ? 'Processing...' : 'Leave Event'}
                          {!isSubmitting && <X className="h-5 w-5" />}
                        </button>
                      ) : (
                        <button
                          onClick={handleJoinEvent}
                          disabled={isSubmitting || isEventFull}
                          className={`group flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:shadow-none ${
                            isEventFull
                              ? 'cursor-not-allowed bg-slate-400'
                              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200'
                          }`}
                        >
                          {isSubmitting
                            ? 'Joining...'
                            : isEventFull
                              ? 'Waitlist Full'
                              : 'Join Now'}
                          {!isSubmitting && !isEventFull && (
                            <CheckCircle className="h-5 w-5" />
                          )}
                        </button>
                      )}
                    </>
                  )}

                  {actionError && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {actionError}
                    </div>
                  )}

                  {/* Participants Toggle */}
                  <button
                    onClick={handleShowParticipants}
                    className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
                  >
                    <Users className="h-4 w-4" />
                    View who else is {isFunding ? 'supporting' : 'going'}
                  </button>
                </div>
              </div>

              {/* Date & Time Info Card */}
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <h3 className="mb-4 font-bold text-slate-800">Date & Time</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Date</p>
                      <p className="font-semibold text-slate-900">
                        {getFormattedDate(event.start_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Time</p>
                      <p className="font-semibold text-slate-900">
                        {getFormattedTime(event.start_at, event.end_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Deadline
                      </p>
                      <p className="font-semibold text-slate-900">
                        {getFormattedDate(event.registration_deadline)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- Participants Modal --- */}
      {showParticipants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowParticipants(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {isFunding ? 'Supporters' : 'Volunteers'}
                </h2>
                <p className="text-sm text-slate-500">
                  {event.current_participants}{' '}
                  {isFunding ? 'people donated' : 'amazing people joined'}
                </p>
              </div>
              <button
                onClick={() => setShowParticipants(false)}
                className="rounded-full bg-white p-2 text-slate-400 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 max-h-[60vh] overflow-y-auto p-2">
              {loadingParticipants ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span className="mt-2 text-sm">Loading list...</span>
                </div>
              ) : participantsError ? (
                <div className="m-4 rounded-xl bg-red-50 py-8 text-center text-red-500">
                  {participantsError}
                </div>
              ) : participants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Users className="h-12 w-12 opacity-20" />
                  <p className="mt-2">No participants yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white shadow-sm ring-2 ring-white">
                        {participant.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-800">
                          {participant.username}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {participant.email}
                        </p>
                      </div>
                      {participant.id === Number(event.created_by_user_id) && (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-yellow-700 uppercase">
                          Host
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
