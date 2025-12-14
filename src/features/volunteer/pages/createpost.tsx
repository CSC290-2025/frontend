import React, { useState } from 'react';
import { useNavigate } from '@/router';
import { apiClient } from '@/lib/apiClient';
import {
  ArrowLeft,
  X,
  MapPin,
  Calendar,
  Clock,
  Users,
  Plus,
  Image as ImageIcon,
  CheckCircle,
  LayoutTemplate,
  Building2,
  FileText,
} from 'lucide-react';
import { useGetAuthMe } from '@/api/generated/authentication';

// --- Interfaces ---
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
  tag?: string;
  image_url?: string;
}

export default function CreateVolunteerPost() {
  const navigate = useNavigate();
  const userId = useGetAuthMe().data?.data?.userId.toString() ?? '';

  // State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postTag = [
    'Environment',
    'Freecycle',
    'Weather',
    'Education',
    'Funding',
    'Disability/Elderly Support',
    'Community & Social',
  ];

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [uploadedImage, setUploadedImage] = useState<
    string | ArrayBuffer | null
  >(null);

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
    tag: '',
  });

  // --- Handlers ---

  const toggleCategory = (category: string) => {
    setSelectedCategory((prev) => (prev === category ? undefined : category));
    handleInputChange('tag', category);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'maxVolunteers') {
      const numValue = parseInt(value, 10);
      if (value === '' || (numValue > 0 && !isNaN(numValue))) {
        setFormData((prev) => ({ ...prev, [field]: value }));
      } else if (numValue <= 0 && value !== '') {
        setError('Max Volunteers must be a positive number (minimum 1).');
        return;
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

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
      reader.onloadend = () => setUploadedImage(reader.result);
      reader.readAsDataURL(file);
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

    const totalSeats = parseInt(maxVolunteers, 10);
    if (
      !title ||
      !date ||
      !startTime ||
      !endTime ||
      !maxVolunteers ||
      totalSeats <= 0
    ) {
      setError('Please fill in all required fields marked with *');
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const start_at = `${date}T${startTime}:00`;
    const end_at = `${date}T${endTime}:00`;
    const registration_deadline_at = registration_deadline
      ? `${registration_deadline}T23:59:59`
      : undefined;

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
      total_seats: totalSeats,
      image_url: typeof uploadedImage === 'string' ? uploadedImage : undefined,
      created_by_user_id: Number(userId),
      department_id: 1,
      address_id: 1,
      tag: selectedCategory,
    };

    try {
      const response = await apiClient.post(
        '/api/v1/volunteer/create',
        payload
      );

      if (response.data.success) {
        // Success! Show the modal instead of alerting
        setShowSuccessModal(true);
      } else {
        throw new Error(response.data.message || 'API returned an error');
      }
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'An unknown error occurred.'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Helpers ---

  const renderSectionHeader = (icon: React.ReactNode, title: string) => (
    <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-800">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </span>
      {title}
    </h2>
  );

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
          <h1 className="text-lg font-bold text-gray-900">
            Create Opportunity
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="animate-in fade-in slide-in-from-top-2 mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <div className="flex items-center gap-2 font-semibold">
              <X className="h-4 w-4" />
              Submission Error
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
                      onClick={() => setUploadedImage(null)}
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

          {/* Basic Info */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            {renderSectionHeader(
              <LayoutTemplate className="h-5 w-5" />,
              'Basic Information'
            )}
            <div className="grid gap-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Opportunity Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g. Teaching English for Kids"
                  className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Organization Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) =>
                      handleInputChange('organization', e.target.value)
                    }
                    placeholder="e.g. Red Cross"
                    className="w-full rounded-xl border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                  />
                </div>
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
                  Event Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Registration Deadline *
                </label>
                <input
                  type="date"
                  value={formData.registration_deadline}
                  onChange={(e) =>
                    handleInputChange('registration_deadline', e.target.value)
                  }
                  className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Start Time *
                </label>
                <div className="relative">
                  <Clock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      handleInputChange('startTime', e.target.value)
                    }
                    className="w-full rounded-xl border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-gray-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  End Time *
                </label>
                <div className="relative">
                  <Clock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      handleInputChange('endTime', e.target.value)
                    }
                    className="w-full rounded-xl border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-gray-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Max Volunteers *
                </label>
                <div className="relative">
                  <Users className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    value={formData.maxVolunteers}
                    onChange={(e) =>
                      handleInputChange('maxVolunteers', e.target.value)
                    }
                    className="w-full rounded-xl border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-gray-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            {renderSectionHeader(
              <MapPin className="h-5 w-5" />,
              'Location Details'
            )}
            <div className="space-y-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Venue Name *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange('location', e.target.value)
                  }
                  placeholder="e.g. Central Library Hall"
                  className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Full Address *
                </label>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter full address including postal code"
                  className="w-full resize-none rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </section>

          {/* Details & Tags */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            {renderSectionHeader(<FileText className="h-5 w-5" />, 'Details')}
            <div className="space-y-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="Describe the mission and what volunteers will do..."
                  className="w-full resize-none rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Dynamic Lists (Activities & Requirements) */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Activities */}
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-700">
                      Activities
                    </label>
                    <button
                      type="button"
                      onClick={() => addArrayItem('activities')}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.activities.map((act, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          value={act}
                          onChange={(e) =>
                            handleArrayChange('activities', idx, e.target.value)
                          }
                          className="flex-1 rounded-lg border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder={`Activity ${idx + 1}`}
                        />
                        {formData.activities.length > 1 && (
                          <button
                            onClick={() => removeArrayItem('activities', idx)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-700">
                      Requirements
                    </label>
                    <button
                      type="button"
                      onClick={() => addArrayItem('requirements')}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.requirements.map((req, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          value={req}
                          onChange={(e) =>
                            handleArrayChange(
                              'requirements',
                              idx,
                              e.target.value
                            )
                          }
                          className="flex-1 rounded-lg border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder={`Requirement ${idx + 1}`}
                        />
                        {formData.requirements.length > 1 && (
                          <button
                            onClick={() => removeArrayItem('requirements', idx)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Category Tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {postTag.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleCategory(tag)}
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
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full rounded-xl bg-lime-400 px-8 py-4 text-base font-bold text-gray-900 shadow-lg shadow-lime-200/50 transition-all hover:-translate-y-1 hover:bg-lime-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 md:w-auto"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-800 border-t-transparent"></div>
                  Publishing...
                </span>
              ) : (
                'Publish Opportunity'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- Success Modal --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />

          {/* Modal Content */}
          <div className="animate-in zoom-in-95 relative w-full max-w-sm scale-100 transform overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl transition-all duration-200">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <h3 className="mb-2 text-2xl font-bold text-gray-900">
              Published Successfully!
            </h3>
            <p className="mb-8 text-gray-500">
              Your volunteer opportunity is now live and visible to the
              community.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/volunteer/board')}
                className="w-full rounded-xl bg-gray-900 py-3.5 font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95"
              >
                Go to Board
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full rounded-xl border border-gray-200 bg-white py-3.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
