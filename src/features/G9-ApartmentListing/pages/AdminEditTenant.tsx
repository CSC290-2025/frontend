import { useState, useEffect } from 'react';
import { useNavigate } from '@/router';
import BackIcon from '@/features/G9-ApartmentListing/assets/BackIcon.svg';
import UserIcon from '@/features/G9-ApartmentListing/assets/UserIcon.svg';
import RoomDetailIcon from '@/features/G9-ApartmentListing/assets/RoomDetailIcon.svg';
import SaveConfirm from '@/features/G9-ApartmentListing/components/SaveConfirm';
import SuccessModal from '@/features/G9-ApartmentListing/components/SuccessModal';

export default function AdminEditTenant() {
  const navigate = useNavigate();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    checkin: '',
    roomType: 'Single',
    confirmed: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem('bookingData');
    if (saved) {
      setFormData(JSON.parse(saved));
    }
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    localStorage.setItem('bookingData', JSON.stringify(formData));

    setIsPopupOpen(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      navigate('/AdminTenantInfo');
    }, 2000);
  };

  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.phone &&
    formData.email &&
    formData.checkin;

  return (
    <>
      {/* Popup Confirm */}
      <SaveConfirm
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onConfirm={handleSave}
      />

      {/* Success Toast */}
      {showSuccess && <SuccessModal message="Save changes successfully" />}

      <div className="font-poppins relative flex min-h-screen flex-col items-center bg-[#F9FAFB] px-4 py-10">
        <div className="mb-6 w-full max-w-5xl">
          <div className="mb-6 flex w-full max-w-5xl items-center gap-3">
            <button
              onClick={() => navigate('/AdminTenantInfo')}
              className="flex h-10 w-10 items-center justify-center rounded-full transition duration-200 hover:bg-gray-100"
            >
              <img src={BackIcon} alt="Back" className="h-6 w-6" />
            </button>

            <h1 className="text-[48px] font-bold text-gray-900">
              Edit Tenant Information
            </h1>
          </div>
        </div>

        <div className="w-full max-w-5xl rounded-3xl border border-gray-200 bg-white p-10 shadow-lg">
          <div className="mb-8">
            <div className="mb-3 flex items-center space-x-2">
              <img src={UserIcon} alt="UserIcon" className="h-10 w-10" />
              <h2 className="text-[24px] font-semibold text-gray-800">
                Personal details
              </h2>
            </div>
            <hr className="mb-6 border-gray-300" />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-[20px] font-medium text-gray-700">
                  First Name :<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-[20px] font-medium text-gray-700">
                  Last Name :<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-[20px] font-medium text-gray-700">
                  Phone :<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-[20px] font-medium text-gray-700">
                  Email :<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-3 flex items-center space-x-2">
              <img
                src={RoomDetailIcon}
                alt="RoomDetailIcon"
                className="h-10 w-10"
              />
              <h2 className="text-[24px] font-semibold text-gray-800">
                Room details
              </h2>
            </div>
            <hr className="mb-6 border-gray-300" />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-[20px] font-medium text-gray-700">
                  Check-in date :<span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.checkin}
                  onChange={(e) => handleChange('checkin', e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-[20px] font-medium text-gray-700">
                  Room Type :<span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.roomType}
                  onChange={(e) => handleChange('roomType', e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none"
                >
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Studio">Studio</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setIsPopupOpen(true)}
              disabled={!isFormValid}
              className={`rounded-md px-6 py-2 text-[20px] font-medium text-white transition-colors duration-200 ${
                isFormValid
                  ? 'bg-[#01CEF8] hover:bg-[#4E8FB1]'
                  : 'cursor-not-allowed bg-gray-400'
              }`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
