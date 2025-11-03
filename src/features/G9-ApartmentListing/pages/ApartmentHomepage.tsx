import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import userIcon from '../../../assets/userIcon.svg';
import apartmentIcon from '../../../assets/apartmentIcon.svg';
import searchIcon from '../../../assets/searchIcon.svg';
import uppage from '../../../assets/uppage.svg';

interface Apartment {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  rooms: number;
  location: string;
  address: string;
  phone: string;
  image: string;
}

export default function ApartmentHomepage() {
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 2;

  const apartments: Apartment[] = [
    {
      id: 1,
      name: "Cosmo Mansion",
      rating: 4.0,
      reviews: 8,
      price: 4600,
      rooms: 3,
      location: "Prachautit",
      address: "Pracha Uthit road, Bangmod, Thungkru, Bangkok",
      phone: "0XXXXXXXXX",
      image: "https://bcdn.renthub.in.th/listing_picture/201603/20160323/KFVR1t5u5w6KhpFVDWLY.jpg?class=moptimized"
    },
    {
      id: 2,
      name: "19/3 Resident",
      rating: 5.0,
      reviews: 30,
      price: 7000,
      rooms: 3,
      location: "Prachautit",
      address: "Phutthabucha road, Bangmod, Thungkru, Bangkok",
      phone: "0XXXXXXXXX",
      image: "https://bcdn.renthub.in.th/listing_picture/201809/20180902/F2fJpr4Vz3CKeAVwV5ZD.jpg?class=doptimized"
    },
    {
      id: 3,
      name: "The Asoke Tower",
      rating: 4.5,
      reviews: 45,
      price: 12000,
      rooms: 5,
      location: "Asoke",
      address: "Sukhumvit 21 (Asoke), Khlong Toei Nuea, Watthana, Bangkok",
      phone: "02-XXX-XXXX",
      image: "https://bcdn.renthub.in.th/listing_picture/201809/20180902/F2fJpr4Vz3CKeAVwV5ZD.jpg?class=doptimized"
    },
    {
      id: 4,
      name: "Asoke Place",
      rating: 3.8,
      reviews: 22,
      price: 9500,
      rooms: 2,
      location: "Asoke",
      address: "Sukhumvit road, Asoke, Khlong Toei, Bangkok",
      phone: "02-XXX-XXXX",
      image: "https://bcdn.renthub.in.th/listing_picture/201603/20160323/KFVR1t5u5w6KhpFVDWLY.jpg?class=moptimized"
    },
    {
      id: 5,
      name: "Pathumwan Residence",
      rating: 4.2,
      reviews: 38,
      price: 8500,
      rooms: 4,
      location: "Phathumwan",
      address: "Phayathai road, Pathumwan, Bangkok",
      phone: "02-XXX-XXXX",
      image: "https://bcdn.renthub.in.th/listing_picture/201809/20180902/F2fJpr4Vz3CKeAVwV5ZD.jpg?class=doptimized"
    },
    {
      id: 6,
      name: "Siam Garden Apartment",
      rating: 4.7,
      reviews: 52,
      price: 11000,
      rooms: 3,
      location: "Phathumwan",
      address: "Rama 1 road, Pathumwan, Bangkok",
      phone: "02-XXX-XXXX",
      image: "https://bcdn.renthub.in.th/listing_picture/201603/20160323/KFVR1t5u5w6KhpFVDWLY.jpg?class=moptimized"
    }
  ];

  // Filter apartments based on selected criteria
  const filteredApartments = apartments.filter((apt) => {
    // Location filter
    if (selectedLocations.length > 0 && !selectedLocations.includes(apt.location)) {
      return false;
    }

    // Rating filter
    if (selectedRatings.length > 0) {
      const matchesRating = selectedRatings.some(rating => {
        const floorRating = Math.floor(apt.rating);
        return floorRating === rating;
      });
      if (!matchesRating) return false;
    }

    // Price filter
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;
    if (apt.price < min || apt.price > max) {
      return false;
    }

    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredApartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApartments = filteredApartments.slice(startIndex, endIndex);

  // Handle filter changes
  const handleLocationChange = (location: string) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
    setCurrentPage(1);
  };

  const handleRatingChange = (rating: number) => {
    setSelectedRatings(prev =>
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-poppins">
      {/* Header */}
      <div className="px-12 py-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <img
              className="w-12 h-12"
              src={apartmentIcon}
              alt="apartmentIcon"
            />
            <h1 className="text-[40px] font-bold text-[#2B5991]">Apartment Hub</h1>
          </div>
          <p className="text-sm text-[#8E8E8E] mt-2">
            Looking for a new place? Find your next apartment right here
          </p>
        </div>
        
        <div className="relative w-80">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <img
              className="w-5 h-5"
              src={searchIcon}
              alt="searchIcon"
            />
          </span>
          <input
            type="text"
            placeholder="Search here"
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-[16px] focus:outline-none focus:border-[#2B5991]"
          />
        </div>
        
        <img
          className="cursor-pointer w-16 h-16"
          src={userIcon}
          alt="userIcon"
        />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-10 py-1">
        {/* Filters Container */}
        <div className="flex gap-8 mb-5">
          {/* Location */}
          <div className="flex-1 bg-white rounded-xl shadow p-8">
            <h3 className="text-[#2B5991] text-xl font-semibold mb-4">Location</h3>
            <div className="space-y-3 text-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-blue-600"
                  checked={selectedLocations.includes("Asoke")}
                  onChange={() => handleLocationChange("Asoke")}
                />
                <span>Asoke</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-blue-600"
                  checked={selectedLocations.includes("Prachautit")}
                  onChange={() => handleLocationChange("Prachautit")}
                />
                <span>Prachautit</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-blue-600"
                  checked={selectedLocations.includes("Phathumwan")}
                  onChange={() => handleLocationChange("Phathumwan")}
                />
                <span>Phathumwan</span>
              </label>
            </div>
          </div>

          {/* Rating */}
          <div className="flex-1 bg-white rounded-xl shadow p-8">
            <h3 className="text-[#2B5991] text-xl font-semibold mb-4">Rating</h3>
            <div className="grid grid-cols-2 gap-y-3 text-lg">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label key={rating} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-blue-600"
                    checked={selectedRatings.includes(rating)}
                    onChange={() => handleRatingChange(rating)}
                  />
                  <span>{rating}</span>
                  <span className="text-yellow-400 text-xl">★</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="flex-1 bg-white rounded-xl shadow p-8">
            <h3 className="text-[#2B5991] text-xl font-semibold mb-6 text-center">
              Price Range
            </h3>

            {/* slider. not done yet */}
            <div className="relative mb-6">
              <div className="h-2 bg-gray-200 rounded-lg">
                <div className="absolute left-1/4 right-1/4 h-2 bg-blue-600 rounded-lg"></div>
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow"></div>
                <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow"></div>
              </div>
            </div>

            {/* min-max price */}
            <div className="flex items-center justify-center gap-3">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-32 px-4 py-2 border-2 border-gray-200 rounded-lg text-center text-blue-700 font-medium"
              />
              <span className="text-gray-500 text-xl">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-32 px-4 py-2 border-2 border-gray-200 rounded-lg text-center text-blue-700 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-gray-500 text-sm mb-5">{filteredApartments.length} Listing found</p>

        {/* Apartment Cards */}
        <div className="space-y-5">
          {currentApartments.map((apartment) => (
            <NavLink
              key={apartment.id}
              to={`/apartment/${apartment.id}`}
              className="bg-white rounded-lg shadow-sm p-6 flex gap-6 hover:shadow-md transition-shadow block"
            >
              <img
                src={apartment.image}
                alt={apartment.name}
                className="w-52 h-36 rounded-lg object-cover"
              />

              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {apartment.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-blue-600 font-bold">
                        {apartment.rating.toFixed(1)}
                      </span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < Math.floor(apartment.rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-gray-600 text-sm">
                        ({apartment.reviews})
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-800">
                      {apartment.price.toLocaleString()}{" "}
                      <span className="text-sm font-normal text-gray-600">
                        Baht / Month
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Room available: {apartment.rooms}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-gray-600 text-sm mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-800">📍</span>
                    <span>{apartment.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-800">📞</span>
                    <span>{apartment.phone}</span>
                  </div>
                </div>
              </div>
            </NavLink>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex justify-center items-center gap-3 mt-10">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 h-10 rounded-full flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              ‹ prev
            </button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              
              // show prev next last
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                      currentPage === pageNum
                        ? 'bg-[#01CCFF] text-white border-cyan-400'
                        : 'border-gray-300 bg-white hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              
              // แสดง ellipsis
              if (
                (pageNum === currentPage - 2 && currentPage > 3) ||
                (pageNum === currentPage + 2 && currentPage < totalPages - 2)
              ) {
                return (
                  <span
                    key={pageNum}
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                  >
                    ...
                  </span>
                );
              }
              
              return null;
            })}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 h-10 rounded-full flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              next ›
            </button>

            {/* Last Button */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-4 h-10 rounded-full flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              last ››
            </button>
          </div>
        )}
      </main>

      {/* uppage */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-xl"
      >
        <img
          src={uppage}
          alt="uppage"
        />
      </button>
    </div>
  );
}