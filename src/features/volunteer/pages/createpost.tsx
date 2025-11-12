import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from '@/router'; // Import from Generouted
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
    category: '',
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
    difficulty: 'beginner',
  });
  const [uploadedImage, setUploadedImage] = useState<
    string | ArrayBuffer | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      difficulty,
    } = formData;

    const start_at = `${date}T${startTime}`;
    const end_at = `${date}T${endTime}`;
    const registration_deadline_at = `${registration_deadline}T00:00:00.000Z`;

    const fullDescription = `
${description}

---
**Organization:** ${organization}
**Location:** ${location}
**Address:** ${address}
**Difficulty:** ${difficulty}

**Activities:**
${activities.map((act) => `- ${act}`).join('\n')}

**Requirements:**
${requirements.map((req) => `- ${req}`).join('\n')}
    `;

    const payload: ApiPayload = {
      title: title,
      description: fullDescription,
      start_at: start_at,
      end_at: end_at,
      registration_deadline: registration_deadline_at,
      total_seats: parseInt(maxVolunteers, 10),
      image_url: typeof uploadedImage === 'string' ? uploadedImage : '', // Send base64 string

      // testing with static IDs
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
        throw new Error('API returned an error');
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

  // --- JSX (NO CHANGES NEEDED) ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            Create Volunteer Opportunity
          </h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-8 py-8">
        <div className="space-y-6">
          {/* Image Upload Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
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
                    className="h-64 w-full rounded-xl object-cover"
                  />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-4 right-4 rounded-full bg-white p-2 shadow-lg hover:bg-gray-100"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              ) : (
                <label className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 transition-colors hover:border-blue-400 hover:bg-blue-50">
                  <Image className="mb-3 h-12 w-12 text-gray-400" />
                  <span className="font-medium text-gray-600">
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
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-800">
              Basic Information
            </h2>
            <div className="space-y-4">
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

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange('category', e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">Select a category</option>
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="environment">Environment</option>
                  <option value="community">Community Service</option>
                  <option value="elderly">Elderly Care</option>
                  <option value="animals">Animal Welfare</option>
                </select>
              </div>
            </div>
          </div>

          {/* Schedule & Capacity */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-800">
              Schedule & Capacity
            </h2>
            <div className="grid grid-cols-2 gap-4">
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

              <div>
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

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Difficulty Level
              </label>
              <div className="flex gap-3">
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <button
                    key={level}
                    type="button" // Add type="button" to prevent form submission
                    onClick={() => handleInputChange('difficulty', level)}
                    className={`rounded-full px-6 py-2 font-medium transition-colors ${
                      formData.difficulty === level
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
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
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
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
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Activities</h2>
              <button
                type="button" // Add type="button"
                onClick={() => addArrayItem('activities')}
                className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 font-medium text-blue-600 hover:bg-blue-200"
              >
                <Plus className="h-4 w-4" />
                Add Activity
              </button>
            </div>
            <div className="space-y-3">
              {formData.activities.map((activity, index) => (
                <div key={index} className="flex gap-3">
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
                      type="button" // Add type="button"
                      onClick={() => removeArrayItem('activities', index)}
                      className="rounded-xl p-3 text-red-500 hover:bg-red-50"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Requirements</h2>
              <button
                type="button" // Add type="button"
                onClick={() => addArrayItem('requirements')}
                className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 font-medium text-blue-600 hover:bg-blue-200"
              >
                <Plus className="h-4 w-4" />
                Add Requirement
              </button>
            </div>
            <div className="space-y-3">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-3">
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
                      type="button" // Add type="button"
                      onClick={() => removeArrayItem('requirements', index)}
                      className="rounded-xl p-3 text-red-500 hover:bg-red-50"
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button" // Add type="button"
              onClick={() => alert('Saved as draft')}
              className="rounded-full border border-gray-300 px-8 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Save as Draft
            </button>
            <button
              type="submit" // This is the main submit button
              onClick={handleSubmit}
              disabled={isLoading}
              className="rounded-full bg-lime-400 px-8 py-3 font-medium text-gray-800 hover:bg-lime-500 disabled:opacity-50"
            >
              {isLoading ? 'Publishing...' : 'Publish Opportunity'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
