import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import BackIcon from '@/features/G9-ApartmentListing/assets/BackIcon.svg';
import TrashIcon from '@/features/G9-ApartmentListing/assets/TrashIcon.svg';
import UppageIcon from '@/features/G9-ApartmentListing/assets/UppageIcon.svg';
import AddedSuccess from '@/features/G9-ApartmentListing/components/AddedSuccess';

interface RoomType {
  id: number;
  name: string;
  size: string;
  monthly: string;
  availableRooms: string;
}

interface ImageFile {
  id: number;
  file: File;
  preview: string;
}

interface FormData {
  apartmentName: string;
  contactNumber: string;
  description: string;
  location: string;
  addressNumber: string;
  soi: string;
  street: string;
  province: string;
  district: string;
  subdistrict: string;
  postalCode: string;
  electricityUnit: string;
  waterUnit: string;
  waterMinimum: string;
  internetPrice: string;
  internetFree: boolean;
  images: ImageFile[];
  roomTypes: RoomType[];
  confirmed: boolean;
}

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

  const locationData: LocationData = {
    Asoke: {
      districts: ['Watthana'],
      subdistricts: {
        Watthana: ['Khlong Toei Nuea', 'Khlong Tan Nuea', 'Phra Khanong'],
      },
    },
    Prachautit: {
      districts: ['Rat Burana'],
      subdistricts: {
        'Rat Burana': ['Rat Burana', 'Bang Pakok', 'Bang Mot'],
      },
    },
    Phathumwan: {
      districts: ['Pathum Wan'],
      subdistricts: {
        'Pathum Wan': ['Rong Muang', 'Wang Mai', 'Pathum Wan', 'Lumphini'],
      },
    },
  };

  const [formData, setFormData] = useState<FormData>({
    apartmentName: '',
    contactNumber: '',
    description: '',
    location: '',
    addressNumber: '',
    soi: '',
    street: '',
    province: '',
    district: '',
    subdistrict: '',
    postalCode: '',
    electricityUnit: '',
    waterUnit: '',
    waterMinimum: '',
    internetPrice: '',
    internetFree: false,
    images: [],
    roomTypes: [
      {
        id: 1,
        name: '',
        size: '',
        monthly: '',
        availableRooms: '',
      },
    ],
    confirmed: false,
  });

  const handleInputChange = (
    field: keyof FormData,
    value: FormData[keyof FormData]
  ): void => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value } as FormData;

      if (field === 'location') {
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

    const currentImageCount = formData.images.length;
    const remainingSlots = 5 - currentImageCount;

    if (remainingSlots <= 0) {
      setErrorMessage('Maximum 5 images allowed');
      setShowErrorPopup(true);
      return;
    }

    const newImages: ImageFile[] = [];
    const filesToAdd = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToAdd; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newImages.push({
          id: Date.now() + i,
          file,
          preview,
        });
      }
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const removeImage = (id: number): void => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  };

  const handleRoomTypeChange = (
    index: number,
    field: Exclude<keyof RoomType, 'id'>,
    value: string
  ): void => {
    const newRoomTypes = [...formData.roomTypes];
    newRoomTypes[index] = {
      ...newRoomTypes[index],
      [field]: value,
    } as RoomType;
    setFormData((prev) => ({ ...prev, roomTypes: newRoomTypes }));
  };

  const addRoomType = (): void => {
    setFormData((prev) => ({
      ...prev,
      roomTypes: [
        ...prev.roomTypes,
        {
          id: prev.roomTypes.length + 1,
          name: '',
          size: '',
          monthly: '',
          availableRooms: '',
        },
      ],
    }));
  };

  const removeRoomType = (index: number): void => {
    if (index === 0) return;

    setFormData((prev) => ({
      ...prev,
      roomTypes: prev.roomTypes
        .filter((_, i) => i !== index)
        .map((room, i) => ({ ...room, id: i + 1 })),
    }));
  };

  const validateForm = (): boolean => {
    const requiredStringFields = [
      formData.apartmentName,
      formData.contactNumber,
      formData.description,
      formData.location,
      formData.addressNumber,
      formData.province,
      formData.district,
      formData.subdistrict,
      formData.postalCode,
      formData.electricityUnit,
      formData.internetFree ? 'free' : formData.internetPrice,
    ];

    const hasWaterPrice = !!(formData.waterUnit || formData.waterMinimum);

    const roomTypesValid = formData.roomTypes.every(
      (room) => room.name && room.size && room.monthly && room.availableRooms
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

  const handleSubmit = (): void => {
    if (validateForm()) {
      setShowSuccessPopup(true);
    } else {
      setErrorMessage('Please fill in all fields');
      setShowErrorPopup(true);
    }
  };

  const getAvailableDistricts = (): string[] => {
    if (!formData.location || !locationData[formData.location]) return [];
    return locationData[formData.location].districts;
  };

  const getAvailableSubdistricts = (): string[] => {
    if (
      !formData.location ||
      !formData.district ||
      !locationData[formData.location]
    )
      return [];
    return (
      locationData[formData.location].subdistricts[formData.district] || []
    );
  };

  return (
    <div className="font-poppins min-h-screen bg-[#F9FAFB] p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          {/* Back Icon */}
          <button
            onClick={() => (window.location.href = '/ApartmentHomepage')}
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
              value={formData.apartmentName}
              onChange={(e) =>
                handleInputChange('apartmentName', e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-semibold">Contact Number</label>
            <input
              type="text"
              value={formData.contactNumber}
              onChange={(e) =>
                handleInputChange('contactNumber', e.target.value)
              }
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
            <label className="mb-3 block font-semibold">
              Apartment Location
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="location"
                  value="Asoke"
                  checked={formData.location === 'Asoke'}
                  onChange={(e) =>
                    handleInputChange('location', e.target.value)
                  }
                  className="h-4 w-4"
                />
                <span>Asoke</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="location"
                  value="Prachautit"
                  checked={formData.location === 'Prachautit'}
                  onChange={(e) =>
                    handleInputChange('location', e.target.value)
                  }
                  className="h-4 w-4"
                />
                <span>Prachautit</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="location"
                  value="Phathumwan"
                  checked={formData.location === 'Phathumwan'}
                  onChange={(e) =>
                    handleInputChange('location', e.target.value)
                  }
                  className="h-4 w-4"
                />
                <span>Phathumwan</span>
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
                  value={formData.addressNumber}
                  onChange={(e) =>
                    handleInputChange('addressNumber', e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Soi</label>
                <input
                  type="text"
                  value={formData.soi}
                  onChange={(e) => handleInputChange('soi', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Street</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
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
                  disabled={!formData.location}
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
                  value={formData.postalCode}
                  onChange={(e) =>
                    handleInputChange('postalCode', e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-3 block font-semibold">
              Electricity Price
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm">unit used</span>
              <input
                type="text"
                value={formData.electricityUnit}
                onChange={(e) =>
                  handleInputChange('electricityUnit', e.target.value)
                }
                className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-center focus:border-blue-500 focus:outline-none"
              />
              <span className="text-sm">THB/unit</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-3 block font-semibold">Water Price</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">unit used</span>
                <input
                  type="text"
                  value={formData.waterUnit}
                  onChange={(e) =>
                    handleInputChange('waterUnit', e.target.value)
                  }
                  className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-center focus:border-blue-500 focus:outline-none"
                />
                <span className="text-sm">THB/unit</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Minimum</span>
                <input
                  type="text"
                  value={formData.waterMinimum}
                  onChange={(e) =>
                    handleInputChange('waterMinimum', e.target.value)
                  }
                  className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-center focus:border-blue-500 focus:outline-none"
                />
                <span className="text-sm">THB/unit</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-3 block font-semibold">Internet</label>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.internetPrice}
                  onChange={(e) =>
                    handleInputChange('internetPrice', e.target.value)
                  }
                  disabled={formData.internetFree}
                  className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-center focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
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
                {formData.images.map((image) => (
                  <div key={image.id} className="relative h-32 w-32">
                    <img
                      src={image.preview}
                      alt="Preview"
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {formData.images.length < 5 && (
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
                {formData.images.length}/5 images uploaded
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-3 block font-semibold">Room Type</label>
            {formData.roomTypes.map((roomType, index) => (
              <div
                key={roomType.id}
                className="relative mb-6 rounded-lg border border-gray-200 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Type {roomType.id}:</h3>
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
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="mb-1 block text-sm">Room type name</label>
                    <input
                      type="text"
                      value={roomType.name}
                      onChange={(e) =>
                        handleRoomTypeChange(index, 'name', e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Room size</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={roomType.size}
                        onChange={(e) =>
                          handleRoomTypeChange(index, 'size', e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                      <span className="text-sm">sq.m.</span>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Monthly</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={roomType.monthly}
                        onChange={(e) =>
                          handleRoomTypeChange(index, 'monthly', e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                      <span className="text-sm">THB/Month</span>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Available Room</label>
                    <input
                      type="number"
                      value={roomType.availableRooms}
                      onChange={(e) =>
                        handleRoomTypeChange(
                          index,
                          'availableRooms',
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
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
              className="rounded-lg bg-cyan-400 px-9 py-3 text-lg font-semibold text-white hover:bg-cyan-500"
            >
              Done
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
