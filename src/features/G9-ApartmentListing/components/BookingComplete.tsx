interface BookingCompleteProps {
  onViewBooking: () => void;
}

export default function BookingComplete({
  onViewBooking,
}: BookingCompleteProps) {
  return (
    <div className="bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-80 rounded-2xl bg-white p-8 text-center shadow-lg">
        <h2>เดี๋ยวมาใส่ไอคอน I will put an icon later</h2>
        <h3 className="mb-2 text-lg font-semibold">
          Your booking is completed!
        </h3>
        <button
          onClick={onViewBooking}
          className="mt-2 w-full rounded-lg bg-[#01CEF8] px-5 py-2 font-medium text-white hover:bg-[#4E8FB1]"
        >
          view my booking
        </button>
      </div>
    </div>
  );
}
