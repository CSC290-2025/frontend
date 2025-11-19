import { useState } from 'react';
import { Upload } from 'lucide-react';
import { useCreateEvent } from '@/features/freecycle/hooks/useEvent';
import { useCurrentUser } from '@/features/freecycle/hooks/useFreecycle'; // Import Mock Hook

interface PostEventFormProps {
  _onSuccess?: () => void;
}

export default function PostEventForm({ _onSuccess }: PostEventFormProps) {
  //  Mock User ID
  const { data: currentUser } = useCurrentUser();
  // const currentUserId = currentUser?.id || 1;
  const currentUserId = 2;

  const [formData, setFormData] = useState({
    host_user_id: currentUserId,
    title: '',
    description: '',
    image_url: '',
    total_seats: 0,
    start_at: '',
    end_at: '',
    address_id: 1,
    organization_id: 1,
    event_tag_id: 1,
    volunteer_required: false,
    volunteer_amount: 0,
    volunteer_speciality: '',
    volunteer_description: '',
  });

  const [loading, setLoading] = useState(false);

  const useCreateEventMock = () => {
    const mockMutateAsync = async (payload: any) => {
      console.log('MOCK: Attempting to create event with payload:', payload);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (payload.title.toLowerCase() === 'fail') {
            reject({
              message: 'MOCK API Error: Failed to create event',
              response: { data: { error: 'Validation failed' } },
            });
          } else {
            resolve({ success: true, eventId: 999 });
          }
        }, 1500);
      });
    };
    return { mutateAsync: mockMutateAsync, isPending: loading };
  };

  const { mutateAsync: createEvent, isPending } = useCreateEventMock();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!formData.title.trim()) {
      alert('Please enter an event title');
      setLoading(false);
      return;
    }

    if (!formData.start_at || !formData.end_at) {
      alert('Please select both start and end dates');
      setLoading(false);
      return;
    }

    // Convert datetime-local to ISO format
    const formatDatetime = (datetimeLocal: string): string => {
      if (!datetimeLocal) return '';
      const date = new Date(datetimeLocal);
      return date.toISOString();
    };

    const payload = {
      host_user_id: currentUserId,
      title: formData.title,
      description: formData.description,
      total_seats: formData.volunteer_required ? formData.volunteer_amount : 0,
      start_at: formatDatetime(formData.start_at),
      end_at: formatDatetime(formData.end_at),
      address_id: formData.address_id,
      organization_id: formData.organization_id,
      event_tag_id: formData.event_tag_id,
    };

    // Prepare volunteer payload if needed
    const volunteerPayload = formData.volunteer_required
      ? {
          speciality: formData.volunteer_speciality,
          amount: formData.volunteer_amount,
          description: formData.volunteer_description,
        }
      : null;

    try {
      const promises = [createEvent(payload)];

      // if (volunteerPayload) {
      //   // promises.push(createVolunteer(volunteerPayload));
      // }

      await Promise.all(promises);
      alert('Event created successfully!');
      _onSuccess?.();
    } catch (err: any) {
      console.log('Submitting event with payload:', payload);
      console.log('Volunteer payload:', volunteerPayload);
      console.error('Event creation error:', err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to create event';
      alert(`Failed to create event: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const isSubmitting = loading || isPending;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Post an Event</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl bg-white p-8 shadow-md"
      >
        {/* Image URL */}
        <div className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:bg-gray-100">
          <Upload className="mb-2 h-12 w-12 text-gray-400" />
          <p className="text-sm text-gray-600">Upload photo</p>
          <input
            type="text"
            placeholder="Image URL"
            value={formData.image_url}
            onChange={(e) =>
              setFormData({ ...formData, image_url: e.target.value })
            }
            className="mt-4 w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        {/* Event Title */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Event Title
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Event title (Type 'fail' to test error)"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Start At
            </label>
            <input
              type="datetime-local"
              value={formData.start_at}
              onChange={(e) =>
                setFormData({ ...formData, start_at: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              End At
            </label>
            <input
              type="datetime-local"
              value={formData.end_at}
              onChange={(e) =>
                setFormData({ ...formData, end_at: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Address, Organization, Event Tag IDs */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Address ID
            </label>
            <input
              type="number"
              value={formData.address_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address_id: parseInt(e.target.value) || 1,
                })
              }
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Organization ID
            </label>
            <input
              type="number"
              value={formData.organization_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  organization_id: parseInt(e.target.value) || 1,
                })
              }
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Event Tag ID
            </label>
            <input
              type="number"
              value={formData.event_tag_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  event_tag_id: parseInt(e.target.value) || 1,
                })
              }
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Event Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        {/* Volunteer */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Volunteer
          </label>
          <p className="mb-3 text-sm text-gray-600">
            Do you want any volunteer for your event?
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

        {/* Volunteer fields */}
        {formData.volunteer_required && (
          <>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Volunteer speciality
              </label>
              <input
                type="text"
                value={formData.volunteer_speciality}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    volunteer_speciality: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Amount
              </label>
              <input
                type="number"
                value={formData.volunteer_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    volunteer_amount: parseInt(e.target.value) || 0,
                  })
                }
                className="w-24 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Description
              </label>
              <textarea
                value={formData.volunteer_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    volunteer_description: e.target.value,
                  })
                }
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-cyan-500 py-3 font-medium text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}
