import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@/router';
import { apiClient } from '@/lib/apiClient';
import { ArrowLeft } from 'lucide-react';

interface VolunteerEvent {
  id: number;
  title: string;
  description: string | null;
  start_at: string | null;
  end_at: string | null;
  registration_deadline: string | null;
  total_seats: number;
  current_participants: number;
  image_url: string | null;
  tag: string | undefined;
}

interface UpdateEventData {
  title?: string;
  description?: string;
  start_at?: string;
  end_at?: string;
  registration_deadline?: string;
  total_seats?: number;
  image_url?: string;
  tag?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const formatISODateForInput = (
  isoString: string | null | undefined,
  type: 'datetime-local' | 'date' | 'time'
) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (type === 'date') {
    return `${year}-${month}-${day}`;
  }
  if (type === 'time') {
    return `${hours}:${minutes}`;
  }
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function EditVolunteerPage() {
  const navigate = useNavigate();
  const { id } = useParams('/volunteer/edit/:id');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const postTag = [
    'Environment',
    'Freecycle',
    'Weather',
    'Education',
    'Funding',
    'Disability/Elderly Support',
    'Community & Social',
  ];
  const [tags] = useState(postTag);
  const [currentParticipants, setCurrentParticipants] = useState(0);
  const [formData, setFormData] = useState<Partial<UpdateEventData>>({
    title: '',
    description: '',
    start_at: '',
    end_at: '',
    registration_deadline: '',
    total_seats: 10,
    image_url: '',
    tag: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<
          ApiResponse<{ event: VolunteerEvent }>
        >(`/api/v1/volunteer/${id}`);
        if (response.data.success) {
          const event = response.data.data.event;
          setCurrentParticipants(event.current_participants);
          setFormData({
            title: event.title,
            description: event.description || '',
            start_at: formatISODateForInput(event.start_at, 'datetime-local'),
            end_at: formatISODateForInput(event.end_at, 'time'),
            registration_deadline: formatISODateForInput(
              event.registration_deadline,
              'date'
            ),
            total_seats: event.total_seats,
            image_url: event.image_url || '',
            tag: event.tag,
          });
          setSelectedCategory(event.tag);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  const getStartDatePart = () => {
    if (!formData.start_at) return '';
    return formData.start_at.substring(0, 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate total_seats
    if (formData.total_seats && formData.total_seats < currentParticipants) {
      setError(
        `Total seats cannot be less than current participants (${currentParticipants})`
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const startDatePart = getStartDatePart();
    const payload = {
      ...formData,
      start_at: formData.start_at ? `${formData.start_at}` : undefined,
      end_at:
        formData.end_at && startDatePart
          ? `${startDatePart}T${formData.end_at}`
          : undefined,
      registration_deadline: formData.registration_deadline
        ? `${formData.registration_deadline}`
        : undefined,
      total_seats: formData.total_seats
        ? Number(formData.total_seats)
        : undefined,
      tag: selectedCategory,
    };

    Object.keys(payload).forEach(
      (key) =>
        payload[key as keyof typeof payload] === undefined &&
        delete payload[key as keyof typeof payload]
    );

    try {
      const response = await apiClient.put(
        `/api/v1/volunteer/${id}/update`,
        payload
      );

      if (response.data.success) {
        alert('Event updated successfully!');
        navigate('/volunteer/detail/:id', { params: { id } });
      } else {
        throw new Error('API returned an error');
      }
    } catch (err: any) {
      console.error('Error updating event:', err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          err.message ||
          'An unknown error occurred.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading event data...</div>
    );
  }

  if (error && !isLoading) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Event</span>
          </button>
          <h1 className="ml-8 text-xl font-bold text-gray-800">
            Edit Volunteer Opportunity
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-800">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={6}
                  value={formData.description || ''}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Schedule & Capacity */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-800">
              Schedule & Capacity
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Start Time (Date & Time) *
                </label>
                <input
                  type="datetime-local"
                  name="start_at"
                  value={formData.start_at || ''}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  End Time (Time Only) *
                </label>
                <input
                  type="time"
                  name="end_at"
                  value={formData.end_at || ''}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Registration Deadline (Date Only) *
                </label>
                <input
                  type="date"
                  name="registration_deadline"
                  value={formData.registration_deadline || ''}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Total Seats *
                </label>
                <input
                  type="number"
                  name="total_seats"
                  value={formData.total_seats || 1}
                  onChange={handleChange}
                  min={currentParticipants}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum: {currentParticipants} (current participants)
                </p>
              </div>
            </div>
          </div>

          {/* Image URL */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-800">
              Cover Image
            </h2>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                type="text"
                name="image_url"
                value={formData.image_url || ''}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {tags.map((category) => {
              const isSelected = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category);
                    setFormData((prev) => ({ ...prev, category }));
                  }}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                      : 'border-gray-300 bg-gray-50 text-gray-700'
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500'
                        : 'border-gray-400'
                    }`}
                  >
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>

                  {category}
                </button>
              );
            })}
          </div>
          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-300 bg-red-100 p-3 text-red-800">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full border border-gray-300 px-8 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-blue-500 px-8 py-3 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
