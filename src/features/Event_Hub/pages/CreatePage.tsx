import React, { useState } from 'react';
import { createEvent } from '@/features/Event_Hub/api/Event.api';
import { useNavigate } from '@/router';

const CreateEventPage = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
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
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare Payload
      const eventData: any = {
        host_user_id: 1, // Note: You might want to get this from Auth Context later
        title: formData.title,
        description: formData.description || undefined,
        total_seats: formData.total_seats
          ? parseInt(formData.total_seats)
          : undefined,
        start_date: formData.start_date,
        start_time: formData.start_time,
        end_date: formData.end_date,
        end_time: formData.end_time,
      };

      if (
        formData.organization_name ||
        formData.organization_email ||
        formData.organization_phone
      ) {
        eventData.organization = {
          name: formData.organization_name || undefined,
          email: formData.organization_email || undefined,
          phone_number: formData.organization_phone || undefined,
        };
      }

      if (
        formData.address_line ||
        formData.province ||
        formData.district ||
        formData.subdistrict ||
        formData.postal_code
      ) {
        eventData.address = {
          address_line: formData.address_line || undefined,
          province: formData.province || undefined,
          district: formData.district || undefined,
          subdistrict: formData.subdistrict || undefined,
          postal_code: formData.postal_code || undefined,
        };
      }

      if (formData.event_tag_name) {
        eventData.event_tag_name = formData.event_tag_name;
      }

      await createEvent(eventData);
      setSuccess(true);
      window.scrollTo(0, 0); // Scroll top to see message
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI Helpers ---
  const inputClass =
    'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700';
  const sectionHeaderClass =
    'text-lg font-medium leading-6 text-gray-900 border-b pb-2 mb-4';

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header / Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/event_hub')}
            className="flex items-center text-gray-600 transition-colors hover:text-gray-900"
          >
            <span className="mr-2 text-xl">←</span> Back to Hub
          </button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-xl">
          {/* Form Title Banner */}
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Create New Event</h1>
            <p className="mt-1 text-sm text-blue-100">
              Fill in the details below to host your next event.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Feedback Messages */}
            {error && (
              <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 border-l-4 border-green-500 bg-green-50 p-4 text-green-700">
                <p className="font-medium">Success!</p>
                <p className="text-sm">
                  Event created successfully.{' '}
                  <span
                    className="cursor-pointer underline"
                    onClick={() => navigate('/event_hub')}
                  >
                    Return to hub?
                  </span>
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 1. Basic Information */}
              <div>
                <h3 className={sectionHeaderClass}>Basic Information</h3>
                <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label className={labelClass}>Event Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="e.g. Annual Tech Meetup"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Tag</label>
                    <input
                      type="text"
                      name="event_tag_name"
                      value={formData.event_tag_name}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. Technology"
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
                      placeholder="What is this event about?"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Total Seats</label>
                    <input
                      type="number"
                      name="total_seats"
                      value={formData.total_seats}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Date & Time */}
              <div>
                <h3 className={sectionHeaderClass}>Schedule</h3>
                <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <label className="mb-3 block text-xs font-bold text-gray-500 uppercase">
                      Starts
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className={labelClass}>Date *</label>
                        <input
                          type="date"
                          name="start_date"
                          value={formData.start_date}
                          onChange={handleChange}
                          required
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Time *</label>
                        <input
                          type="time"
                          name="start_time"
                          value={formData.start_time}
                          onChange={handleChange}
                          required
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <label className="mb-3 block text-xs font-bold text-gray-500 uppercase">
                      Ends
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className={labelClass}>Date *</label>
                        <input
                          type="date"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleChange}
                          required
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Time *</label>
                        <input
                          type="time"
                          name="end_time"
                          value={formData.end_time}
                          onChange={handleChange}
                          required
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Location */}
              <div>
                <h3 className={sectionHeaderClass}>
                  Location{' '}
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    (Optional)
                  </span>
                </h3>
                <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label className={labelClass}>Address Line</label>
                    <input
                      type="text"
                      name="address_line"
                      value={formData.address_line}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Street address, floor, etc."
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className={labelClass}>Subdistrict</label>
                    <input
                      type="text"
                      name="subdistrict"
                      value={formData.subdistrict}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className={labelClass}>District</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className={labelClass}>Province</label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-3">
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
              </div>

              {/* 4. Organization */}
              <div>
                <h3 className={sectionHeaderClass}>
                  Organization Info{' '}
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    (Optional)
                  </span>
                </h3>
                <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <label className={labelClass}>Org Name</label>
                    <input
                      type="text"
                      name="organization_name"
                      value={formData.organization_name}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Company/Club"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className={labelClass}>Org Email</label>
                    <input
                      type="email"
                      name="organization_email"
                      value={formData.organization_email}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="contact@org.com"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className={labelClass}>Org Phone</label>
                    <input
                      type="text"
                      name="organization_phone"
                      value={formData.organization_phone}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="+66..."
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/event_hub')}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`rounded-md border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${isSubmitting ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create Event'
                  )}
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
