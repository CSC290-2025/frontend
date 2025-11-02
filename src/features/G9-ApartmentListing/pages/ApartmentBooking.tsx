import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CalendarDays } from 'lucide-react';
// ยังไม้ได้ลงไอคอน เดี๋ยวโหลดมาลง ขอโทษสังคม

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
    navigate('/Apartmentpayment', {
      state: { roomType: formData.roomType },
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-10">
      <div className="mb-6 w-full max-w-5xl">
        <h1 className="mb-6 text-4xl font-bold">Room Booking</h1>

        <div className="mb-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#01CEF8] font-semibold text-white">
              1
            </div>
            <span className="font-medium text-[#2B5991]">Details</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 font-semibold text-gray-400">
              2
            </div>
            <span className="font-medium text-gray-400">Payment</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl rounded-3xl border border-gray-200 bg-white p-10 shadow-lg">
        <div className="mb-8">
          <div className="mb-3 flex items-center space-x-2">
            <User className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Personal details
            </h2>
          </div>
          <hr className="mb-6 border-gray-200" />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name :
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
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name :
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
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone :
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
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email :
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
            <CalendarDays className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Room details
            </h2>
          </div>
          <hr className="mb-6 border-gray-200" />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Check-in date :
              </label>
              <input
                type="date"
                value={formData.checkin}
                onChange={(e) => handleChange('checkin', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Room Type :
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
          <label htmlFor="confirm" className="text-sm text-gray-600">
            I have read and confirmed that the information provided is correct.
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="rounded-md bg-[#01CEF8] px-6 py-2 font-medium text-white hover:bg-[#4E8FB1]"
          >
            Step 2 : Payment →
          </button>
        </div>
      </div>
    </div>
  );
}
