import React, { useState } from 'react';
import { createEvent } from '@/features/Event_Hub/api/Event.api';
import { useNavigate } from '@/router';

type FormData = {
  title: string;
  description: string;
  total_seats: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  organization_name: string;
  organization_email: string;
  organization_phone: string;
  address_line: string;
  province: string;
  district: string;
  subdistrict: string;
  postal_code: string;
  event_tag_name: string;
};

type ValidationErrors = Partial<Record<keyof FormData, string>>;

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
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

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const inputClass =
    'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700';
  const sectionHeaderClass =
    'text-lg font-medium leading-6 text-gray-900 border-b pb-2 mb-4';

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // clear per-field error when user types
    if (validationErrors[name as keyof FormData]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[name as keyof FormData];
        return copy;
      });
    }
  };

  const validate = () => {
    const errors: ValidationErrors = {};

    // Basic required
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.start_date) errors.start_date = 'Start date is required';
    if (!formData.start_time) errors.start_time = 'Start time is required';
    if (!formData.end_date) errors.end_date = 'End date is required';
    if (!formData.end_time) errors.end_time = 'End time is required';

    // Organization required
    if (!formData.organization_name.trim()) {
      errors.organization_name = 'Organization name is required';
    }
    if (!formData.organization_email.trim()) {
      errors.organization_email = 'Organization email is required';
    }
    if (!formData.organization_phone.trim()) {
      errors.organization_phone = 'Organization phone is required';
    }

    // Address required
    if (!formData.address_line.trim()) {
      errors.address_line = 'Address line is required';
    }
    if (!formData.subdistrict.trim()) {
      errors.subdistrict = 'Subdistrict is required';
    }
    if (!formData.district.trim()) {
      errors.district = 'District is required';
    }
    if (!formData.province.trim()) {
      errors.province = 'Province is required';
    }
    if (!formData.postal_code.trim()) {
      errors.postal_code = 'Postal code is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const isValid = validate();
    if (!isValid) {
      setError('Please fill all required fields.');
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);

    try {
      const eventData: any = {
        host_user_id: 1, // TODO: replace with real user id from auth
        title: formData.title,
        description: formData.description || undefined,
        total_seats: formData.total_seats
          ? parseInt(formData.total_seats, 10)
          : undefined,
        start_date: formData.start_date,
        start_time: formData.start_time,
        end_date: formData.end_date,
        end_time: formData.end_time,
      };

      // Organization (required by UI so we always send)
      eventData.organization = {
        name: formData.organization_name,
        email: formData.organization_email,
        phone_number: formData.organization_phone,
      };

      // Address (required by UI so we always send)
      eventData.address = {
        address_line: formData.address_line,
        province: formData.province,
        district: formData.district,
        subdistrict: formData.subdistrict,
        postal_code: formData.postal_code,
      };

      if (formData.event_tag_name) {
        eventData.event_tag_name = formData.event_tag_name;
      }

      await createEvent(eventData);
      setSuccess(true);
      window.scrollTo(0, 0);

      setFormData({
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
    } catch (err: any) {
      setError(err?.message || 'Failed to create event');
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Back button */}
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
          {/* Header Banner */}
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Create New Event</h1>
            <p className="mt-1 text-sm text-blue-100">
              Fill in the details below to host your next event.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Error / Success */}
            {error && (
              <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
                <p className="font-medium">Error</p>
                <p className="text-sm whitespace-pre-line">{error}</p>
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
                    <label className={labelClass}>
                      Event Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`${inputClass} ${
                        validationErrors.title ? 'border-red-500' : ''
                      }`}
                      placeholder="e.g. Annual Tech Meetup"
                    />
                    {validationErrors.title && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.title}
                      </p>
                    )}
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
                      min={0}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Schedule */}
              <div>
                <h3 className={sectionHeaderClass}>Schedule</h3>
                <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  {/* Start */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <label className="mb-3 block text-xs font-bold text-gray-500 uppercase">
                      Starts
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className={labelClass}>
                          Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="start_date"
                          value={formData.start_date}
                          onChange={handleChange}
                          className={`${inputClass} ${
                            validationErrors.start_date ? 'border-red-500' : ''
                          }`}
                        />
                        {validationErrors.start_date && (
                          <p className="mt-1 text-sm text-red-500">
                            {validationErrors.start_date}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>
                          Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          name="start_time"
                          value={formData.start_time}
                          onChange={handleChange}
                          className={`${inputClass} ${
                            validationErrors.start_time ? 'border-red-500' : ''
                          }`}
                        />
                        {validationErrors.start_time && (
                          <p className="mt-1 text-sm text-red-500">
                            {validationErrors.start_time}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* End */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <label className="mb-3 block text-xs font-bold text-gray-500 uppercase">
                      Ends
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className={labelClass}>
                          Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleChange}
                          className={`${inputClass} ${
                            validationErrors.end_date ? 'border-red-500' : ''
                          }`}
                        />
                        {validationErrors.end_date && (
                          <p className="mt-1 text-sm text-red-500">
                            {validationErrors.end_date}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>
                          Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          name="end_time"
                          value={formData.end_time}
                          onChange={handleChange}
                          className={`${inputClass} ${
                            validationErrors.end_time ? 'border-red-500' : ''
                          }`}
                        />
                        {validationErrors.end_time && (
                          <p className="mt-1 text-sm text-red-500">
                            {validationErrors.end_time}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Location (NOW required by UI) */}
              <div>
                <h3 className={sectionHeaderClass}>Location</h3>
                <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label className={labelClass}>
                      Address Line <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address_line"
                      value={formData.address_line}
                      onChange={handleChange}
                      className={`${inputClass} ${
                        validationErrors.address_line ? 'border-red-500' : ''
                      }`}
                      placeholder="Street address, floor, etc."
                    />
                    {validationErrors.address_line && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.address_line}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label className={labelClass}>
                      Subdistrict <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subdistrict"
                      value={formData.subdistrict}
                      onChange={handleChange}
                      className={`${inputClass} ${
                        validationErrors.subdistrict ? 'border-red-500' : ''
                      }`}
                    />
                    {validationErrors.subdistrict && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.subdistrict}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label className={labelClass}>
                      District <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className={`${inputClass} ${
                        validationErrors.district ? 'border-red-500' : ''
                      }`}
                    />
                    {validationErrors.district && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.district}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label className={labelClass}>
                      Province <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className={`${inputClass} ${
                        validationErrors.province ? 'border-red-500' : ''
                      }`}
                    />
                    {validationErrors.province && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.province}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label className={labelClass}>
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className={`${inputClass} ${
                        validationErrors.postal_code ? 'border-red-500' : ''
                      }`}
                    />
                    {validationErrors.postal_code && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.postal_code}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Organization Info (NOW required by UI) */}
              <div>
                <h3 className={sectionHeaderClass}>Organization Info</h3>
                <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <label className={labelClass}>
                      Org Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="organization_name"
                      value={formData.organization_name}
                      onChange={handleChange}
                      className={`${inputClass} ${
                        validationErrors.organization_name
                          ? 'border-red-500'
                          : ''
                      }`}
                      placeholder="Company/Club"
                    />
                    {validationErrors.organization_name && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.organization_name}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-1">
                    <label className={labelClass}>
                      Org Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="organization_email"
                      value={formData.organization_email}
                      onChange={handleChange}
                      className={`${inputClass} ${
                        validationErrors.organization_email
                          ? 'border-red-500'
                          : ''
                      }`}
                      placeholder="contact@org.com"
                    />
                    {validationErrors.organization_email && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.organization_email}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-1">
                    <label className={labelClass}>
                      Org Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="organization_phone"
                      value={formData.organization_phone}
                      onChange={handleChange}
                      className={`${inputClass} ${
                        validationErrors.organization_phone
                          ? 'border-red-500'
                          : ''
                      }`}
                      placeholder="+66..."
                    />
                    {validationErrors.organization_phone && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.organization_phone}
                      </p>
                    )}
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
                  className={`rounded-md border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
                    isSubmitting ? 'cursor-not-allowed opacity-70' : ''
                  }`}
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
