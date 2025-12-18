import React, { useState, useEffect } from 'react';
import { createEvent } from '@/features/Event_Hub/api/Event.api';
import { createMarker } from '@/features/Event_Hub/api/Map.api';
import { useNavigate } from '@/router';
import { useGetAuthMe } from '@/api/generated/authentication';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { data: authData, isLoading: isAuthLoading } = useGetAuthMe();
  const user = authData?.data;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    total_seats: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    organization_name: '',
    organization_email: '',
    organization_phone: '',
    address_line: '',
    province: '',
    district: '',
    subdistrict: '',
    postal_code: '',
    event_tag_name: '',
    lat: '',
    lng: '',
  });

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Validate Dates
      const start = new Date(`${formData.start_date}T${formData.start_time}`);
      const end = new Date(`${formData.end_date}T${formData.end_time}`);

      if (end <= start) {
        throw new Error('End time must be strictly after the start time.');
      }

      // 2. Extract User ID safely
      const hostUserId = user.userId;
      // 3. Prepare Payload
      const eventData = {
        host_user_id: hostUserId,
        title: formData.title,
        description: formData.description || undefined,
        image_url: formData.image_url || undefined,
        total_seats: formData.total_seats
          ? parseInt(formData.total_seats, 10)
          : undefined,
        start_date: formData.start_date,
        start_time: formData.start_time,
        end_date: formData.end_date,
        end_time: formData.end_time,
        organization: {
          name: formData.organization_name,
          email: formData.organization_email,
          phone_number: formData.organization_phone,
        },
        address: {
          address_line: formData.address_line || undefined,
          province: formData.province || undefined,
          district: formData.district || undefined,
          subdistrict: formData.subdistrict || undefined,
          postal_code: formData.postal_code || undefined,
        },
        event_tag_name: formData.event_tag_name || undefined,
      };

      // 4. Create Event
      await createEvent(eventData);

      // 5. Create Marker (Non-blocking: event is created even if marker fails)
      const latNum = parseFloat(formData.lat);
      const lngNum = parseFloat(formData.lng);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        try {
          await createMarker({
            marker_type_id: 3,
            description: `Location for: ${formData.title}`,
            location: { lat: latNum, lng: lngNum },
          });
        } catch (markerErr) {
          console.error('Marker creation failed', markerErr);
        }
      }

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Redirect after short delay
      setTimeout(() => navigate('/event_hub'), 2000);
    } catch (err: any) {
      setError(
        err.message || 'Failed to create event. Please check your inputs.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-pulse font-medium text-gray-500">
          Checking authentication...
        </div>
      </div>
    );
  }

  if (!user) return null;

  const inputClass =
    'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700';
  const sectionHeaderClass =
    'text-lg font-medium leading-6 text-gray-900 border-b pb-2 mb-4';

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <button
            onClick={() => navigate('/event_hub')}
            className="flex items-center text-gray-600 transition-colors hover:text-gray-900"
          >
            <span className="mr-2">←</span> Back to Hub
          </button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-xl">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Create New Event</h1>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 border-l-4 border-green-500 bg-green-50 p-4 font-medium text-green-700">
                Event created successfully! Redirecting...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <section>
                <h3 className={sectionHeaderClass}>Basic Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label className={labelClass}>Event Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Tag (Category)</label>
                    <input
                      type="text"
                      name="event_tag_name"
                      value={formData.event_tag_name}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. waste"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className={labelClass}>Total Seats (Optional)</label>
                    <input
                      type="number"
                      name="total_seats"
                      value={formData.total_seats}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <label className={labelClass}>Image URL</label>
                    <input
                      type="url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <label className={labelClass}>Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              {/* Schedule */}
              <section>
                <h3 className={sectionHeaderClass}>Schedule</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Starts *
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                    <input
                      type="time"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleChange}
                      required
                      className={`${inputClass} mt-2`}
                    />
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Ends *
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                    <input
                      type="time"
                      name="end_time"
                      value={formData.end_time}
                      onChange={handleChange}
                      required
                      className={`${inputClass} mt-2`}
                    />
                  </div>
                </div>
              </section>

              {/* Location */}
              <section>
                <h3 className={sectionHeaderClass}>Location Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label className={labelClass}>Address Line</label>
                    <input
                      type="text"
                      name="address_line"
                      value={formData.address_line}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Province</label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>District</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Subdistrict</label>
                    <input
                      type="text"
                      name="subdistrict"
                      value={formData.subdistrict}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Latitude</label>
                    <input
                      type="number"
                      step="any"
                      name="lat"
                      value={formData.lat}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="13.7563"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Longitude</label>
                    <input
                      type="number"
                      step="any"
                      name="lng"
                      value={formData.lng}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="100.5018"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Postal Code</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              {/* Organization */}
              <section>
                <h3 className={sectionHeaderClass}>
                  Organization Information *
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className={labelClass}>Name</label>
                    <input
                      type="text"
                      name="organization_name"
                      value={formData.organization_name}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      name="organization_email"
                      value={formData.organization_email}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      type="text"
                      name="organization_phone"
                      value={formData.organization_phone}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <div className="flex justify-end border-t border-gray-200 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-blue-600 px-8 py-2 font-medium text-white shadow-md transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
