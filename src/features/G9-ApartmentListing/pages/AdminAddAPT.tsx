export default function AdminAddAPT() {
  return (
    <main className="">
      <h1 className="text-3xl font-bold">This is a homepageeeeeeeee </h1>
      <h2>รวมไว้เพราะขี้เกียจพิม</h2>
      <p className="mt-2">
        <div className="mb-1">
          <span className="mr-2 font-bold text-blue-600">Home</span>
          <a
            href="/apartmenthomepage"
            className="text-gray-600 hover:text-blue-600 hover:underline"
          >
            HERE
          </a>
        </div>
        <div className="mb-1">
          <span className="mr-2 font-bold text-blue-600">Booking</span>
          <a
            href="/apartmentbooking"
            className="text-gray-600 hover:text-blue-600 hover:underline"
          >
            HERE
          </a>
        </div>
        <div className="mb-1">
          <span className="mr-2 font-bold text-blue-600">Payment</span>
          <a
            href="/apartmentpayment"
            className="text-gray-600 hover:text-blue-600 hover:underline"
          >
            HERE
          </a>
        </div>
        <div className="mb-1">
          <span className="mr-2 font-bold text-blue-600">Details</span>
          <a
            href="/apartmentdetails"
            className="text-gray-600 hover:text-blue-600 hover:underline"
          >
            HERE
          </a>
        </div>
      </p>
      {/* you can showcase parts of the feature here*/}
    </main>
  );
}
