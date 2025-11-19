import React, { useState, useEffect } from 'react';
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
  Address,
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

interface ImageData {
  id: number;
  file_path?: string;
  url?: string;
  preview?: string;
}
export default function EditApartment(): React.ReactElement {
  const urlParams = new URLSearchParams(window.location.search);
  const apartmentIdParam = urlParams.get('apartmentId');
  const apartmentId = apartmentIdParam ? parseInt(apartmentIdParam) : 0;

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [existingImageData, setExistingImageData] = useState<ImageData[]>([]);
  const [roomsToDelete, setRoomsToDelete] = useState<number[]>([]);

  const updateApartmentMutation = APT.useUpdateApartment();
  const uploadMultipleFilesMutation = UploadHooks.useUploadMultipleFiles();
  const deleteFileMutation = UploadHooks.useDeleteFile();
  const createRoomMutation = Room.useCreateRoom();
  const updateRoomMutation = Room.useUpdateRoom();
  const deleteRoomMutation = Room.useDeleteRoom();

  // Fetch existing apartment data
  const { data: apartmentData } = APT.useApartment(apartmentId);
  const { data: addressData } = Address.fetchAddressById(
    apartmentData?.address_id
  );
  const { data: existingImages } =
    UploadHooks.usePicturesByApartment(apartmentId);
  const { data: existingRoomsData } = Room.useRooms(apartmentId);

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
  interface RoomFormData {
    id?: number; // Optional ID for existing rooms
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

  // Load existing apartment data into form
  useEffect(() => {
    if (apartmentData && addressData) {
      const rawApartment = apartmentData.data || apartmentData;
      const rawAddress = addressData.data || addressData;

      setFormData((prev) => ({
        ...prev,
        name: rawApartment.name || '',
        phone: rawApartment.phone || '',
        description: rawApartment.description || '',
        apartment_type: rawApartment.apartment_type || 'apartment',
        apartment_location: rawApartment.apartment_location || 'asoke',
        address_line: rawAddress?.address_line || '',
        province: rawAddress?.province || '',
        district: rawAddress?.district || '',
        subdistrict: rawAddress?.subdistrict || '',
        postal_code: rawAddress?.postal_code || '',
        electric_price: rawApartment.electric_price || 0,
        water_price: rawApartment.water_price || 0,
        internet_price: rawApartment.internet_price || 0,
        internetFree: rawApartment.internet === 'free',
        confirmed: false,
        // Don't overwrite roomTypes here - let the room loading effect handle it
      }));
      setIsLoading(false);
    }
  }, [apartmentData, addressData]);

  // Load existing rooms into form
  useEffect(() => {
    if (existingRoomsData) {
      const rooms = existingRoomsData || [];
      console.log('Processing rooms:', rooms);

      if (rooms.length === 0) {
        setFormData((prev) => ({
          ...prev,
          roomTypes: [],
        }));
        return;
      }

      const roomFormData: RoomFormData[] = rooms.map(
        (room: roomTypes.Room) => ({
          id: room.id,
          name: room.name,
          type: room.type,
          size: room.size,
          price_start: room.price_start,
          price_end: room.price_end,
          room_status: room.room_status,
        })
      );

      console.log('Loading existing rooms:', roomFormData);
      setFormData((prev) => ({
        ...prev,
        roomTypes: roomFormData,
      }));
    }
  }, [existingRoomsData]);

  // Load existing images
  useEffect(() => {
    if (existingImages) {
      const imageArray =
        existingImages?.data?.data || existingImages?.data || [];
      setExistingImageData(imageArray);
      const imageUrls = imageArray.map(
        (img: ImageData) => img.file_path || img.url || img.preview
      );
      setExistingImageUrls(imageUrls);
    }
  }, [existingImages]);

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

    const currentImageCount = selectedImages.length + existingImageUrls.length;
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

  const removeExistingImage = async (index: number): Promise<void> => {
    try {
      const imageToDelete = existingImageData[index];
      if (imageToDelete?.id) {
        await deleteFileMutation.mutateAsync(imageToDelete.id.toString());
      }

      // Remove from local state after successful deletion
      setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
      setExistingImageData((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting image:', error);
      setErrorMessage('Failed to delete image. Please try again.');
      setShowErrorPopup(true);
    }
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

    const roomToRemove = formData.roomTypes[index];

    // If it's an existing room (has ID), mark it for deletion
    if (roomToRemove.id) {
      setRoomsToDelete((prev) => [...prev, roomToRemove.id!]);
    }

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
          room.size.length >= 1
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

    if (!apartmentId) {
      setErrorMessage('Apartment ID is required for update');
      setShowErrorPopup(true);
      return;
    }

    try {
      // Prepare apartment update data
      const apartmentUpdateData: apartmentTypes.UpdateApartmentPayload = {
        name: formData.name,
        phone: formData.phone,
        description: formData.description,
        apartment_type: formData.apartment_type, // Add required apartment_type field
        apartment_location: formData.apartment_location,
        electric_price: formData.electric_price,
        water_price: formData.water_price,
        internet: formData.internetFree ? 'free' : 'not_free',
        internet_price: formData.internetFree ? null : formData.internet_price,
        address: {
          address_line: formData.address_line,
          province: formData.province,
          district: formData.district,
          subdistrict: formData.subdistrict,
          postal_code: formData.postal_code,
        },
      };

      console.log('Updating apartment with data:', apartmentUpdateData);
      console.log('Apartment ID:', apartmentId);
      console.log('Room data to create:', formData.roomTypes);

      // Update the apartment
      await updateApartmentMutation.mutateAsync({
        id: apartmentId,
        data: apartmentUpdateData,
      });

      // Upload new images if any are selected
      if (selectedImages.length > 0) {
        await uploadMultipleFilesMutation.mutateAsync({
          apartmentId: apartmentId,
          files: selectedImages,
        });
      }

      // Handle room operations (delete, update, create)

      // 1. Delete rooms that were removed
      if (roomsToDelete.length > 0) {
        const deletionPromises = roomsToDelete.map((roomId) =>
          deleteRoomMutation.mutateAsync({ apartmentId, roomId })
        );
        await Promise.all(deletionPromises);
      }

      // 2. Process existing and new rooms
      if (formData.roomTypes.length > 0) {
        const roomOperations = formData.roomTypes.map((room) => {
          if (room.id) {
            // Existing room - update it
            const updateData: roomTypes.UpdateRoom = {
              name: room.name,
              type: room.type,
              size: room.size,
              price_start: room.price_start,
              price_end: room.price_end,
              room_status: room.room_status,
            };

            return updateRoomMutation.mutateAsync({
              apartmentId,
              roomId: room.id,
              data: updateData,
            });
          } else {
            // New room - create it
            const createData: roomTypes.CreateRoom = {
              name: room.name,
              type: room.type,
              size: room.size,
              price_start: room.price_start,
              price_end: room.price_end,
            };

            return createRoomMutation.mutateAsync({
              apartmentId,
              data: createData,
            });
          }
        });

        await Promise.all(roomOperations);
      }

      // Success - show popup and clean up
      setShowSuccessPopup(true);

      // Clean up image previews
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      setSelectedImages([]);
      setImagePreviews([]);
    } catch (error: unknown) {
      console.error('Error updating apartment:', error);

      interface AxiosError {
        response?: {
          data?: {
            message?: string;
            error?: string;
          };
        };
        message?: string;
      }

      const axiosError = error as AxiosError;
      console.error('Error response:', axiosError?.response?.data);
      console.error(
        'Full error details:',
        JSON.stringify(axiosError?.response?.data, null, 2)
      );

      let errorMsg = 'Failed to update apartment. Please try again.';
      if (axiosError?.response?.data?.message) {
        errorMsg = `Failed to update apartment: ${axiosError.response.data.message}`;
      } else if (axiosError?.response?.data?.error) {
        errorMsg = `Failed to update apartment: ${axiosError.response.data.error}`;
      } else if (axiosError?.message) {
        errorMsg = `Failed to update apartment: ${axiosError.message}`;
      }

      setErrorMessage(errorMsg);
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

  if (isLoading || !apartmentData) {
    return (
      <div className="font-poppins min-h-screen bg-[#F9FAFB] p-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex h-96 items-center justify-center">
            <div className="text-xl">Loading apartment data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-poppins min-h-screen bg-[#F9FAFB] p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          {/* Back Icon */}
          <button
            onClick={() => (window.location.href = '/ApartmentListedAPT')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-2xl hover:bg-gray-100"
          >
            <img src={BackIcon} alt="Backpage" />
          </button>
          <h1 className="text-3xl font-bold">Edit Apartment</h1>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-sm">
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
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm">Number</label>
                <input
                  type="text"
                  value={formData.address_line}
                  onChange={(e) =>
                    handleInputChange('address_line', e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
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
                {/* Existing images */}
                {existingImageUrls.map((imageUrl, index) => (
                  <div key={`existing-${index}`} className="relative h-32 w-32">
                    <img
                      src={imageUrl}
                      alt="Existing"
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <button
                      onClick={() => removeExistingImage(index)}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                      type="button"
                      disabled={deleteFileMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {/* New image previews */}
                {imagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative h-32 w-32">
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
                {existingImageUrls.length + selectedImages.length < 5 && (
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
                {existingImageUrls.length + selectedImages.length}/5 images
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <label className="block font-semibold">Room Types</label>
              {formData.roomTypes.length > 0 && (
                <button
                  onClick={() => {
                    // Mark all existing rooms for deletion
                    const existingRoomIds = formData.roomTypes
                      .filter((room) => room.id)
                      .map((room) => room.id!);
                    setRoomsToDelete((prev) => [...prev, ...existingRoomIds]);

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
              className="rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-400"
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
              className="rounded-lg bg-cyan-400 px-9 py-3 text-lg font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSubmitting ? 'Updating...' : 'Update'}
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
        className="fixed right-8 bottom-8 flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-xl shadow-lg transition-colors hover:bg-gray-50"
      >
        <img src={UppageIcon} alt="Uppage" />
      </button>
    </div>
  );
}
