import { useState } from 'react';
import { Upload } from 'lucide-react';
import { useCreateEvent } from '@/features/freecycle/hooks/useEvent';

interface PostEventFormProps {
  _onSuccess?: () => void;
}

export default function PostEventForm({ _onSuccess }: PostEventFormProps) {
  const [formData, setFormData] = useState({
    event_name: '',
    event_description: '',
    event_photo: '',
    start_date: '',
    end_date: '',
    province: '',
    district: '',
    subdistrict: '',
    more_location_detail: '',
    volunteer_required: false,
    volunteer_amount: 0,
    volunteer_speciality: '',
    volunteer_description: '',
    volunteer_register_deadline: '',
  });

  const [loading, setLoading] = useState(false);

  const { mutateAsync: createEvent, isPending } = useCreateEvent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      host_user_id: 1,
      title: formData.event_name,
      description: formData.event_description,
      total_seats: formData.volunteer_required ? formData.volunteer_amount : 0,
      start_at: formData.start_date,
      end_at: formData.end_date,
      organization_id: null,
      address_id: null,
      event_tag_id: null,
    };

    try {
      await createEvent(payload);
      alert('Event created successfully!');
      _onSuccess?.();
    } catch (err) {
      console.error(err);
      alert('Failed to create event');
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
        {/* Upload */}
        <div className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:bg-gray-100">
          <Upload className="mb-2 h-12 w-12 text-gray-400" />
          <p className="text-sm text-gray-600">upload photo</p>

          <input
            type="text"
            placeholder="Photo URL (Pexels link)"
            value={formData.event_photo}
            onChange={(e) =>
              setFormData({ ...formData, event_photo: e.target.value })
            }
            className="mt-4 w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        {/* Event name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Event name
          </label>
          <input
            type="text"
            required
            value={formData.event_name}
            onChange={(e) =>
              setFormData({ ...formData, event_name: e.target.value })
            }
            placeholder="Event name"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Start date
            </label>
            <input
              type="datetime-local"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              End date
            </label>
            <input
              type="datetime-local"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Province */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Province
          </label>
          <input
            type="text"
            value={formData.province}
            onChange={(e) =>
              setFormData({ ...formData, province: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        {/* District */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            District
          </label>
          <input
            type="text"
            value={formData.district}
            onChange={(e) =>
              setFormData({ ...formData, district: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        {/* Subdistrict */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Subdistrict
          </label>
          <input
            type="text"
            value={formData.subdistrict}
            onChange={(e) =>
              setFormData({ ...formData, subdistrict: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        {/* More location */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            More location details
          </label>
          <input
            type="text"
            value={formData.more_location_detail}
            onChange={(e) =>
              setFormData({ ...formData, more_location_detail: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        {/* Event Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Description
          </label>
          <textarea
            value={formData.event_description}
            onChange={(e) =>
              setFormData({ ...formData, event_description: e.target.value })
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
          disabled={loading}
          className="w-full rounded-lg bg-gray-300 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-400 disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}
