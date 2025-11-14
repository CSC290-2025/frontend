import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from '@/router';
import {
  ArrowLeft,
  Upload,
  X,
  MapPin,
  Calendar,
  Clock,
  Users,
  Plus,
  Image,
} from 'lucide-react';

// This is the shape of the data the API *expects*
interface ApiPayload {
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  registration_deadline?: string;
  total_seats: number;
  created_by_user_id: number;
  department_id: number;
  address_id: number;
  image_url?: string;
}

export default function CreateVolunteerPost() {
  const navigate = useNavigate(); // Hook for navigation
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    date: '',
    startTime: '',
    endTime: '',
    registration_deadline: '',
    maxVolunteers: '10',
    location: '',
    address: '',
    description: '',
    activities: [''],
    requirements: [''],
  });
  const [uploadedImage, setUploadedImage] = useState<
    string | ArrayBuffer | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    // START OF MODIFICATION
    if (field === 'maxVolunteers') {
      const numValue = parseInt(value, 10);

      // Allow empty string to clear the field, but enforce minimum 1 if a number is entered
      if (value === '' || (numValue > 0 && !isNaN(numValue))) {
        setFormData((prev) => ({ ...prev, [field]: value }));
      } else if (numValue <= 0 && value !== '') {
        // Optional: Set a specific error or default to 1
        setError('Max Volunteers must be a positive number (minimum 1).');
        // Prevent setting the state to an invalid number, keep the previous value or set to a valid one
        // setFormData((prev) => ({ ...prev, [field]: '1' }));
        return;
      }
    } else {
      // END OF MODIFICATION
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    // Clear the error if the user starts typing a valid value after an error
    if (error && field === 'maxVolunteers' && parseInt(value, 10) > 0) {
      setError(null);
    }
  };

  const handleArrayChange = (
    field: 'activities' | 'requirements',
    index: number,
    value: string
  ) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'activities' | 'requirements') => {
    setFormData((prev) => ({ ...prev, [field]: [...formData[field], ''] }));
  };

  const removeArrayItem = (
    field: 'activities' | 'requirements',
    index: number
  ) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file); // This gives a base64 string
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    const {
      title,
      description,
      date,
      startTime,
      endTime,
      registration_deadline,
      maxVolunteers,
      organization,
      location,
      address,
      activities,
      requirements,
    } = formData;

    // Enhanced validation: check for required fields AND maxVolunteers > 0
    const totalSeats = parseInt(maxVolunteers, 10);
    if (
      !title ||
      !date ||
      !startTime ||
      !endTime ||
      !maxVolunteers ||
      totalSeats <= 0
    ) {
      setError(
        'Title, Date, Start Time, End Time, and Max Volunteers (must be > 0) are required.'
      );
      setIsLoading(false);
      return;
    }

    // API expects full ISO strings for dates
    const start_at = `${date}T${startTime}:00`;
    const end_at = `${date}T${endTime}:00`;
    // Assumes deadline is end of day for the selected date. Adjust if API expects time.
    const registration_deadline_at = registration_deadline
      ? `${registration_deadline}T23:59:59`
      : undefined;

    // Combine form data into a single description field
    const fullDescription = `
**Purpose:**
${description}

---
**Organization:** ${organization || 'N/A'}
**Location:** ${location || 'N/A'}
**Address:** ${address || 'N/A'}

**Activities:**
${activities
  .filter((a) => a)
  .map((act) => `- ${act}`)
  .join('\n')}

**Requirements:**
${requirements
  .filter((r) => r)
  .map((req) => `- ${req}`)
  .join('\n')}
    `;

    const payload: ApiPayload = {
      title: title,
      description: fullDescription.trim(),
      start_at: start_at,
      end_at: end_at,
      registration_deadline: registration_deadline_at,
      // Use the validated totalSeats
      total_seats: totalSeats,
      image_url: typeof uploadedImage === 'string' ? uploadedImage : undefined, // Send base64 string or undefined

      // testing with static IDs - replace with actual dynamic values (e.g., from auth context)
      created_by_user_id: 1,
      department_id: 1,
      address_id: 1,
    };

    try {
      const response = await axios.post(
        'http://localhost:3000/api/v1/volunteer/create',
        payload
      );

      if (response.data.success) {
        alert('Event created successfully!');
        navigate('/volunteer/board'); // Redirect on success
      } else {
        // Use a more specific error message from the API if available
        throw new Error(response.data.message || 'API returned an error');
      }
    } catch (err: any) {
      console.error('Error creating event:', err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          err.message ||
          'An unknown error occurred.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden font-medium sm:inline">Back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800 sm:text-xl">
            Create Opportunity
          </h1>
          <div className="w-10 sm:w-20"></div> {/* Space placeholder */}
        </div>
      </div>

      {/* Main Content */}
      {/* Reduced padding on mobile: px-4 */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <div className="space-y-6">
          {/* Image Upload Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-800">
              Cover Image
            </h2>
            <div className="relative">
              {uploadedImage ? (
                <div className="relative">
                  <img
                    src={
                      typeof uploadedImage === 'string'
                        ? uploadedImage
                        : undefined
                    }
                    alt="Uploaded"
                    className="h-48 w-full rounded-xl object-cover sm:h-64"
                  />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-4 right-4 rounded-full bg-white p-2 shadow-lg hover:bg-gray-100"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              ) : (
                <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 transition-colors hover:border-blue-400 hover:bg-blue-50 sm:h-64">
                  <Image className="mb-3 h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
                  <span className="px-4 text-center font-medium text-gray-600">
                    Click to upload cover image
                  </span>
                  <span className="mt-1 text-sm text-gray-400">
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

          {/* Basic Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-800">
              Basic Information
            </h2>
            <div className="space-y-4">
              {/* Title, Organization, Category fields remain full width (good for mobile) */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Opportunity Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Teaching Volunteer Program"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) =>
                    handleInputChange('organization', e.target.value)
                  }
                  placeholder="e.g., Community Education Center"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
            {/* key responsive change: grid-cols-1 on mobile, md:grid-cols-2 on medium screens */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <Calendar className="mr-1 inline h-4 w-4" />
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <Calendar className="mr-1 inline h-4 w-4" />
                  Registration Deadline *
                </label>
                <input
                  type="date"
                  value={formData.registration_deadline}
                  onChange={(e) =>
                    handleInputChange('registration_deadline', e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <Users className="mr-1 inline h-4 w-4" />
                  Max Volunteers *
                </label>
                <input
                  type="number"
                  value={formData.maxVolunteers}
                  onChange={(e) =>
                    handleInputChange('maxVolunteers', e.target.value)
                  }
                  placeholder="55"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  // Added min attribute for better UI experience
                  min="1"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <Clock className="mr-1 inline h-4 w-4" />
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    handleInputChange('startTime', e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                {' '}
                {/* Added for cleaner alignment */}
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <Clock className="mr-1 inline h-4 w-4" />
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-800">
              <MapPin className="mr-2 inline h-5 w-5" />
              Location
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Venue Name *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange('location', e.target.value)
                  }
                  placeholder="e.g., Community Education Center"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Learning Street, Central District, Bangkok, Thailand 10100"
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-800">
              Description
            </h2>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the volunteer opportunity, its purpose, and what volunteers can expect..."
              rows={6}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Activities */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <h2 className="text-lg font-bold text-gray-800">Activities</h2>
              <button
                type="button"
                onClick={() => addArrayItem('activities')}
                className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 font-medium text-blue-600 hover:bg-blue-200"
              >
                <Plus className="h-4 w-4" />
                Add Activity
              </button>
            </div>
            <div className="space-y-3">
              {formData.activities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-lime-400 font-semibold text-gray-800">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={activity}
                    onChange={(e) =>
                      handleArrayChange('activities', index, e.target.value)
                    }
                    placeholder="e.g., Assist with classroom activities"
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                  {formData.activities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('activities', index)}
                      className="flex-shrink-0 rounded-xl p-3 text-red-500 hover:bg-red-50"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Requirements (Similar changes to Activities) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <h2 className="text-lg font-bold text-gray-800">Requirements</h2>
              <button
                type="button"
                onClick={() => addArrayItem('requirements')}
                className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 font-medium text-blue-600 hover:bg-blue-200"
              >
                <Plus className="h-4 w-4" />
                Add Requirement
              </button>
            </div>
            <div className="space-y-3">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-4 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) =>
                      handleArrayChange('requirements', index, e.target.value)
                    }
                    placeholder="e.g., Age 18 or above"
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('requirements', index)}
                      className="flex-shrink-0 rounded-xl p-3 text-red-500 hover:bg-red-50"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-300 bg-red-100 p-3 text-red-800">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Action Buttons (Responsive: Stacks on mobile, aligned right on desktop) */}
          <div className="flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row sm:gap-4">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full rounded-full bg-lime-400 px-8 py-3 font-medium text-gray-800 hover:bg-lime-500 disabled:opacity-50 sm:w-auto"
            >
              {isLoading ? 'Publishing...' : 'Publish Opportunity'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
