import React, { useEffect, useState } from 'react';
import { useNavigate } from '@/router';
import BookingComplete from '@/features/G9-ApartmentListing/components/BookingComplete';
import {
  postWalletsTransfer,
  useGetWalletsUserUserId,
} from '@/api/generated/wallets';
import {
  useBooking,
  useUpdateBookingStatus,
} from '@/features/G9-ApartmentListing/hooks/useBooking';
import { BOOKapi } from '@/features/G9-ApartmentListing/api/index';
import {
  APT,
  Room,
  Rating,
  Upload,
} from '@/features/G9-ApartmentListing/hooks/index';
import {
  apartmentTypes,
  roomTypes,
} from '@/features/G9-ApartmentListing/types';
import LocationIcon from '@/features/G9-ApartmentListing/assets/LocationIcon.svg';
import BackIcon from '@/features/G9-ApartmentListing/assets/BackIcon.svg';
import EWalletIcon from '@/features/G9-ApartmentListing/assets/EWalletIcon.svg';
import '@/features/G9-ApartmentListing/styles/animations.css';

// Component to display apartment image with fallback
const ApartmentImage: React.FC<{
  apartment_id: number;
  name: string;
}> = ({ apartment_id, name }) => {
  const { data: images, isLoading: imageLoading } =
    Upload.usePicturesByApartment(apartment_id);

  const defaultImage =
    'https://i.pinimg.com/736x/e6/b6/87/e6b6879516fe0c7e046dfc83922626d6.jpg';

  if (imageLoading) {
    return (
      <div className="h-48 w-full animate-pulse rounded-lg bg-gray-300 object-cover md:w-64"></div>
    );
  }

  // Handle the backend response structure:
  const imageArray = images?.data?.data || images?.data || [];
  const imageUrl =
    imageArray && imageArray.length > 0 ? imageArray[0].url : defaultImage;
  console.log('ApartmentImage URL:', imageUrl);
  return (
    <img
      src={imageUrl}
      alt={name}
      className="w-full object-cover md:w-64"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        if (target.src !== defaultImage) {
          target.src = defaultImage;
        }
      }}
    />
  );
};

