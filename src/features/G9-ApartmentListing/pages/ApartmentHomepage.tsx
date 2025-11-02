import React from 'react';

export default function ApartmentHomepage() {
  return (
    <main className="">
      <h1 className="text-3xl font-bold">This is a homepageeeeeeeee </h1>
      <h2>รวมไว้เพราะขี้เกียจพิม i just lazy to type a web path :( </h2>
      <p className="mt-2">
        <div className="mb-1">
          <span className="mr-2 font-bold text-[#01CEF8]">Home</span>
          <a
            href="/apartmenthomepage"
            className="text-gray-600 hover:text-[#4E8FB1] hover:underline"
          >
            HERE
          </a>
        </div>
        <div className="mb-1">
          <span className="mr-2 font-bold text-[#01CEF8]">Booking</span>
          <a
            href="/apartmentbooking"
            className="text-gray-600 hover:text-[#4E8FB1] hover:underline"
          >
            HERE
          </a>
        </div>
        <div className="mb-1">
          <span className="mr-2 font-bold text-[#01CEF8]">Payment</span>
          <a
            href="/apartmentpayment"
            className="text-gray-600 hover:text-[#4E8FB1] hover:underline"
          >
            HERE
          </a>
        </div>
        {/* <div className="mb-1">
          <span className="mr-2 font-bold text-[#01CEF8]">Details</span>
          <a
            href="/apartmentdetails"
            className="text-gray-600 hover:text-[#4E8FB1] hover:underline"
          >
            HERE
          </a>
        </div> */}
      </p>
    </main>
  );
}
