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
  // No changes needed here, as the is_joined status is passed separately in the API response.
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// NOTE: We update the API response structure to explicitly include the 'is_joined' flag
interface EventDetailResponse {
  event: VolunteerEvent;
  is_joined: boolean; // <--- The crucial piece of data from the server
}

export default function VolunteerDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams('/volunteer/detail/:id');

  const [event, setEvent] = useState<VolunteerEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // isJoined starts as false, but is immediately corrected by the API call in useEffect
  const [isJoined, setIsJoined] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Simulated current user ID - IMPORTANT: In a real app, this would come from an auth context.
  const currentUserId = 1;

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
          // *** THIS IS THE CRITICAL LINE: Initializing state based on API data ***
          // The API provides the source of truth, so the button will display correctly.
          setIsJoined(userJoinedStatus);
        } else {
          throw new Error('API did not return success');
        }
      } catch (err: any) {
        // ... (error handling remains the same)
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
    // No dependency on isJoined here, as fetchEvent determines the initial state.
  }, [id]);

  // --- Action Handlers ---
  // ... (handleJoinEvent and handleLeaveEvent remain the same, as they correctly update the state: setEvent and setIsJoined) ...

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
        setIsJoined(true); // Update state to Joined
        alert('Successfully joined event!');
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
        setIsJoined(false); // Update state to Not Joined
        alert('Successfully left event.');
      } else {
        throw new Error(response.data.message || 'Failed to leave event');
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (handleDeleteEvent and Utility Functions remain the same) ...

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
        alert('Event deleted successfully.');
        navigate('/volunteer/board'); // Go back to the main board
      } else {
        throw new Error(response.data.message || 'Failed to delete event');
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Utility Functions ---

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

  // --- Loading/Error/Not Found States ---

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

  // --- Derived State ---
  const isEventFull = event.current_participants >= event.total_seats;
  const isOwner = event.created_by_user_id === currentUserId;

  // --- Render ---

  // Unified button logic for the two main action buttons (Left and Right)
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
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Volunteer Jobs</span>
          </button>

          {/* --- UPDATED HEADER BUTTONS --- */}
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
            <button
              className="rounded-full p-2 hover:bg-gray-100"
              title="Share"
            ></button>
            <button
              className="rounded-full p-2 hover:bg-gray-100"
              title="Favorite"
            ></button>
          </div>
          {/* --- END UPDATE --- */}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-8 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="col-span-2 space-y-6">
            <img
              src={event.image_url || 'https://via.placeholder.com/800x400'}
              alt={event.title}
              className="h-96 w-full rounded-2xl object-cover shadow-lg"
              //
            />
            {/* *** The action button will correctly reflect the fetched isJoined state *** */}
            {renderActionButton()}
            {/* *** END CHANGE *** */}
            <div>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h1 className="mb-2 text-4xl font-bold text-gray-800">
                    {event.title}
                  </h1>
                  <p className="text-lg text-gray-600">
                    by King Vonny Organization
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <Calendar className="mb-2 h-6 w-6 text-blue-500" />
                <div className="text-sm text-gray-600">Date</div>
                <div className="font-semibold text-gray-800">
                  {getFormattedDate(event.start_at)}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <Clock className="mb-2 h-6 w-6 text-blue-500" />
                <div className="text-sm text-gray-600">
                  Registration Deadline
                </div>
                <div className="font-semibold text-gray-800">
                  {getFormattedDeadline(event.registration_deadline)}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <Clock className="mb-2 h-6 w-6 text-blue-500" />
                <div className="text-sm text-gray-600">Time</div>
                <div className="font-semibold text-gray-800">
                  {getFormattedTime(event.start_at, event.end_at)}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <Users className="mb-2 h-6 w-6 text-blue-500" />
                <div className="text-sm text-gray-600">Volunteers</div>
                <div className="font-semibold text-gray-800">
                  {event.current_participants}/{event.total_seats} Joined
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-2xl font-bold text-gray-800">
                About This Opportunity
              </h2>
              <p className="mb-4 leading-relaxed whitespace-pre-wrap text-gray-700">
                {event.description || 'No description provided.'}
              </p>
            </div>

            {/* Static Content (What You'll Do, Requirements, Location) */}
            {/* ... (Your static JSX for these sections) ... */}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* --- UPDATED: Join Card (Hides for Owner) --- */}
            {!isOwner && (
              <div className="sticky top-8 rounded-2xl border border-gray-200 bg-white p-6">
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

                {/* *** The action button will correctly reflect the fetched isJoined state *** */}
                <div className="mb-4">{renderActionButton()}</div>
                {/* *** END CHANGE *** */}

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
                    <span className="font-semibold text-gray-800">
                      Education
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Difficulty</span>
                    <span className="font-semibold text-gray-800">
                      Beginner
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