export default function ApartmentPayment() {
  const navigate = useNavigate();

  // Get booking ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const bookingIdParam = urlParams.get('bookingId');
  const bookingId = bookingIdParam ? parseInt(bookingIdParam) : 0;
  // Fetch booking details using the booking ID
  const { data: bookingData, isLoading: _bookingLoading } =
    useBooking(bookingId);

  // Fetch apartment data based on booking
  const { data: apartmentData, isLoading: _apartmentLoading } =
    APT.useApartment(bookingData?.apartment_id || 0);

  // Fetch all rooms for the apartment, then filter for the specific room
  const { data: allRoomsData, isLoading: _roomLoading } = Room.useRooms(
    bookingData?.apartment_id || 0
  );

  // Filter to get the specific room from the booking
  const roomData = allRoomsData?.find(
    (room: roomTypes.Room) => room.id === bookingData?.room_id
  );

  // Fetch average rating for the apartment
  const { data: averageRatingData } = Rating.useAverageRating(
    bookingData?.apartment_id || 0
  );

  // Fetch user wallet data
  // Using booking user ID or fallback to default user for demo
  const userId = bookingData?.user_id || 1;

  const { data: walletResponse, isLoading: _walletLoading } =
    useGetWalletsUserUserId(userId);
  const walletData = walletResponse?.data;

  // Hook for updating booking status
  const updateBookingStatusMutation = useUpdateBookingStatus();

  const [price, setPrice] = useState<number | null>(null);
  const [apartment, setApartment] = useState<apartmentTypes.Apartment | null>(
    null
  );
  const [showPopup, setShowPopup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!bookingData) return;

    // Use actual room price from API data
    const roomPrice = roomData?.price_start || roomData?.price_end || 0;
    setPrice(roomPrice);

    // Set apartment data from API data
    if (apartmentData) {
      setApartment(apartmentData);
    }
  }, [bookingData, apartmentData, roomData]);

  const handleBooking = () => {
    (async () => {
      const balance = walletData?.data?.wallet?.balance || 0;

      if (!price || !bookingData) {
        alert('Missing required booking information');
        return;
      }

      if (!bookingData?.user_id) {
        alert('Missing user ID in booking data');
        return;
      }

      // Check if booking is already confirmed
      if (bookingData.booking_status === 'confirmed') {
        alert('This booking is already confirmed');
        return;
      }

      if (balance < price) {
        alert('Insufficient balance');
        return;
      }

      setIsProcessing(true);

      try {
        // Transfer money from user to apartment owner
        const apartmentOwnerId = 4; //  placeholder

        const response = await postWalletsTransfer({
          from_user_id: bookingData.user_id,
          to_user_id: apartmentOwnerId,
          amount: price,
        });

        if (response.status === 200) {
          try {
            await updateBookingStatusMutation.mutateAsync({
              id: bookingData.id,
              status: 'confirmed',
            });
            setShowPopup(true);
          } catch (_statusErr) {
            // Try direct API call as fallback
            try {
              await BOOKapi.updateBookingStatus(bookingData.id, 'confirmed');
              setShowPopup(true);
            } catch (_directErr) {
              alert(
                'Payment successful, but booking status update failed. Please contact support.'
              );
              // Refund the payment
              await postWalletsTransfer({
                from_user_id: apartmentOwnerId,
                to_user_id: bookingData.user_id,
                amount: price,
              });
            }
          }
          setShowPopup(true);
        } else {
          throw new Error('Payment failed with status: ' + response.status);
        }
      } catch (_err) {
        alert('Payment failed — check your wallet or try again.');
      } finally {
        setIsProcessing(false);
      }
    })();
  };
  const handleViewBooking = () => {
    setShowPopup(false);
    window.location.href = '/MyRentedAPT';
  };

  return (
    <div className="animate-fade-in relative flex min-h-screen flex-col items-center bg-[#F9FAFB] px-4 py-10">
      <div className="animate-slide-down mb-6 w-full max-w-5xl">
        <div className="mb-6 flex w-full max-w-5xl items-center gap-3">
          <button
            onClick={() => {
              if (bookingData?.apartment_id) {
                window.location.href = `/ApartmentBooking?apartmentId=${bookingData.apartment_id}`;
              } else {
                navigate('/ApartmentBooking');
              }
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full transition duration-200 hover:bg-gray-100"
          >
            <img src={BackIcon} alt="Back" className="h-7 w-7" />
          </button>
          <h1 className="text-[48px] font-bold text-gray-900">Room Booking</h1>
        </div>

        <div className="mb-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-[#D9D9D9] font-semibold text-[#8C8C8C]">
              1
            </div>
            <span className="text-[16px] font-medium text-[#8C8C8C]">
              Details
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#01CEF8] font-semibold text-white">
              2
            </div>
            <span className="text-[16px] font-medium text-[#2B5991]">
              Payment
            </span>
          </div>
        </div>
      </div>

      <div className="animate-slide-up w-full max-w-5xl rounded-2xl border border-gray-100 bg-white p-10 shadow-sm">
        <div className="mb-8">
          <div className="mb-3 flex items-center space-x-2">
            <img src={EWalletIcon} alt="EWalletIcon" className="h-10 w-10" />
            <h2 className="text-[24px] font-semibold text-gray-800">
              E-Wallet
            </h2>
          </div>
          <hr className="mb-4 border-gray-300" />

          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
            <span className="text-[16px] font-medium text-gray-500">
              Available balance
            </span>
            <span className="text-[20px] font-semibold text-gray-900">
              {walletData?.data?.wallet?.balance ? (
                walletData.data.wallet.balance.toLocaleString()
              ) : (
                <div className="shimmer-skeleton h-6 w-20 rounded"></div>
              )}
            </span>
          </div>
        </div>

        {apartment ? (
          <div className="animate-fade-in-up mb-8 flex flex-col gap-6 rounded-xl border border-gray-200 p-8 md:flex-row">
            <ApartmentImage apartment_id={apartment.id} name={apartment.name} />
            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <h3 className="text-[28px] font-semibold text-gray-900">
                  {apartment.name}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-[16px] font-medium text-gray-700">
                    {averageRatingData?.average
                      ? averageRatingData.average.toFixed(1)
                      : 'N/A'}
                  </p>

                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill={
                          i < Math.floor(averageRatingData?.average || 0)
                            ? '#facc15'
                            : '#d1d5db'
                        }
                        className="h-5 w-5"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.18 3.63a1 1 0 00.95.69h3.813c.969 0 1.372 1.24.588 1.81l-3.087 2.24a1 1 0 00-.364 1.118l1.18 3.63c.3.921-.755 1.688-1.54 1.118l-3.087-2.24a1 1 0 00-1.176 0l-3.087 2.24c-.785.57-1.84-.197-1.54-1.118l1.18-3.63a1 1 0 00-.364-1.118L2.518 9.057c-.784-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.18-3.63z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div className="mt-2 flex items-center text-[16px] text-gray-600">
                  <img
                    src={LocationIcon}
                    alt="Location"
                    className="mr-1 h-6 w-6"
                  />
                  <p>
                    {apartment.addresses
                      ? `${apartment.addresses.address_line || ''}, ${apartment.addresses.subdistrict || ''}, ${apartment.addresses.district || ''}, ${apartment.addresses.province || ''} ${apartment.addresses.postal_code || ''}`
                          .replace(/,\s*,/g, ',')
                          .replace(/^,\s*|,\s*$/g, '')
                      : 'Address not available'}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="text-[16px] text-gray-500">
                    <p className="text-[16px] font-medium text-gray-900">
                      {' '}
                      Room Type : {roomData?.type}
                    </p>
                    <p>Size : {roomData?.size}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-gray-500">
            Loading apartment details...
          </p>
        )}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-64 rounded-xl border border-gray-200 bg-gray-50 px-6 py-4">
            <p className="text-[20px] font-semibold text-gray-900">Price</p>
            <p className="text-[20px] text-gray-600">
              {price ? `${price.toLocaleString()} THB` : 'Loading...'}
            </p>
          </div>

          <button
            disabled={
              !price || !walletData?.data?.wallet?.balance || isProcessing
            }
            onClick={handleBooking}
            className={`rounded-lg bg-[#01CEF8] px-24 py-4 text-[20px] font-medium text-white transition-all duration-300 hover:bg-[#4E8FB1] disabled:cursor-not-allowed disabled:opacity-50 ${
              isProcessing ? 'animate-pulse' : 'animate-bounce-subtle'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Processing...
              </div>
            ) : (
              'Book now !'
            )}
          </button>
        </div>
      </div>

      {showPopup && <BookingComplete onViewBooking={handleViewBooking} />}
    </div>
  );
}
