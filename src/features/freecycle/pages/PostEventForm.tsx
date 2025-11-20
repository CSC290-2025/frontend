import { useState } from 'react';
import { Upload } from 'lucide-react';
import { useCreateEvent } from '@/features/freecycle/hooks/useEvent';

interface PostEventFormProps {
  _onSuccess?: () => void;
}

export default function PostEventForm({ _onSuccess }: PostEventFormProps) {
  const [formData, setFormData] = useState({
    // Regular Event Fields
    host_user_id: 1,
    title: '',
    description: '',
    image_url: '',
    total_seats: 0,
    start_at: '',
    end_at: '',
    address_id: null as number | null,
    organization_id: null as number | null,
    event_tag_id: null as number | null,
    // Volunteer Fields (optional)
    volunteer_required: false,
    department_id: 1,
    created_by_user_id: 1,
    registration_deadline: '',
  });

  const [loading, setLoading] = useState(false);

  const { mutateAsync: createEvent } = useCreateEvent();

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

    // Convert datetime-local to ISO format with Z suffix
    const formatDatetime = (datetimeLocal: string): string => {
      if (!datetimeLocal) return '';
      // datetime-local format: "2025-11-19T02:51"
      // Convert to ISO format: "2025-11-19T02:51:00.000Z"
      const date = new Date(datetimeLocal + ':00');
      return date.toISOString();
    };

    // Regular event payload
    const eventPayload = {
      host_user_id: formData.host_user_id,
      title: formData.title,
      description: formData.description,
      total_seats: formData.volunteer_required ? formData.total_seats : 0,
      start_at: formatDatetime(formData.start_at),
      end_at: formatDatetime(formData.end_at),
      address_id: formData.address_id,
      organization_id: formData.organization_id,
      event_tag_id: formData.event_tag_id,
    };

    // Volunteer event payload (if volunteer is required)
    const volunteerEventPayload = formData.volunteer_required
      ? {
          title: formData.title,
          description: formData.description,
          image_url: formData.image_url,
          total_seats: formData.total_seats,
          start_at: formatDatetime(formData.start_at),
          end_at: formatDatetime(formData.end_at),
          created_by_user_id: formData.created_by_user_id,
          department_id: formData.department_id,
          address_id: formData.address_id,
          registration_deadline: formData.registration_deadline
            ? formatDatetime(formData.registration_deadline)
            : null,
        }
      : null;

    try {
      // Create promises array
      const promises = [createEvent(eventPayload)];

      // Add volunteer event creation if needed
      if (volunteerEventPayload) {
        // TODO: Uncomment when volunteer events API is imported
        // promises.push(createVolunteerEvent(volunteerEventPayload));
      }

      await Promise.all(promises);
      alert(
        formData.volunteer_required
          ? 'Event and Volunteer Event created successfully!'
          : 'Event created successfully!'
      );
      _onSuccess?.();
    } catch (err: any) {
      console.log('Regular Event Payload:', eventPayload);
      if (volunteerEventPayload) {
        console.log('Volunteer Event Payload:', volunteerEventPayload);
      }
      console.error('Event creation error:', err);
      console.error('Response data:', err?.response?.data);
      console.error('Response status:', err?.response?.status);
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
            placeholder="Event title"
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
              value={formData.address_id ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address_id: e.target.value ? parseInt(e.target.value) : null,
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
              value={formData.organization_id ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  organization_id: e.target.value
                    ? parseInt(e.target.value)
                    : null,
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
              value={formData.event_tag_id ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  event_tag_id: e.target.value
                    ? parseInt(e.target.value)
                    : null,
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

        {/* Volunteer Event Option */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Department ID
                </label>
                <input
                  type="number"
                  value={formData.department_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      department_id: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Created By User ID
                </label>
                <input
                  type="number"
                  value={formData.created_by_user_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      created_by_user_id: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>

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
                    total_seats: parseInt(e.target.value) || 0,
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
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gray-300 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-400 disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}
