import { useState, useEffect } from 'react';
import { useNavigate } from '@/router';
import BackIcon from '@/features/G9-ApartmentListing/assets/BackIcon.svg';
import UserIcon from '@/features/G9-ApartmentListing/assets/UserIcon.svg';
import RoomDetailIcon from '@/features/G9-ApartmentListing/assets/RoomDetailIcon.svg';

export default function ApartmentBooking() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    checkin: '',
    roomType: 'Single',
    confirmed: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem('bookingData');
    if (saved) {
      setFormData(JSON.parse(saved));
    }
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    localStorage.setItem('bookingData', JSON.stringify(formData));
    navigate('/ApartmentPayment', {
      state: { roomType: formData.roomType },
    });
  };

  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.phone &&
    formData.email &&
    formData.checkin &&
    formData.confirmed;

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-[#F9FAFB] px-4 py-10">
      <div className="mb-6 w-full max-w-5xl">
        <div className="mb-6 flex w-full max-w-5xl items-center gap-3">
          <button
            onClick={() => navigate('/ApartmentDetails')}
            className="flex h-10 w-10 items-center justify-center rounded-full transition duration-200 hover:bg-gray-100"
          >
            <img src={BackIcon} alt="Back" className="h-6 w-6" />
          </button>
          <h1 className="text-[48px] font-bold text-gray-900">Room Booking</h1>
        </div>
        <div className="mb-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#01CEF8] font-semibold text-white">
              1
            </div>
            <span className="font-poppins font-medium text-[#2B5991]">
              Details
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-[#D9D9D9] font-semibold text-[#8C8C8C]">
              2
            </div>
            <span className="font-medium text-[#8C8C8C]">Payment</span>
          </div>
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
                First Name : <span className="text-[20px] text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="mb-1 block text-[20px] font-medium text-gray-700">
                Last Name : <span className="text-[20px] text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label className="mb-1 block text-[20px] font-medium text-gray-700">
                Phone : <span className="text-[20px] text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="mb-1 block text-[20px] font-medium text-gray-700">
                Email : <span className="text-[20px] text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none"
                placeholder="Enter email address"
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
                Check-in date :{' '}
                <span className="text-[20px] text-red-500">*</span>
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
                Room Type : <span className="text-[20px] text-red-500">*</span>
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

        <div className="mb-8 flex items-center gap-2">
          <input
            type="checkbox"
            id="confirm"
            checked={formData.confirmed}
            onChange={(e) => handleChange('confirmed', e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="confirm" className="text-[16px] text-gray-600">
            I have read and confirmed that the information provided is correct.
            <span className="text-[20px] text-red-500"> *</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!isFormValid}
            className={`rounded-md px-6 py-2 text-[20px] font-medium text-white transition-colors duration-200 ${
              isFormValid
                ? 'bg-[#01CEF8] hover:bg-[#4E8FB1]'
                : 'cursor-not-allowed bg-gray-400'
            }`}
          >
            Step 2 : Payment →
          </button>
        </div>
      </div>
    </div>
  );
}
