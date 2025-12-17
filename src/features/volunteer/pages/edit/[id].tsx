import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@/router';
import { apiClient } from '@/lib/apiClient';
import {
  ArrowLeft,
  X,
  Image as ImageIcon,
  Plus,
  MapPin,
  Calendar,
  Clock,
  Users,
  LayoutTemplate,
  Building2,
  FileText,
} from 'lucide-react';

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
  const [uploadedImage, setUploadedImage] = useState<
    string | ArrayBuffer | null
  >(null);

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
          // Set the existing image
          if (event.image_url) {
            setUploadedImage(event.image_url);
          }
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        setFormData((prev) => ({
          ...prev,
          image_url: typeof reader.result === 'string' ? reader.result : '',
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setFormData((prev) => ({
      ...prev,
      image_url: '',
    }));
  };

  const getStartDatePart = () => {
    if (!formData.start_at) return '';
    return formData.start_at.substring(0, 10);
  };

  const handleSubmit = async () => {
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
      image_url: typeof uploadedImage === 'string' ? uploadedImage : undefined,
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

  const renderSectionHeader = (icon: React.ReactNode, title: string) => (
    <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-800">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </span>
      {title}
    </h2>
  );

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading event data...</div>
    );
  }

  if (error && !isLoading) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-lg font-bold text-gray-900">Edit Opportunity</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="animate-in fade-in slide-in-from-top-2 mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <div className="flex items-center gap-2 font-semibold">
              <X className="h-4 w-4" />
              Update Error
            </div>
            <p className="mt-1 ml-6">{error}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Cover Image */}
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md">
            <div className="p-6">
              {renderSectionHeader(
                <ImageIcon className="h-5 w-5" />,
                'Cover Image'
              )}
              <div className="relative">
                {uploadedImage ? (
                  <div className="group relative overflow-hidden rounded-xl border border-gray-200">
                    <img
                      src={
                        typeof uploadedImage === 'string'
                          ? uploadedImage
                          : undefined
                      }
                      alt="Uploaded"
                      className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
                    <button
                      onClick={removeImage}
                      className="absolute top-4 right-4 rounded-full bg-white/90 p-2 text-gray-700 shadow-lg backdrop-blur-sm transition-transform hover:scale-110 hover:text-red-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/50">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Plus className="h-6 w-6" />
                    </div>
                    <span className="text-lg font-medium text-gray-700">
                      Upload cover photo
                    </span>
                    <span className="mt-1 text-sm text-gray-500">
                      PNG, JPG up to 10MB
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>
          </section>

          {/* Basic Information */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            {renderSectionHeader(
              <LayoutTemplate className="h-5 w-5" />,
              'Basic Information'
            )}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={6}
                  value={formData.description || ''}
                  onChange={handleChange}
                  className="w-full resize-none rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </section>

          {/* Schedule & Capacity */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            {renderSectionHeader(
              <Calendar className="h-5 w-5" />,
              'Schedule & Capacity'
            )}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Start Time (Date & Time) *
                </label>
                <input
                  type="datetime-local"
                  name="start_at"
                  value={formData.start_at || ''}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  End Time (Time Only) *
                </label>
                <input
                  type="time"
                  name="end_at"
                  value={formData.end_at || ''}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Registration Deadline *
                </label>
                <input
                  type="date"
                  name="registration_deadline"
                  value={formData.registration_deadline || ''}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Total Seats *
                </label>
                <input
                  type="number"
                  name="total_seats"
                  value={formData.total_seats || 1}
                  onChange={handleChange}
                  min={currentParticipants}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum: {currentParticipants} (current participants)
                </p>
              </div>
            </div>
          </section>

          {/* Category Tags */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            {renderSectionHeader(<FileText className="h-5 w-5" />, 'Category')}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(tag);
                    setFormData((prev) => ({ ...prev, tag }));
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedCategory === tag
                      ? 'bg-blue-600 text-white shadow-md ring-2 shadow-blue-200 ring-blue-600 ring-offset-1'
                      : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-gray-200 bg-white px-8 py-3.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-xl bg-lime-400 px-8 py-4 text-base font-bold text-gray-900 shadow-lg shadow-lime-200/50 transition-all hover:-translate-y-1 hover:bg-lime-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-800 border-t-transparent"></div>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
