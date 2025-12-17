import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Save,
  Loader2,
  Image as ImageIcon,
  ChevronLeft,
  Building2,
  BusFront,
  Cloud,
  Hospital,
  BookMarked,
  Phone,
  Eraser,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

import Layout from '@/components/main/Layout';
import TopBar from '@/features/Event_Hub/component/Topbar';
import {
  fetchEventById,
  updateEvent,
} from '@/features/Event_Hub/api/Event.api';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

interface Address {
  id?: number;
  address_line?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  postal_code?: string;
}

interface ApiEventData {
  id: number;
  title: string;
  description: string;
  start_at: string; // ISO
  end_at: string; // ISO
  image_url: string;
  address?: Address;
  event_tag?: { event_tag_name?: { name?: string } };
}

interface EventForm {
  title: string;
  description: string;
  start_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_date: string; // YYYY-MM-DD
  end_time: string; // HH:MM
  category: string;

  imageUrl: string;

  addressLine: string;
  province: string;
  district: string;
  subdistrict: string;
  postalCode: string;

  address_id?: number;
}

const initialFormState: EventForm = {
  title: '',
  description: '',
  start_date: '',
  start_time: '',
  end_date: '',
  end_time: '',
  category: 'events',
  imageUrl: '',
  addressLine: '',
  province: '',
  district: '',
  subdistrict: '',
  postalCode: '',
};

// Helper: format date/time for form inputs
const toLocalDateInput = (d: Date) => d.toISOString().split('T')[0];
const toLocalTimeInput = (d: Date) =>
  d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

const transformApiToForm = (apiData: ApiEventData): EventForm => {
  const start = new Date(apiData.start_at);
  const end = new Date(apiData.end_at);

  return {
    title: apiData.title ?? '',
    description: apiData.description ?? '',
    start_date: toLocalDateInput(start),
    start_time: toLocalTimeInput(start),
    end_date: toLocalDateInput(end),
    end_time: toLocalTimeInput(end),
    category: apiData.event_tag?.event_tag_name?.name || 'events',
    imageUrl: apiData.image_url || '',

    addressLine: apiData.address?.address_line || '',
    province: apiData.address?.province || '',
    district: apiData.address?.district || '',
    subdistrict: apiData.address?.subdistrict || '',
    postalCode: apiData.address?.postal_code || '',

    address_id: apiData.address?.id,
  };
};

const categories = [
  {
    id: 'dashboard',
    icon: Building2,
    label: 'City Insights',
    subtitle: 'Explore City',
  },
  {
    id: 'transport',
    icon: BusFront,
    label: 'Transport',
    subtitle: 'Move around',
  },
  {
    id: 'events',
    icon: Calendar,
    label: 'Events',
    subtitle: 'Local activities',
  },
  {
    id: 'weather',
    icon: Cloud,
    label: 'Weather reports',
    subtitle: 'Forecast',
  },
  {
    id: 'healthcare',
    icon: Hospital,
    label: 'Healthcare',
    subtitle: 'Medical centers',
  },
  { id: 'ai', icon: BookMarked, label: 'Know Ai', subtitle: 'Assistant' },
  { id: 'contact', icon: Phone, label: 'Contact us', subtitle: 'Get help' },
  { id: 'cycle', icon: BusFront, label: 'Free cycle', subtitle: 'Reuse items' },
  { id: 'volunteer', icon: BusFront, label: 'Volunteer', subtitle: 'Join' },
  {
    id: 'waste',
    icon: BusFront,
    label: 'Waste Management',
    subtitle: 'Cleanup',
  },
];

const EditPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const eventId = params.id ? Number(params.id) : null;

  const [formData, setFormData] = useState<EventForm>(initialFormState);
  const [originalData, setOriginalData] = useState<ApiEventData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventCategories = useMemo(() => {
    return categories.filter((c) =>
      ['events', 'cycle', 'volunteer', 'waste'].includes(c.id)
    );
  }, []);

  // Fetch event
  useEffect(() => {
    if (!eventId || Number.isNaN(eventId)) {
      setError('Invalid event ID provided.');
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchEventById(eventId);
        const apiData: ApiEventData =
          (response as any).data?.data || (response as any).data || response;

        setOriginalData(apiData);
        setFormData(transformApiToForm(apiData));
      } catch (err: any) {
        console.error(
          'Error fetching event for edit:',
          err?.response?.data || err
        );
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to load event data.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [eventId]);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleReset = useCallback(() => {
    if (!originalData) return;

    if (
      window.confirm(
        'Are you sure you want to reset all changes to the last saved version?'
      )
    ) {
      setFormData(transformApiToForm(originalData));
    }
  }, [originalData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!eventId) {
        setError('Cannot submit: Event ID is missing.');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      const start_at = `${formData.start_date}T${formData.start_time}:00`;
      const end_at = `${formData.end_date}T${formData.end_time}:00`;

      try {
        await updateEvent(eventId, {
          title: formData.title,
          description: formData.description,
          image_url: formData.imageUrl,
          start_at,
          end_at,
          address_id: formData.address_id,
        });

        alert('Event updated successfully!');
        navigate('/event_hub');
      } catch (err: any) {
        console.error(
          'Error submitting event update:',
          err?.response?.data || err
        );
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to update event. Please check the details and try again.'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [eventId, formData, navigate]
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
          <p className="ml-3 text-lg text-gray-700">Loading event data...</p>
        </div>
      </Layout>
    );
  }

  if (error && !isSubmitting) {
    return (
      <Layout>
        <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4">
          <p className="mb-4 text-xl font-semibold text-red-500">{error}</p>
          <button
            onClick={() => navigate('/event_hub')}
            className="flex items-center rounded-lg bg-cyan-500 px-6 py-2 text-white transition-colors hover:bg-cyan-600"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to Events
          </button>
        </div>
      </Layout>
    );
  }

  if (!eventId) {
    return (
      <Layout>
        <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4">
          <p className="mb-4 text-xl font-semibold text-red-500">
            Error: No Event ID was provided for editing.
          </p>
          <button
            onClick={() => navigate('/event_hub')}
            className="flex items-center rounded-lg bg-cyan-500 px-6 py-2 text-white transition-colors hover:bg-cyan-600"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to Events
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <TopBar topCategories={eventCategories} />

        <div className="mx-auto max-w-5xl p-6">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-800">
              <span className="text-cyan-500">Edit Event:</span>{' '}
              {formData.title}
            </h1>
            <button
              onClick={() => navigate('/event_hub')}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 transition-colors hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="font-medium">Back to Events</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div
                className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
              <h2 className="mb-6 border-b pb-2 text-2xl font-semibold text-gray-800">
                Basic Event Information
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="title"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-cyan-500 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-cyan-500 focus:ring-cyan-500"
                  >
                    {eventCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="imageUrl"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Image URL
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      placeholder="e.g., https://example.com/image.jpg"
                      className="w-full rounded-lg border border-gray-300 p-3 pl-10 focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {formData.imageUrl && (
                  <div className="md:col-span-2">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Image Preview:
                    </p>
                    <img
                      src={formData.imageUrl}
                      alt="Event Preview"
                      className="max-h-48 w-full rounded-lg border border-gray-200 object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          'https://via.placeholder.com/400x150?text=Image+Load+Failed';
                      }}
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    required
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-cyan-500 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
              <h2 className="mb-6 border-b pb-2 text-2xl font-semibold text-gray-800">
                Date & Time
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
                <div>
                  <label
                    htmlFor="start_date"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 p-3 pl-10 focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="start_time"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="time"
                      id="start_time"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 p-3 pl-10 focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="end_date"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      id="end_date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 p-3 pl-10 focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="end_time"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="time"
                      id="end_time"
                      name="end_time"
                      value={formData.end_time}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 p-3 pl-10 focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
              <h2 className="mb-6 border-b pb-2 text-2xl font-semibold text-gray-800">
                Event Location
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="addressLine"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Address Line / Street Name{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="addressLine"
                      name="addressLine"
                      value={formData.addressLine}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 p-3 pl-10 focus:border-cyan-500 focus:ring-cyan-500"
                      placeholder="e.g., 123 Community Hall Rd"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="province"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Province/State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-cyan-500 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="district"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-cyan-500 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subdistrict"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Subdistrict
                  </label>
                  <input
                    type="text"
                    id="subdistrict"
                    name="subdistrict"
                    value={formData.subdistrict}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-cyan-500 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="postalCode"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-cyan-500 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
                disabled={isSubmitting || !originalData}
              >
                <Eraser className="h-5 w-5" />
                Reset Changes
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 font-medium text-white transition-colors hover:bg-cyan-600 disabled:bg-cyan-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditPage;
