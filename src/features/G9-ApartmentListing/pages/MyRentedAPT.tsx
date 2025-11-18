import { useEffect, useState } from 'react';
import BackIcon from '@/features/G9-ApartmentListing/assets/BackIcon.svg';
import Vineboom from '@/features/G9-ApartmentListing/assets/Vineboom.svg';

interface RentedApartment {
  id: number;
  name: string;
  tenantName: string;
  email: string;
  phone: string;
  roomType: string;
  status: 'pending' | 'current';
  image: string;
}

export default function MyRentedAPT() {
  const [apartments, setApartments] = useState<RentedApartment[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('bookingData');

    if (saved) {
      const data = JSON.parse(saved);

      const rented: RentedApartment[] = [
        {
          id: 1,
          name: 'Cosmo Mansion',
          tenantName: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          roomType: data.roomType,
          status: 'pending',
          image:
            'https://bcdn.renthub.in.th/listing_picture/201603/20160323/KFVR1t5u5w6KhpFVDWLY.jpg?class=moptimized',
        },
      ];

      setApartments(rented);
    }
  }, []);

  return (
    <div className="font-poppins flex min-h-screen flex-col items-center bg-[#F9FAFB] px-4 py-10">
      <div className="mb-6 flex w-full max-w-5xl items-center gap-3">
        <a
          href="/ApartmentHomepage"
          className="flex h-10 w-10 items-center justify-center rounded-full transition duration-200 hover:bg-gray-100"
        >
          <img src={BackIcon} alt="Back" className="h-7 w-7" />
        </a>
        <h1 className="text-[48px] font-bold text-gray-900">
          My Rented Apartments
        </h1>
      </div>

      <div className="w-full max-w-5xl space-y-6">
        {apartments.map((apt) => (
          <div
            key={apt.id}
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-8 shadow-md transition hover:shadow-lg md:flex-row"
          >
            <img
              src={apt.image}
              alt={apt.name}
              className="h-48 w-full rounded-xl object-cover md:w-64"
            />

            <div className="mt-4 flex flex-1 flex-col justify-between md:mt-0 md:ml-6">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[24px] font-bold text-gray-800">
                      {apt.name}
                    </h3>
                    <p className="mt-1 text-[18px] text-gray-700">
                      {apt.tenantName}
                      <br />
                      {apt.email}
                      <br />
                      {apt.phone}
                    </p>
                    <p className="mt-2 text-[18px] font-medium text-gray-700">
                      Room Type: {apt.roomType}
                    </p>
                  </div>

                  <div>
                    {apt.status === 'pending' ? (
                      <div className="rounded-md border border-gray-300 bg-yellow-100 px-4 py-1 text-[16px] font-medium text-yellow-800">
                        PENDING
                      </div>
                    ) : (
                      <div className="rounded-md border border-gray-300 bg-green-100 px-4 py-1 text-[16px] font-medium text-green-800">
                        CURRENTLY RENTING
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {apt.status === 'pending' && (
                <div className="flex flex-col items-end">
                  <a
                    href="/ApartmentPayment"
                    className="rounded-md bg-[#01CEF8] px-7 py-2 text-[16px] font-medium text-white transition hover:bg-[#4E8FB1]"
                  >
                    Pay Now
                  </a>
                  <div className="mt-2 flex items-center text-[14px] font-medium text-red-600">
                    <img src={Vineboom} alt="Alert" className="mr-2 h-5 w-5" />
                    <span>
                      Payment pending. Your rental will be cancelled in 3 days.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
