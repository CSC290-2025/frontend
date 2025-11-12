import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from '@/router';
import { ArrowLeft, Calendar, Clock, Edit, Trash2, Users } from 'lucide-react';

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

export default function VolunteerDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams('/volunteer/detail/:id');

  const [event, setEvent] = useState<VolunteerEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const currentUserId = 1; // Mock user ID

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<ApiResponse<EventDetailResponse>>(
          `http://localhost:3000/api/v1/volunteer/${id}`
        );

        if (response.data.success) {
          const { event: fetchedEvent, is_joined: userJoinedStatus } =
            response.data.data;

          setEvent(fetchedEvent);
          setIsJoined(userJoinedStatus);
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

  const handleJoinEvent = async () => {
    setIsSubmitting(true);
    setActionError(null);
    const joinData = { userId: currentUserId };

    try {
      const response = await axios.post<ApiResponse<{ event: VolunteerEvent }>>(
        `http://localhost:3000/api/v1/volunteer/${id}/join`,
        joinData
      );
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
    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = await axios.delete<
        ApiResponse<{ event: VolunteerEvent }>
      >(`http://localhost:3000/api/v1/volunteer/${id}/join`, {
        data: { userId: currentUserId },
      });
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
    if (
      !window.confirm(
        'Are you sure you want to delete this event? This cannot be undone.'
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = await axios.delete(
        `http://localhost:3000/api/v1/volunteer/${id}`
      );
      if (response.data.success) {
        navigate('/volunteer/board'); // Navigate back to the main board/homepage
      } else {
        throw new Error(response.data.message || 'Failed to delete event');
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormattedDate = (dateString: string | null) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'Date TBD';
  };

  const getFormattedTime = (start: string | null, end: string | null) => {
    if (!start || !end) return 'Time TBD';
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

  const getFormattedDeadline = (dateString: string | null) => {
    return dateString
      ? new Date(dateString).toLocaleDateString()
      : 'No deadline';
  };

  const getSpotsLeft = () => {
    if (!event) return 0;
    return event.total_seats - event.current_participants;
  };

  const getProgressWidth = () => {
    if (!event || event.total_seats === 0) return '0%';
    return `${(event.current_participants / event.total_seats) * 100}%`;
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!event) {
    return (
      <div className="p-8 text-center text-gray-500">Event not found.</div>
    );
  }

  const isEventFull = event.current_participants >= event.total_seats;
  const isOwner = event.created_by_user_id === currentUserId;

  const renderActionButton = () => {
    const disabled = isSubmitting || (isEventFull && !isJoined);
    const className = `w-full rounded-full py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
      isJoined
        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        : isEventFull
          ? 'bg-gray-200 text-gray-500'
          : 'bg-lime-400 text-gray-800 hover:bg-lime-500'
    }`;
    const text = isSubmitting
      ? isJoined
        ? 'Leaving...'
        : 'Joining...'
      : isJoined
        ? 'Leave Event'
        : isEventFull
          ? 'Event Full'
          : 'Join Now';

    const handler = isJoined ? handleLeaveEvent : handleJoinEvent;

    return (
      <button onClick={handler} disabled={disabled} className={className}>
        {text}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (Back button and controls) */}
      <div className="border-b border-gray-200 bg-white">
        {/* MODIFIED: Reduced max-w in header slightly for tighter desktop control, kept centered */}
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden font-medium sm:inline">
              Back to Volunteer Jobs
            </span>{' '}
            {/* Hiding text on tiny screens */}
          </button>

          <div className="flex gap-3">
            {isOwner && (
              <>
                <button
                  onClick={() =>
                    navigate('/volunteer/edit/:id', { params: { id } })
                  }
                  className="rounded-full p-2 hover:bg-gray-100"
                  title="Edit Event"
                >
                  <Edit className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={handleDeleteEvent}
                  disabled={isSubmitting}
                  className="rounded-full p-2 hover:bg-gray-100 disabled:opacity-50"
                  title="Delete Event"
                >
                  <Trash2 className="h-5 w-5 text-red-500" />
                </button>
              </>
            )}
            {/* Keeping share/favorite buttons */}
            <button
              className="rounded-full p-2 hover:bg-gray-100"
              title="Share"
            ></button>
            <button
              className="rounded-full p-2 hover:bg-gray-100"
              title="Favorite"
            ></button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Centered, max-width controlled */}
      {/* MODIFIED: Used max-w-3xl for optimal readability in a centered column, kept px-4 for mobile padding */}
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        {/* Main Content (Image, Title, Info Cards, Description) */}
        <div className="space-y-6">
          <img
            src={event.image_url || 'https://via.placeholder.com/800x400'}
            alt={event.title}
            // MODIFIED: Responsive height (h-56 on mobile, h-80 on medium screens, h-96 on large screens)
            className="h-56 w-full rounded-2xl object-cover shadow-lg md:h-80 lg:h-96"
          />

          {renderActionButton()}

          <div>
            <div className="mb-4 flex items-start justify-between">
              <div>
                {/* MODIFIED: Smaller title size on mobile, larger on larger screens */}
                <h1 className="mb-2 text-3xl font-bold text-gray-800 sm:text-4xl">
                  {event.title}
                </h1>
                <p className="text-base text-gray-600 sm:text-lg">
                  by King Vonny Organization
                </p>
              </div>
            </div>
          </div>

          {/* Event Info Cards: Flexible grid (2 on mobile, 4 on medium screens) */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {/* Date */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <Calendar className="mb-2 h-5 w-5 text-blue-500 md:h-6 md:w-6" />
              <div className="text-xs text-gray-600 md:text-sm">Date</div>{' '}
              {/* Adjusted text size for responsiveness */}
              <div className="text-sm font-semibold text-gray-800 md:text-base">
                {getFormattedDate(event.start_at)}
              </div>
            </div>
            {/* Registration Deadline */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <Clock className="mb-2 h-5 w-5 text-blue-500 md:h-6 md:w-6" />
              <div className="text-xs text-gray-600 md:text-sm">
                Deadline
              </div>{' '}
              {/* Shortened label for better fit on small screens */}
              <div className="text-sm font-semibold text-gray-800 md:text-base">
                {getFormattedDeadline(event.registration_deadline)}
              </div>
            </div>
            {/* Time */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <Clock className="mb-2 h-5 w-5 text-blue-500 md:h-6 md:w-6" />
              <div className="text-xs text-gray-600 md:text-sm">Time</div>
              <div className="text-sm font-semibold text-gray-800 md:text-base">
                {getFormattedTime(event.start_at, event.end_at)}
              </div>
            </div>
            {/* Volunteers */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <Users className="mb-2 h-5 w-5 text-blue-500 md:h-6 md:w-6" />
              <div className="text-xs text-gray-600 md:text-sm">Volunteers</div>
              <div className="text-sm font-semibold text-gray-800 md:text-base">
                {event.current_participants}/{event.total_seats} Joined
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-800 sm:text-2xl">
              About This Opportunity
            </h2>
            <p className="mb-4 leading-relaxed whitespace-pre-wrap text-gray-700">
              {event.description || 'No description provided.'}
            </p>
          </div>

          {/* Sidebar content (now integrated into the main flow) */}
          {!isOwner && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-gray-600">Spots Available</span>
                  <span className="font-bold text-gray-800">
                    {getSpotsLeft()} left
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-lime-400"
                    style={{ width: getProgressWidth() }}
                  />
                </div>
              </div>

              {actionError && (
                <p className="mb-3 text-center text-sm text-red-600">
                  {actionError}
                </p>
              )}

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold text-gray-800">6 hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category</span>
                  <span className="font-semibold text-gray-800">Education</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Difficulty</span>
                  <span className="font-semibold text-gray-800">Beginner</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
