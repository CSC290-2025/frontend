import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@/router';
import BackIcon from '@/features/G9-ApartmentListing/assets/BackIcon.svg';
import UserIcon from '@/features/G9-ApartmentListing/assets/UserIcon.svg';
import RoomDetailIcon from '@/features/G9-ApartmentListing/assets/RoomDetailIcon.svg';
import { APT, Room } from '@/features/G9-ApartmentListing/hooks/index';
import type { roomTypes } from '@/features/G9-ApartmentListing/types';
import { useCreateBooking } from '@/features/G9-ApartmentListing/hooks/useBooking';

const UserData = {
  userId: 14,
  firstName: 'John',
  lastName: 'Doe',
  phone: '123-456-7890',
  email: 'john.doe@example.com',
};

export default function ApartmentBooking() {
  const navigate = useNavigate();

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const apartmentId = urlParams.get('apartmentId');

  // Fetch apartment data
  const { data: apartmentData, isLoading: apartmentLoading } = APT.useApartment(
    apartmentId ? parseInt(apartmentId) : 0
  );

  // Fetch available rooms for the apartment
  const { data: availableRoomsData, isLoading: roomsLoading } =
    Room.useRoomsByStatus(apartmentId ? parseInt(apartmentId) : 0, 'available');

  const createBooking = useCreateBooking();

  // Extract apartment and room info
  const apartment = apartmentData?.data || apartmentData || null;
  const availableRooms = useMemo(() => {
    return availableRoomsData?.data?.data || availableRoomsData?.data || [];
  }, [availableRoomsData]);

  const [formData, setFormData] = useState({
    firstName: UserData.firstName,
    lastName: UserData.lastName,
    phone: UserData.phone,
    email: UserData.email,
    checkin: '',
    roomType: '',
    confirmed: false,
  });

  useEffect(() => {
    // Update roomType when availableRooms data loads and no room type is selected yet
    if (availableRooms.length > 0 && !formData.roomType) {
      setFormData((prev) => ({ ...prev, roomType: availableRooms[0].type }));
    }
  }, [availableRooms, formData.roomType]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    // Validate that we have apartment data
    if (!apartment || !apartmentId) {
      console.error('Missing apartment data');
      alert('Error: Missing apartment information.');
      return;
    }

    // Check if there are any available rooms at all
    if (availableRooms.length === 0) {
      alert(
        'No available rooms in this apartment. Please browse other apartments or check back later.'
      );
      return;
    }

    // Since we're only fetching available rooms, any room in the list should be bookable
    const selectedRoom = availableRooms.find(
      (room: roomTypes.Room) => room.type === formData.roomType
    );

    if (!selectedRoom) {
      alert(
        'Selected room type not found. Please refresh the page and try again.'
      );
      return;
    }

    try {
      // TODO: Replace with actual user ID from authentication context
      const currentUserId = 14;

      const bookingPayload = {
        user_id: currentUserId,
        room_id: selectedRoom.id,
        apartment_id: parseInt(apartmentId),
        guest_name: `${formData.firstName} ${formData.lastName}`,
        guest_phone: formData.phone.replace(/\D/g, '').slice(0, 10), // Remove non-digits and limit to 10 characters
        guest_email: formData.email,
        room_type: formData.roomType,
        check_in: new Date(formData.checkin + 'T00:00:00Z').toISOString(), // Convert date to ISO datetime format
      };

      const result = await createBooking.mutateAsync(bookingPayload);
      const bookingId = result?.data?.data?.id || result?.data?.id;

      if (!bookingId) {
        console.error('Booking created but no ID returned:', result);
        alert(
          'Booking created but unable to proceed to payment. Please check your bookings.'
        );
        return;
      }

      // Navigate to payment page with booking ID in URL
      window.location.href = `/ApartmentPayment?bookingId=${bookingId}`;
    } catch (error) {
      console.error('Failed to create booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.phone &&
    formData.email &&
    formData.checkin &&
    formData.confirmed &&
    apartment &&
    availableRooms.length > 0;

  // Show loading state
  if (apartmentLoading || roomsLoading) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB]">
        <div className="text-xl">Loading booking information...</div>
      </div>
    );
  }

  // Show error state if no apartment data
  if (!apartmentId || !apartment) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] px-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">
            Booking Error
          </h1>
          <p className="mb-4 text-gray-600">
            Missing apartment or room information. Please select a room from the
            apartment details page.
          </p>
          <button
            onClick={() => navigate('/ApartmentHomepage')}
            className="rounded-md bg-[#01CEF8] px-6 py-2 text-white hover:bg-[#4E8FB1]"
          >
            Back to Apartments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-[#F9FAFB] px-4 py-10">
      <div className="mb-6 w-full max-w-5xl">
        <div className="mb-6 flex w-full max-w-5xl items-center gap-3">
          <button
            onClick={() => window.history.back()}
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
                {availableRooms.map((room: roomTypes.Room, index: number) => (
                  <option key={index} value={room.type}>
                    {room.type}
                  </option>
                ))}
                {availableRooms.length === 0 && (
                  <option value="">No available rooms</option>
                )}
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
