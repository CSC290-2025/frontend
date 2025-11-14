import { useEffect, useState } from 'react';
import { useNavigate } from '@/router';
import BookingComplete from '@/features/G9-ApartmentListing/components/BookingComplete';
import LocationIcon from '@/features/G9-ApartmentListing/assets/LocationIcon.svg';
import BackIcon from '@/features/G9-ApartmentListing/assets/BackIcon.svg';
import EWalletIcon from '@/features/G9-ApartmentListing/assets/EWalletIcon.svg';

interface Apartment {
  name: string;
  rating: number;
  address: string;
  room: string;
  size: string;
  imageMain: string;
}

export default function ApartmentPayment() {
  const bookingData = localStorage.getItem('bookingData');
  const roomType = bookingData ? JSON.parse(bookingData).roomType : 'Studio';
  const navigate = useNavigate();

  const [balance, setBalance] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setBalance(12000);

      const priceMap: Record<string, number> = {
        Single: 3200,
        Double: 4100,
        Studio: 4900,
      };
      setPrice(priceMap[roomType] || 4900);

      setApartment({
        name: 'Cosmo mansion',
        rating: 4.0,
        address: 'Pracha Uthit road, Bangmod, Thungkru, Bangkok',
        room: roomType,
        size: '24 sq.m.',
        imageMain:
          'https://bcdn.renthub.in.th/listing_picture/201603/20160323/KFVR1t5u5w6KhpFVDWLY.jpg?class=moptimized',
      });
    }, 800);
  }, [roomType]);

  const handleBooking = () => {
    setShowPopup(true);
  };

  const handleViewBooking = () => {
    setShowPopup(false);
    window.location.href = '/MyRentedAPT';
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-[#F9FAFB] px-4 py-10">
      <div className="mb-6 w-full max-w-5xl">
        <div className="mb-6 flex w-full max-w-5xl items-center gap-3">
          <button
            onClick={() => navigate('/ApartmentBooking')}
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

      <div className="w-full max-w-5xl rounded-2xl border border-gray-100 bg-white p-10 shadow-sm">
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
              {balance ? balance.toLocaleString() : 'Loading...'}
            </span>
          </div>
        </div>

        {apartment ? (
          <div className="mb-8 flex flex-col gap-6 rounded-xl border border-gray-200 p-8 md:flex-row">
            <img
              src={apartment.imageMain}
              alt="apartment"
              className="w-full object-cover md:w-64"
            />
            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <h3 className="text-[28px] font-semibold text-gray-900">
                  {apartment.name}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-[16px] font-medium text-gray-700">
                    {apartment.rating ? apartment.rating.toFixed(1) : 'N/A'}
                  </p>

                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill={
                          i < Math.floor(apartment.rating)
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
                  <p>{apartment.address}</p>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="text-[16px] text-gray-500">
                    <p className="text-[16px] font-medium text-gray-900">
                      {' '}
                      Room Type : {apartment.room}
                    </p>
                    <p>Size : {apartment.size}</p>
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
            disabled={!price || !balance}
            onClick={handleBooking}
            className="rounded-lg bg-[#01CEF8] px-24 py-4 text-[20px] font-medium text-white hover:bg-[#4E8FB1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Book now !
          </button>
        </div>
      </div>

      {showPopup && <BookingComplete onViewBooking={handleViewBooking} />}
    </div>
  );
}
