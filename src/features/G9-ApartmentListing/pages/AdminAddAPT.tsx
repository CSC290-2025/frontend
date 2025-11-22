import React, { useState } from 'react';
import '@/features/G9-ApartmentListing/styles/animations.css';
import { Upload, X } from 'lucide-react';
import BackIcon from '@/features/G9-ApartmentListing/assets/BackIcon.svg';
import TrashIcon from '@/features/G9-ApartmentListing/assets/TrashIcon.svg';
import UppageIcon from '@/features/G9-ApartmentListing/assets/UppageIcon.svg';
import AddedSuccess from '@/features/G9-ApartmentListing/components/AddedSuccess';
import type {
  apartmentTypes,
  roomTypes,
} from '@/features/G9-ApartmentListing/types/index';
import {
  APT,
  Room,
  Upload as UploadHooks,
} from '@/features/G9-ApartmentListing/hooks/index';

interface LocationData {
  [key: string]: {
    districts: string[];
    subdistricts: {
      [key: string]: string[];
    };
  };
}

export default function AddApartment(): React.ReactElement {
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks for API calls
  const createApartmentMutation = APT.useCreateApartment();
  const uploadMultipleFilesMutation = UploadHooks.useUploadMultipleFiles();
  const createRoomMutation = Room.useCreateRoom();

  const locationData: LocationData = {
    chomthong: {
      districts: ['Chom Thong'],
      subdistricts: {
        'Chom Thong': ['Bang Kho', 'Bang Khun Thian', 'Bangmod', 'Chom Thong'],
      },
    },
    thonburi: {
      districts: ['Thonburi'],
      subdistricts: {
        Thonburi: [
          'Wat Kanlaya',
          'Hiran Ruchi',
          'Bang Yi Ruea',
          'Talat Phlu',
          'Bukkhalo',
          'Samre',
          'Dao Khanong',
        ],
      },
    },
    thungkhru: {
      districts: ['Thung Khru'],
      subdistricts: {
        'Thung Khru': ['Thung Khru', 'Bangmod'],
      },
    },
    ratburana: {
      districts: ['Rat Burana'],
      subdistricts: {
        'Rat Burana': ['Rat Burana', 'Bang Pakok'],
      },
    },
  };

  // Create a custom form data interface since the actual Apartment type doesn't have all the form fields
  interface RoomFormData {
    name: string;
    type: string;
    size: string;
    price_start: number;
    price_end: number;
    room_status: roomTypes.RoomStatus;
  }

  interface FormData {
    name: string;
    phone: string;
    description: string;
    apartment_type: apartmentTypes.ApartmentType;
    apartment_location: apartmentTypes.ApartmentLocation;
    address_line: string;
    province: string;
    district: string;
    subdistrict: string;
    postal_code: string;
    electric_price: number;
    water_price: number;
    internet_price: number;
    internetFree: boolean;
    roomTypes: RoomFormData[];
    confirmed: boolean;
  }
  // Separate state for images that will be uploaded
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    description: '',
    apartment_type: 'apartment',
    apartment_location: 'thonburi',
    address_line: '',
    province: '',
    district: '',
    subdistrict: '',
    postal_code: '',
    electric_price: 0,
    water_price: 0,
    internet_price: 0,
    internetFree: false,
    roomTypes: [],
    confirmed: false,
  });

  const handleInputChange = (
    field: keyof FormData,
    value: FormData[keyof FormData]
  ): void => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value } as FormData;

      if (field === 'apartment_location') {
        updated.district = '';
        updated.subdistrict = '';
      }

      if (field === 'district') {
        updated.subdistrict = '';
      }

      return updated;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files) return;

    const currentImageCount = selectedImages.length;
    const remainingSlots = 5 - currentImageCount;

    if (remainingSlots <= 0) {
      setErrorMessage('Maximum 5 images allowed');
      setShowErrorPopup(true);
      return;
    }

    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    const filesToAdd = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToAdd; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newFiles.push(file);
        newPreviews.push(preview);
      }
    }

    setSelectedImages((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number): void => {
    // Clean up the blob URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);

    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRoomFieldChange = (
    index: number,
    field: keyof RoomFormData,
    value: string | number
  ): void => {
    const newRoomTypes = [...formData.roomTypes];
    newRoomTypes[index] = { ...newRoomTypes[index], [field]: value };
    setFormData((prev) => ({ ...prev, roomTypes: newRoomTypes }));
  };

  const addRoomType = (): void => {
    setFormData((prev) => ({
      ...prev,
      roomTypes: [
        ...prev.roomTypes,
        {
          name: '',
          type: '',
          size: '',
          price_start: 0,
          price_end: 0,
          room_status: 'available',
        },
      ],
    }));
  };

  const removeRoomType = (index: number): void => {
    if (index === 0) return;

    setFormData((prev) => ({
      ...prev,
      roomTypes: prev.roomTypes.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const requiredStringFields = [
      formData.name,
      formData.phone,
      formData.description,
      formData.apartment_type,
      formData.apartment_location,
      formData.address_line,
      formData.province,
      formData.district,
      formData.subdistrict,
      formData.postal_code,
      formData.electric_price.toString(),
      formData.internetFree ? 'free' : formData.internet_price.toString(),
    ];

    const hasWaterPrice = !!formData.water_price;

    const roomTypesValid =
      formData.roomTypes.length > 0 &&
      formData.roomTypes.every(
        (room) =>
          room.name.trim() !== '' &&
          room.type.trim() !== '' &&
          room.size.trim() !== '' &&
          room.price_start >= 0 &&
          room.price_end >= 0 &&
          room.price_start <= room.price_end &&
          room.name.length >= 2 &&
          room.name.length <= 255 &&
          room.type.length >= 2 &&
          room.type.length <= 255 &&
          room.size.length >= 1 &&
          ['available', 'occupied', 'pending'].includes(room.room_status)
      );

    return (
      requiredStringFields.every(
        (field) => typeof field === 'string' && field.trim() !== ''
      ) &&
      hasWaterPrice &&
      roomTypesValid &&
      formData.confirmed
    );
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      setErrorMessage('Please fill in all fields');
      setShowErrorPopup(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare apartment data with validation and cleaning
      const apartmentData: apartmentTypes.CreateApartmentPayload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        description: formData.description.trim() || null,
        apartment_type: formData.apartment_type,
        apartment_location: formData.apartment_location,
        electric_price: Number(formData.electric_price),
        water_price: Number(formData.water_price),
        internet: formData.internetFree ? 'free' : 'not_free',
        internet_price: formData.internetFree
          ? null
          : Number(formData.internet_price),
        userId: 3, // TODO: Get from user context/auth
        address: {
          address_line: formData.address_line.trim(),
          province: formData.province.trim(),
          district: formData.district.trim(),
          subdistrict: formData.subdistrict.trim(),
          postal_code: formData.postal_code.trim(),
        },
      };

      // Validate required fields
      if (!apartmentData.name || apartmentData.name.length < 2) {
        throw new Error('Apartment name must be at least 2 characters');
      }
      if (!apartmentData.phone || apartmentData.phone.length < 10) {
        throw new Error('Phone number must be at least 10 characters');
      }
      if (apartmentData.electric_price <= 0) {
        throw new Error('Electric price must be greater than 0');
      }
      if (apartmentData.water_price <= 0) {
        throw new Error('Water price must be greater than 0');
      }
      if (
        !formData.internetFree &&
        (!apartmentData.internet_price || apartmentData.internet_price <= 0)
      ) {
        throw new Error('Internet price must be greater than 0 when not free');
      }

      // Create the apartment first
      const apartmentResult =
        await createApartmentMutation.mutateAsync(apartmentData);

      // Extract apartment ID from the response
      const apartmentId =
        apartmentResult.data?.id || apartmentResult.data?.data?.id;

      if (!apartmentId) {
        throw new Error('Failed to get apartment ID from response');
      }

      // Upload images if any are selected
      if (selectedImages.length > 0) {
        await uploadMultipleFilesMutation.mutateAsync({
          apartmentId,
          files: selectedImages,
        });
      }

      // Create rooms for each room type specified
      if (formData.roomTypes.length > 0) {
        const roomCreationPromises = formData.roomTypes.map((room) => {
          const roomData: roomTypes.CreateRoom = {
            name: room.name,
            type: room.type,
            size: room.size,
            price_start: room.price_start,
            price_end: room.price_end,
          };

          return createRoomMutation.mutateAsync({
            apartmentId,
            data: roomData,
          });
        });

        await Promise.all(roomCreationPromises);
      }

      // Success - show popup and reset form
      setShowSuccessPopup(true);

      // Clean up image previews
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));

      // Reset form
      setFormData({
        name: '',
        phone: '',
        description: '',
        apartment_type: 'apartment',
        apartment_location: 'thonburi',
        address_line: '',
        province: '',
        district: '',
        subdistrict: '',
        postal_code: '',
        electric_price: 0,
        water_price: 0,
        internet_price: 0,
        internetFree: false,
        roomTypes: [],
        confirmed: false,
      });
      setSelectedImages([]);
      setImagePreviews([]);
    } catch (error) {
      console.error('Error creating apartment:', error);

      // Log more detailed error information
      if (error && typeof error === 'object' && 'response' in error) {
        interface AxiosError {
          response?: {
            data?: unknown;
            status?: number;
            headers?: unknown;
          };
        }
        const axiosError = error as AxiosError;
        console.error('Error response data:', axiosError.response?.data);
        console.error('Error status:', axiosError.response?.status);
        console.error('Error headers:', axiosError.response?.headers);

        // Log the detailed error message if available
        if (
          axiosError.response?.data &&
          typeof axiosError.response.data === 'object'
        ) {
          const errorData = axiosError.response.data as { error?: unknown };
          console.error('Detailed error:', errorData.error);
        }
      }

      setErrorMessage(
        error instanceof Error
          ? `Failed to create apartment: ${error.message}`
          : 'Failed to create apartment. Please try again.'
      );
      setShowErrorPopup(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableDistricts = (): string[] => {
    if (
      !formData.apartment_location ||
      !locationData[formData.apartment_location]
    )
      return [];
    return locationData[formData.apartment_location].districts;
  };

  const getAvailableSubdistricts = (): string[] => {
    if (
      !formData.apartment_location ||
      !formData.district ||
      !locationData[formData.apartment_location]
    )
      return [];
    return (
      locationData[formData.apartment_location].subdistricts[
        formData.district
      ] || []
    );
  };

  return (
    <div className="font-poppins animate-fade-in min-h-screen bg-[#F9FAFB] p-4">
      <div className="mx-auto max-w-4xl">
        <div className="animate-slide-down mb-6 flex items-center gap-4">
          {/* Back Icon */}
          <button
            onClick={() => (window.location.href = '/ApartmentHomepage')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-2xl transition-all duration-300 hover:scale-110 hover:bg-gray-100"
          >
            <img src={BackIcon} alt="Backpage" />
          </button>
          <h1 className="text-3xl font-bold transition-colors duration-300 hover:text-blue-600">
            Add Apartment
          </h1>
        </div>

        <div className="animate-slide-up rounded-lg bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg">
          <div className="mb-6">
            <label className="mb-2 block font-semibold">Apartment Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-semibold">Contact Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-semibold">
              Apartment Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="mb-6">
            <label className="mb-3 block font-semibold">Apartment Type</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="apartment_type"
                  value="dormitory"
                  checked={formData.apartment_type === 'dormitory'}
                  onChange={(_e) =>
                    handleInputChange('apartment_type', 'dormitory')
                  }
                  className="h-4 w-4"
                />
                <span>Dormitory</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="apartment_type"
                  value="apartment"
                  checked={formData.apartment_type === 'apartment'}
                  onChange={(_e) =>
                    handleInputChange('apartment_type', 'apartment')
                  }
                  className="h-4 w-4"
                />
                <span>Apartment</span>
              </label>
            </div>
          </div>
          <div className="mb-6">
            <label className="mb-3 block font-semibold">
              Apartment Location
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="apartment_location"
                  value="Chom Thong"
                  checked={formData.apartment_location === 'chomthong'}
                  onChange={(_e) =>
                    handleInputChange('apartment_location', 'chomthong')
                  }
                  className="h-4 w-4"
                />
                <span>Chom Thong</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="apartment_location"
                  value="Thonburi"
                  checked={formData.apartment_location === 'thonburi'}
                  onChange={(_e) =>
                    handleInputChange('apartment_location', 'thonburi')
                  }
                  className="h-4 w-4"
                />
                <span>Thonburi</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="apartment_location"
                  value="Thung Khru"
                  checked={formData.apartment_location === 'thungkhru'}
                  onChange={(_e) =>
                    handleInputChange('apartment_location', 'thungkhru')
                  }
                  className="h-4 w-4"
                />
                <span>Thung Khru</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="apartment_location"
                  value="Rat Burana"
                  checked={formData.apartment_location === 'ratburana'}
                  onChange={(_e) =>
                    handleInputChange('apartment_location', 'ratrburana')
                  }
                  className="h-4 w-4"
                />
                <span>Rat Burana</span>
              </label>
            </div>
          </div>
          <div className="mb-6">
            <label className="mb-3 block font-semibold">
              Apartment Address
            </label>
            <div className="mb-4 grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1 block text-sm">Address Line</label>
                <input
                  type="text"
                  value={formData.address_line}
                  onChange={(e) =>
                    handleInputChange('address_line', e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="House number, street, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="mb-1 block text-sm">Province</label>
                <select
                  value={formData.province}
                  onChange={(e) =>
                    handleInputChange('province', e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select</option>
                  <option value="Bangkok">Bangkok</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm">District</label>
                <select
                  value={formData.district}
                  onChange={(e) =>
                    handleInputChange('district', e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none"
                  disabled={!formData.apartment_location}
                >
                  <option value="">Select</option>
                  {getAvailableDistricts().map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm">Subdistrict</label>
                <select
                  value={formData.subdistrict}
                  onChange={(e) =>
                    handleInputChange('subdistrict', e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none"
                  disabled={!formData.district}
                >
                  <option value="">Select</option>
                  {getAvailableSubdistricts().map((subdistrict) => (
                    <option key={subdistrict} value={subdistrict}>
                      {subdistrict}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm">Postal Code</label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) =>
                    handleInputChange('postal_code', e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-3 block font-semibold">
              Electricity Price (THB/unit)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={formData.electric_price}
                onChange={(e) =>
                  handleInputChange(
                    'electric_price',
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-center focus:border-blue-500 focus:outline-none"
                min="0"
                step="0.01"
              />
              <span className="text-sm">THB/unit</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-3 block font-semibold">
              Water Price (THB/unit)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={formData.water_price}
                onChange={(e) =>
                  handleInputChange(
                    'water_price',
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-center focus:border-blue-500 focus:outline-none"
                min="0"
                step="0.01"
              />
              <span className="text-sm">THB/unit</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-3 block font-semibold">Internet</label>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.internet_price}
                  onChange={(e) =>
                    handleInputChange(
                      'internet_price',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  disabled={formData.internetFree}
                  className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-center focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                  min="0"
                  step="0.01"
                />
                <span className="text-sm">THB/Month</span>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.internetFree}
                  onChange={(e) =>
                    handleInputChange('internetFree', e.target.checked)
                  }
                  className="h-4 w-4"
                />
                <span>Free</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-3 block font-semibold">
              Apartment Images (Max 5)
            </label>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative h-32 w-32">
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {selectedImages.length < 5 && (
                  <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {selectedImages.length}/5 images uploaded
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <label className="block font-semibold">Room Types</label>
              {formData.roomTypes.length > 0 && (
                <button
                  onClick={() => {
                    // Clear all rooms from form
                    setFormData((prev) => ({ ...prev, roomTypes: [] }));
                  }}
                  type="button"
                  className="rounded-lg bg-red-100 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-200"
                >
                  Clear All Rooms
                </button>
              )}
            </div>
            {formData.roomTypes.map((room, index) => (
              <div
                key={index}
                className="relative mb-6 rounded-lg border border-gray-200 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Room {index + 1}:</h3>
                  {index > 0 && (
                    <button
                      onClick={() => removeRoomType(index)}
                      className="rounded-full transition-opacity hover:bg-gray-100"
                      type="button"
                    >
                      <img src={TrashIcon} alt="TrashIcon" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Room Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={room.name}
                      onChange={(e) =>
                        handleRoomFieldChange(index, 'name', e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., Studio Room A"
                      minLength={2}
                      maxLength={255}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Room Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={room.type}
                      onChange={(e) =>
                        handleRoomFieldChange(index, 'type', e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., Studio, 1 Bedroom, 2 Bedroom"
                      minLength={2}
                      maxLength={255}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Size (sq.m) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={room.size}
                      onChange={(e) =>
                        handleRoomFieldChange(index, 'size', e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., 30"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Price Start (THB) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={room.price_start}
                      onChange={(e) =>
                        handleRoomFieldChange(
                          index,
                          'price_start',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., 8000"
                      min={0}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Price End (THB) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={room.price_end}
                      onChange={(e) =>
                        handleRoomFieldChange(
                          index,
                          'price_end',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="e.g., 12000"
                      min={0}
                      required
                    />
                  </div>
                </div>

                {room.price_start > room.price_end && room.price_end > 0 && (
                  <div className="mt-2 text-sm text-red-500">
                    Price start must be less than or equal to price end
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addRoomType}
              type="button"
              className="rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold transition-all hover:scale-105 hover:bg-gray-400"
            >
              Add Room Type
            </button>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.confirmed}
                onChange={(e) =>
                  handleInputChange('confirmed', e.target.checked)
                }
                className="h-4 w-4"
              />
              <span className="text-sm">
                I have read and confirmed that the information provided is
                correct.
              </span>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              type="button"
              disabled={isSubmitting}
              className="rounded-lg bg-cyan-400 px-9 py-3 text-lg font-semibold text-white transition-all hover:scale-110 hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSubmitting ? 'Creating...' : 'Done'}
            </button>
          </div>
        </div>
      </div>

      <AddedSuccess
        showSuccess={showSuccessPopup}
        showError={showErrorPopup}
        errorMessage={errorMessage}
        onCloseSuccess={() => setShowSuccessPopup(false)}
        onCloseError={() => setShowErrorPopup(false)}
      />

      {/* uppage */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed right-8 bottom-8 flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-xl shadow-lg transition-all duration-300 hover:scale-110 hover:bg-gray-50 hover:shadow-xl"
      >
        <img src={UppageIcon} alt="Uppage" />
      </button>
    </div>
  );
}
