import { useState, useEffect } from 'react';
// navigate with query params is done with window.location.href when needed
import {
  useBooking,
  useUpdateBooking,
} from '@/features/G9-ApartmentListing/hooks/useBooking';
import { useUserRole } from '@/features/power-bi/hooks/useUserRole';
import BackIcon from '@/features/G9-ApartmentListing/assets/BackIcon.svg';
import UserIcon from '@/features/G9-ApartmentListing/assets/UserIcon.svg';
import RoomDetailIcon from '@/features/G9-ApartmentListing/assets/RoomDetailIcon.svg';
import SaveConfirm from '@/features/G9-ApartmentListing/components/SaveConfirm';
import SuccessModal from '@/features/G9-ApartmentListing/components/SuccessModal';

export default function AdminEditTenant() {
  const params = new URLSearchParams(window.location.search);
  const bookingId = Number(params.get('id') || 0);

  // Hooks from project — DO NOT replace these with a new custom hook
  const {
    data: bookingResp,
    isLoading: bookingLoading,
    error: bookingError,
  } = useBooking(bookingId);
  const updateBooking = useUpdateBooking();

  // Admin role check
  const { role } = useUserRole();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

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
    const booking = bookingResp?.data || null;

    console.log('Booking Loading:', bookingLoading);
    console.log('Booking Response:', bookingResp);
    console.log('Booking Data:', booking);
    console.log('Data Loaded:', isDataLoaded);

    if (!bookingLoading && !isDataLoaded) {
      if (booking) {
        const guestName = booking.guest_name || booking.guestName || '';
        const guestPhone = booking.guest_phone || booking.guestPhone || '';
        const guestEmail = booking.guest_email || booking.guestEmail || '';
        const checkIn = booking.check_in || booking.checkIn || '';
        const roomType = booking.room_type || booking.roomType || 'Single';

        console.log('Guest Name:', guestName);
        console.log('Phone:', guestPhone);
        console.log('Email:', guestEmail);
        console.log('Check-in:', checkIn);

        const [firstName, ...rest] = guestName.split(' ');
        const lastName = rest.join(' ');

        const newFormData = {
          firstName: firstName || '',
          lastName: lastName || '',
          phone: guestPhone || '',
          email: guestEmail || '',
          checkin: checkIn ? checkIn.slice(0, 10) : '',
          roomType: roomType || 'Single',
          confirmed: true,
        };

        console.log('Setting Form Data:', newFormData);
        setFormData(newFormData);
        setIsDataLoaded(true);
      } else {
        console.log('No booking data, checking localStorage...');
        try {
          const saved = localStorage.getItem('bookingData');
          if (saved) {
            const parsed = JSON.parse(saved);
            setFormData({
              firstName: parsed.firstName || '',
              lastName: parsed.lastName || '',
              phone: parsed.phone || '',
              email: parsed.email || '',
              checkin: parsed.checkin || '',
              roomType: parsed.roomType || 'Single',
              confirmed: parsed.confirmed ?? true,
            });
            setIsDataLoaded(true);
            console.log('Loaded from localStorage');
          }
        } catch (error) {
          console.error('localStorage error:', error);
        }
      }
    }
  }, [bookingResp, bookingLoading, isDataLoaded]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    const booking = bookingResp?.data || null;
    if (!booking) return;

    const payload = {
      user_id: booking.user_id,
      room_id: booking.room_id,
      apartment_id: booking.apartment_id,
      guest_name: `${formData.firstName} ${formData.lastName}`.trim(),
      guest_phone: formData.phone,
      guest_email: formData.email,
      room_type: formData.roomType,
      booking_status: booking.booking_status,
      check_in: new Date(formData.checkin + 'T00:00:00Z').toISOString(),
    };
    console.log('Updating booking with payload:', payload);

    updateBooking.mutate(
      { id: booking.id, data: payload },
      {
        onSuccess: () => {
          setIsPopupOpen(false);
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            window.location.href = `/AdminTenantInfo?id=${booking.apartment_id}`;
          }, 2000);
        },
        onError: (err) => {
          console.error('Failed to update booking', err);
        },
      }
    );
  };

  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.phone &&
    formData.email &&
    formData.checkin;

  const booking = bookingResp?.data || null;

  const isAdmin = role === 'admin';

  if (bookingLoading) {
    return (
      <div className="font-poppins flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600">
          Loading tenant information...
        </div>
      </div>
    );
  }

  if (bookingError) {
    return (
      <div className="font-poppins flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-600">
          Failed to load tenant information.
        </div>
      </div>
    );
  }

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
              onClick={() =>
                (window.location.href = `/AdminTenantInfo?id=${booking?.apartment_id ?? ''}`)
              }
              className="flex h-10 w-10 items-center justify-center rounded-full transition duration-200 hover:bg-gray-100"
            >
              <img src={BackIcon} alt="Back" className="h-6 w-6" />
            </button>

            <h1 className="text-[48px] font-bold text-gray-900">
              Edit Tenant Information
            </h1>
          </div>
        </div>

        {booking && !isAdmin && (
          <div className="mb-6 w-full max-w-5xl rounded-3xl border border-yellow-300 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-900">
              You are not an admin. Only admins can edit tenant details.
            </p>
          </div>
        )}

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
                  placeholder="Enter first name"
                  disabled={!isAdmin}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
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
                  placeholder="Enter last name"
                  disabled={!isAdmin}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
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
                  placeholder="Enter phone number"
                  disabled={!isAdmin}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
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
                  placeholder="Enter email address"
                  disabled={!isAdmin}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
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
                  disabled={!isAdmin}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="mb-1 block text-[20px] font-medium text-gray-700">
                  Room Type :<span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.roomType}
                  onChange={(e) => handleChange('roomType', e.target.value)}
                  disabled={!isAdmin}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
                >
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Studio">Studio</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            {/* Only admins can edit tenant information. */}
            <button
              onClick={() => setIsPopupOpen(true)}
              disabled={!isFormValid || !isAdmin}
              className={`rounded-md px-6 py-2 text-[20px] font-medium text-white transition-colors duration-200 ${
                isFormValid && isAdmin
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
