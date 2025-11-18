import CompleteIcon from '@/features/G9-ApartmentListing/assets/CompleteIcon.svg';
interface BookingCompleteProps {
  onViewBooking: () => void;
}

export default function BookingComplete({
  onViewBooking,
}: BookingCompleteProps) {
  return (
    <div className="font-poppins bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-100 rounded-2xl bg-white p-8 text-center shadow-lg">
        <img
          src={CompleteIcon}
          alt="CompleteIcon"
          className="mx-auto mb-5 h-24 w-24"
        />
        <h3 className="mb-2 text-[20px] font-medium">
          Your booking is completed!
        </h3>
        <button
          onClick={onViewBooking}
          className="mt-4 w-full rounded-lg bg-[#01CEF8] px-5 py-2 text-[20px] font-semibold text-white hover:bg-[#4E8FB1]"
        >
          view my booking
        </button>
      </div>
    </div>
  );
}
