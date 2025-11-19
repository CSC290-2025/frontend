import BackIcon from '@/features/G9-ApartmentListing/assets/BackIcon.svg';
import Vineboom from '@/features/G9-ApartmentListing/assets/Vineboom.svg';
import { useBookingsByUser } from '@/features/G9-ApartmentListing/hooks/useBooking';
import { useApartment } from '@/features/G9-ApartmentListing/hooks/useApartment';
import { usePicturesByApartment } from '@/features/G9-ApartmentListing/hooks/useUpload';
import type { bookingTypes } from '@/features/G9-ApartmentListing/types/index';

// Component to display individual booking with room and apartment details
function BookingCard({ booking }: { booking: bookingTypes.Booking }) {
  const { data: apartment } = useApartment(booking.apartment_id);
  const { data: images } = usePicturesByApartment(booking.apartment_id);

  const getStatusColor = (status: bookingTypes.BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-gray-300';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: bookingTypes.BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'PENDING';
      case 'confirmed':
        return 'CONFIRMED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return 'UNKNOWN';
    }
  };

  // Default image if no apartment data
  const defaultImage =
    'https://bcdn.renthub.in.th/listing_picture/201603/20160323/KFVR1t5u5w6KhpFVDWLY.jpg?class=moptimized';

  // Get apartment image from apartment_picture table
  const imageArray = images?.data?.data || images?.data || [];
  const apartmentImage =
    imageArray && imageArray.length > 0
      ? imageArray[0].file_path
      : defaultImage;

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-8 shadow-md transition hover:shadow-lg md:flex-row">
      <img
        src={apartmentImage}
        alt={apartment?.name || 'Apartment'}
        className="h-48 w-full rounded-xl object-cover md:w-64"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== defaultImage) {
            target.src = defaultImage;
          }
        }}
      />

      <div className="mt-4 flex flex-1 flex-col justify-between md:mt-0 md:ml-6">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[24px] font-bold text-gray-800">
                {apartment?.name}
              </h3>
              <p className="mt-1 text-[16px] text-gray-700">
                {booking.guest_name && (
                  <>
                    {booking.guest_name}
                    <br />
                  </>
                )}
                {booking.guest_email && (
                  <>
                    {booking.guest_email}
                    <br />
                  </>
                )}
                {booking.guest_phone}
              </p>
              <p className="mt-2 text-[16px] font-medium text-gray-700">
                Room Type: {booking.room_type}
              </p>
              {booking.check_in && (
                <p className="mt-1 text-[14px] text-gray-600">
                  Check-in: {new Date(booking.check_in).toLocaleDateString()}
                </p>
              )}
            </div>

            <div>
              <div
                className={`rounded-md border px-4 py-1 text-[16px] font-medium ${getStatusColor(booking.booking_status)}`}
              >
                {getStatusText(booking.booking_status)}
              </div>
            </div>
          </div>
        </div>

        {booking.booking_status === 'pending' && (
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
  );
}

export default function MyRentedAPT() {
  const currentUserId = 3;

  const { data: bookings, isLoading, error } = useBookingsByUser(currentUserId);

  if (isLoading) {
    return (
      <div className="font-poppins flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB]">
        <div className="text-xl text-gray-600">Loading your bookings...</div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading bookings:', error);
  }

  const realBookings = bookings?.data?.data || [];
  const hasBookings = realBookings.length > 0;

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
        {hasBookings ? (
          realBookings.map((booking: bookingTypes.Booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        ) : (
          <div className="py-12 text-center">
            <h3 className="mb-2 text-xl font-medium text-gray-600">
              No Bookings
            </h3>
            <p className="text-gray-500">You have no apartment bookings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
