import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { useNavigate } from '@/router';
import Sidebar from '@/components/main/Sidebar';
import {
  useCreateEvent,
  useCreateVolunteerEvent,
} from '@/features/freecycle/hooks/useEvent';
import { uploadImage } from '@/features/freecycle/api/freecycle.api';
import { useCurrentUser } from '@/features/freecycle/hooks/useFreecycle';
import { useGetAuthMe } from '@/api/generated/authentication';

interface PostEventFormProps {
  _onSuccess?: () => void;
}

export default function PostEventForm({ _onSuccess }: PostEventFormProps) {
  const navigate = useNavigate();
  const { isLoading: isUserLoading } = useCurrentUser();
  const userId = useGetAuthMe().data?.data?.userId ?? null;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    total_seats: '',
    start_at: '',
    end_at: '',
    volunteer_required: false,
    registration_deadline: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { mutateAsync: createEvent } = useCreateEvent();
  const { mutateAsync: createVolunteerEvent } = useCreateVolunteerEvent();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUserLoading) return;
    if (!userId) {
      alert('Please log in to post an event.');
      return;
    }

    if (!formData.title.trim()) {
      alert('Please enter an event title');
      return;
    }
    if (!formData.start_at || !formData.end_at) {
      alert('Please select both start and end dates');
      return;
    }
    if (
      formData.volunteer_required &&
      (!formData.total_seats || parseInt(formData.total_seats) < 1)
    ) {
      alert('Please enter at least 1 volunteer needed');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmEvent = async () => {
    if (!userId) {
      setError('User not found. Please log in.');
      setShowConfirmDialog(false);
      return;
    }
    setShowConfirmDialog(false);
    setLoading(true);
    setError(null);

    try {
      let finalImageUrl = formData.image_url;
      if (selectedFile) {
        try {
          const uploadResult = await uploadImage(selectedFile);
          finalImageUrl = uploadResult.url;
        } catch (uploadErr) {
          console.error('Upload failed:', uploadErr);
          alert('Failed to upload image.');
          setLoading(false);
          return;
        }
      }

      const formatDateAndTime = (datetimeLocal: string) => {
        if (!datetimeLocal) return { date: '', time: '' };
        const [date, time] = datetimeLocal.split('T');
        return { date, time };
      };
      const startDateTime = formatDateAndTime(formData.start_at);
      const endDateTime = formatDateAndTime(formData.end_at);

      const eventPayload = {
        host_user_id: userId,
        title: formData.title,
        description: formData.description,
        total_seats: 0,
        start_date: startDateTime.date,
        start_time: startDateTime.time,
        end_date: endDateTime.date,
        end_time: endDateTime.time,
        image_url: finalImageUrl || '',
        organization: {
          id: 1,
          name: 'Freecycle',
          email: 'info@freecycle.org',
          phone_number: '+1-800-FREECYCLE',
        },
        address: {
          id: 1,
          name: formData.description,
        },
      };

      console.log('Creating event with payload:', eventPayload);
      const eventResult = await new Promise((resolve, reject) => {
        createEvent(eventPayload, {
          onSuccess: (data) => {
            console.log('Event created response:', data);
            resolve(data);
          },
          onError: reject,
        });
      });
      console.log('Event created successfully');
      console.log('volunteer_required:', formData.volunteer_required);

      if (formData.volunteer_required) {
        console.log('Creating volunteer event...');
        const volunteerEventPayload = {
          title: formData.title,
          description: formData.description,
          image_url: finalImageUrl || '',
          total_seats: formData.total_seats
            ? parseInt(formData.total_seats)
            : 0,
          start_at: `${startDateTime.date}T${startDateTime.time}:00Z`,
          end_at: `${endDateTime.date}T${endDateTime.time}:00Z`,
          created_by_user_id: userId,
          registration_deadline: formData.registration_deadline
            ? new Date(formData.registration_deadline).toISOString()
            : null,
          tag: 'Freecycle',
        };

        console.log(
          'Creating volunteer event with payload:',
          volunteerEventPayload
        );
        const volunteerResult = await new Promise((resolve, reject) => {
          createVolunteerEvent(volunteerEventPayload, {
            onSuccess: (data) => {
              console.log('Volunteer event created response:', data);
              resolve(data);
            },
            onError: reject,
          });
        });
        console.log('Volunteer event created successfully');
      }

      // Show success modal
      setShowSuccessModal(true);

      // Delay navigation to allow user to see success message
      setTimeout(() => {
        navigate('/freecycle' as any);
        _onSuccess?.();
      }, 1500);
    } catch (err: any) {
      console.error('Process Error:', err);
      console.error('Error details:', {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
      });
      const msg =
        err?.response?.data?.message || err?.message || 'Something went wrong';
      setError(`Failed: ${msg}`);
      alert(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-w-full">
      <div className="flex-shrink-0">
        <Sidebar />
      </div>
      <div className="min-h-screen flex-1 bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mt-6 mb-8">
            <div className="flex">
              <div className="mr-2 mb-4 flex items-center gap-4">
                <button
                  onClick={() => navigate('/freecycle')}
                  className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                  aria-label="Back"
                >
                  <svg
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-4xl font-bold text-transparent">
                  Post an Event
                </h1>
                <p className="mt-2 text-gray-600">
                  Share your community event with everyone
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl"
          >
            {/* Image Upload */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-900">
                Photo
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-cyan-300 bg-gradient-to-br from-cyan-50 to-blue-50 p-8 transition-all duration-300 hover:border-cyan-500 hover:bg-cyan-100/50"
              >
                {previewUrl ? (
                  <div className="relative flex h-full w-full justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-[300px] w-auto rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-red-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 rounded-full bg-cyan-100 p-4">
                      <Upload className="h-8 w-8 text-cyan-600" />
                    </div>
                    <p className="text-base font-semibold text-gray-900">
                      Click to upload photo
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      JPG, PNG • Max 5MB
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-900">
                Event Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Event title (e.g., Freecycle Community Giveaway)"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-900">
                  Start At
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_at}
                  onChange={(e) =>
                    setFormData({ ...formData, start_at: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-900">
                  End At
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_at}
                  onChange={(e) =>
                    setFormData({ ...formData, end_at: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-900">
                Description
              </label>
              <p className="mb-3 text-sm text-gray-600">
                Describe your event: include location, time, required items,
                planned activities, and any important notes.
              </p>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="E.g., Central Park, Bangkok. Join our secondhand exchange from 9:00 AM–12:00 PM. Bring gently used items to swap or share. Free refreshments provided."
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-900">
                Also Create Volunteer Event?
              </label>
              <p className="mb-3 text-sm text-gray-600">
                Do you want to also create a volunteer event for this?
              </p>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, volunteer_required: true })
                  }
                  className={`flex items-center gap-2 rounded-lg border px-6 py-3 ${
                    formData.volunteer_required
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                      : 'border-gray-300 bg-gray-50 text-gray-700'
                  }`}
                >
                  Yes
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, volunteer_required: false })
                  }
                  className={`flex items-center gap-2 rounded-lg border px-6 py-3 ${
                    !formData.volunteer_required
                      ? 'border-gray-400 bg-gray-100 text-gray-700'
                      : 'border-gray-300 bg-gray-50 text-gray-700'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Volunteer Event Fields */}
            {formData.volunteer_required && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Total Volunteers Needed
                  </label>
                  <input
                    type="number"
                    value={formData.total_seats}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        // total_seats: parseInt(e.target.value) || 0,
                        total_seats: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Registration Deadline (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.registration_deadline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registration_deadline: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Volunteer Event Tag
                  </label>
                  <p className="text-sm text-gray-700">Freecycle</p>
                </div>
              </>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isUserLoading}
              className="w-full rounded-lg bg-cyan-500 py-3 font-medium text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Post'}
            </button>
          </form>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-lg font-semibold text-gray-900">
                Post this event?
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Once posted, your event will be visible to the community. You
                can edit it on the event page if needed.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEvent}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-cyan-500 py-2 font-medium text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
                >
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-center text-lg font-semibold text-gray-900">
                Event Created Successfully!
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Your event has been posted and is now visible to the community.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
