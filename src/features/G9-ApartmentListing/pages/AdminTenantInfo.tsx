import { useState } from 'react';
// import { useNavigate } from '@/router';
import {
  useBookingsByApartment,
  useUpdateBookingStatus,
} from '@/features/G9-ApartmentListing/hooks/useBooking';
import type { bookingTypes } from '@/features/G9-ApartmentListing/types/index';
import EditIcon from '@/features/G9-ApartmentListing/assets/EditIcon.svg';
import BackIcon from '@/features/G9-ApartmentListing/assets/BackIcon.svg';
import ConfirmEndContract from '@/features/G9-ApartmentListing/components/ConfirmEndcontract';
import SuccessModal from '@/features/G9-ApartmentListing/components/SuccessModal';

interface Tenant {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  roomType: string;
  checkin: string;
}

export default function AdminTenantInfo() {
  // const navigate = useNavigate();
  const apartmentName = 'Current Tenants';
  // Read apartment id from query param (AdminListedAPT links here as ?id=...)
  const params = new URLSearchParams(window.location.search);
  const apartmentId = Number(params.get('id') || 0);

  // Use existing hooks to fetch bookings for this apartment
  const {
    data: bookingsResp,
    isLoading,
    error,
  } = useBookingsByApartment(apartmentId);
  // Mutation hook to update booking status (end contract)
  const updateBookingStatus = useUpdateBookingStatus();

  const [showPopup, setShowPopup] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);

  if (isLoading) {
    return (
      <div className="font-poppins flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB]">
        <div className="text-xl text-gray-600">Loading tenants...</div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading bookings for apartment:', error);
  }

  // Map booking API shape to local Tenant shape
  const formatDate = (s?: string) => {
    if (!s) return '';
    try {
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) return s;
      return d.toISOString().slice(0, 10); // YYYY-MM-DD
    } catch {
      return s;
    }
  };

  const tenants: Tenant[] = (bookingsResp?.data?.data || []).map(
    (b: bookingTypes.Booking) => {
      const guest = b.guest_name || '';
      const [firstName, ...rest] = guest.split(' ');
      const lastName = rest.join(' ');

      return {
        id: b.id,
        firstName: firstName || '',
        lastName: lastName || '',
        phone: b.guest_phone || '',
        email: b.guest_email || '',
        roomType: b.room_type || '',
        checkin: formatDate(b.check_in),
      } as Tenant;
    }
  );

  const handleEndContractClick = (id: number) => {
    setSelectedId(id);
    setShowPopup(true);
  };

  const confirmEndContract = () => {
    if (selectedId !== null) {
      // Call backend to mark booking as cancelled
      updateBookingStatus.mutate(
        { id: selectedId, status: 'cancelled' },
        {
          onSuccess: () => {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
          },
          onError: (err) => {
            console.error('Failed to end contract', err);
          },
        }
      );
    }

    setShowPopup(false);
  };

  return (
    <div className="font-poppins flex min-h-screen flex-col items-center bg-[#F9FAFB] px-4 py-10">
      <div className="mb-6 flex w-full max-w-5xl items-center gap-3">
        <a
          href="/AdminListedAPT"
          className="flex h-10 w-10 items-center justify-center rounded-full transition duration-200 hover:bg-gray-100"
        >
          <img src={BackIcon} alt="Back" className="h-7 w-7" />
        </a>

        <h1 className="text-[48px] font-bold text-gray-900">
          Tenant Information
        </h1>
      </div>

      <div className="mb-6 flex w-full max-w-5xl items-center justify-between">
        <h2 className="text-[24px] font-semibold text-gray-800">
          {apartmentName}
        </h2>
      </div>

      <div className="w-full max-w-5xl space-y-6">
        {tenants.length > 0 ? (
          tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="flex cursor-default flex-col items-center rounded-xl border border-gray-200 bg-white p-5 shadow-md transition hover:shadow-lg md:flex-row md:items-start"
            >
              <div className="mt-4 flex-1 md:mt-0 md:ml-6">
                <h3 className="text-[18px] font-semibold text-gray-800">
                  {tenant.firstName} {tenant.lastName}
                </h3>
                <p className="mt-1 text-[18px] text-gray-600">{tenant.phone}</p>
                <p className="text-[18px] text-gray-600">{tenant.email}</p>
                <p className="text-[18px] text-gray-700">
                  Check-in:{' '}
                  <span className="font-medium">{tenant.checkin}</span>
                </p>
              </div>

              <div
                className="mt-4 flex flex-col items-end gap-20 md:mt-0 md:ml-4"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() =>
                    (window.location.href = `/AdminEditTenant?id=${tenant.id}`)
                  }
                  className="flex cursor-pointer items-center justify-center gap-2 px-3 py-2 font-medium text-gray-700"
                >
                  <img src={EditIcon} alt="Edit" className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleEndContractClick(tenant.id)}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-2 font-medium text-[#2B5991] hover:bg-gray-200"
                >
                  End Contract
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <h3 className="mb-2 text-xl font-medium text-gray-600">
              No tenant
            </h3>
            <p className="text-gray-500">This apartment has no tenants.</p>
          </div>
        )}
      </div>

      {showPopup && (
        <ConfirmEndContract
          message="End this tenant's contract?"
          onConfirm={confirmEndContract}
          onCancel={() => setShowPopup(false)}
        />
      )}

      {showSuccess && <SuccessModal message="Contract Ended Successfully" />}
    </div>
  );
}
