import React, { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import BookingComplete from '../components/BookingComplete';

export default function ApartmentPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomType } = location.state || {};

  const [balance, setBalance] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [apartment, setApartment] = useState<any>(null);
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
        room: roomType || 'Studio',
        size: '24 sq.m.',
        imageMain:
          'https://bcdn.renthub.in.th/listing_picture/201603/20160323/KFVR1t5u5w6KhpFVDWLY.jpg?class=moptimized',
        imageRoom:
          'https://bcdn.renthub.in.th/listing_picture/201603/20160323/1R7yAJrTsykhCCKuNVRW.jpg?class=moptimized',
      });
    }, 800);
  }, [roomType]);

  const handleBooking = () => {
    setShowPopup(true);
  };

  const handleViewBooking = () => {
    setShowPopup(false);
    navigate('/MyRentedAPT');
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-10">
      <div className="mb-6 w-full max-w-5xl">
        <h1 className="mb-6 text-4xl font-bold">Room Booking</h1>

        <div className="mb-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 font-semibold text-gray-400">
              1
            </div>
            <span className="font-medium text-gray-400">Details</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#01CEF8] font-semibold text-white">
              2
            </div>
            <span className="font-medium text-[#2B5991]">Payment</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl rounded-2xl border border-gray-100 bg-white p-10 shadow-sm">
        <div className="mb-8">
          <div className="mb-3 flex items-center space-x-2">
            <Wallet className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">E-Wallet</h2>
          </div>
          <hr className="mb-4 border-gray-200" />

          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
            <span className="font-medium text-gray-500">Available balance</span>
            <span className="text-xl font-semibold text-gray-900">
              {balance ? balance.toLocaleString() : 'Loading...'}
            </span>
          </div>
        </div>

        {apartment ? (
          <div className="mb-8 flex flex-col gap-6 rounded-xl border border-gray-200 p-4 md:flex-row">
            <img
              src={apartment.imageMain}
              alt="apartment"
              className="h-40 w-full rounded-lg object-cover md:w-64"
            />
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="mb-1 text-xl font-semibold text-gray-900">
                  {apartment.name}
                </h3>
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={apartment.imageRoom}
                    alt="room"
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{apartment.room}</p>
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
        {/* แปะรีวิวกับที่อยู่ไว้ก่อนเดียวมาทำต่อ i will do a review and location later */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-64 rounded-xl border border-gray-200 bg-gray-50 px-6 py-4">
            <p className="font-semibold text-gray-900">Price</p>
            <p className="text-lg text-gray-600">
              {price ? `${price.toLocaleString()} THB` : 'Loading...'}
            </p>
          </div>

          <button
            disabled={!price || !balance}
            onClick={handleBooking}
            className="rounded-lg bg-[#01CEF8] px-10 py-2 font-medium text-white hover:bg-[#4E8FB1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Book now !
          </button>
        </div>
      </div>

      {showPopup && <BookingComplete onViewBooking={handleViewBooking} />}
    </div>
  );
}
