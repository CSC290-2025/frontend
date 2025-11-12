import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from '@/router';
import { ArrowLeft } from 'lucide-react';

// ... (Interface definitions remain the same)
interface VolunteerEvent {
  id: number;
  title: string;
  description: string | null;
  start_at: string | null;
  end_at: string | null;
  total_seats: number;
  image_url: string | null;
}

interface UpdateEventData {
  title?: string;
  description?: string;
  start_at?: string;
  end_at?: string;
  total_seats?: number;
  image_url?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const formatISODateForInput = (isoString: string | null | undefined) => {
  if (!isoString) return '';
  // Ensure the output format is YYYY-MM-DDTHH:MM, required for datetime-local
  return isoString.substring(0, 16);
};

export default function EditVolunteerPage() {
  const navigate = useNavigate();
  const { id } = useParams('/volunteer/edit/:id');

  const [formData, setFormData] = useState<Partial<UpdateEventData>>({
    title: '',
    description: '',
    start_at: '',
    end_at: '',
    total_seats: 10,
    image_url: '',
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
        const response = await axios.get<
          ApiResponse<{ event: VolunteerEvent }>
        >(`http://localhost:3000/api/v1/volunteer/${id}`);
        if (response.data.success) {
          const event = response.data.data.event;
          setFormData({
            title: event.title,
            description: event.description || '',
            start_at: formatISODateForInput(event.start_at),
            end_at: formatISODateForInput(event.end_at),
            total_seats: event.total_seats,
            image_url: event.image_url || '',
          });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Format datetime-local input back to ISO string expected by the API
    const payload = {
      ...formData,
      // Append time zone information for the backend if needed (adjust :00.000Z as per your backend requirements)
      start_at: formData.start_at ? `${formData.start_at}:00.000Z` : undefined,
      end_at: formData.end_at ? `${formData.end_at}:00.000Z` : undefined,
    };

    try {
      const response = await axios.put(
        `http://localhost:3000/api/v1/volunteer/${id}`,
        payload
      );

      if (response.data.success) {
        alert('Event updated successfully!');
        navigate('/volunteer/detail/:id', { params: { id } }); // Go back to detail page
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
      {/* Header (Responsive adjustments applied to padding and title display) */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-4 sm:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden font-medium sm:inline">Back to Event</span>
          </button>
          {/* Title hides on extra small screens, centers on small screens */}
          <h1 className="flex-1 text-center text-xl font-bold text-gray-800 sm:ml-8 sm:text-left">
            Edit Volunteer Opportunity
          </h1>
        </div>
      </div>

      {/* Main Content (Responsive adjustments applied to padding) */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
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

          {/* Schedule & Capacity (Responsive Grid: Stacks on mobile, 2 columns on tablet/desktop) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-800">
              Schedule & Capacity
            </h2>
            {/* Change to grid-cols-1 on small screens, grid-cols-2 on medium/larger */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Start Time *
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
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  name="end_at"
                  value={formData.end_at || ''}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
              {/* Force Total Seats to span the entire width on small screens for better alignment with the two datetime inputs */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Total Seats *
                </label>
                <input
                  type="number"
                  name="total_seats"
                  value={formData.total_seats}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
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

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-300 bg-red-100 p-3 text-red-800">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Action Buttons (Responsive: full-width stack on mobile, right-aligned on desktop) */}
          <div className="flex flex-col-reverse justify-end gap-4 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full rounded-full border border-gray-300 px-8 py-3 font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-blue-500 px-8 py-3 font-medium text-white hover:bg-blue-600 disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
