import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import userIcon from '@/assets/userIcon.svg';
import apartmentIcon from '@/assets/apartmentIcon.svg';
import searchIcon from '@/assets/searchIcon.svg';
import uppage from '@/assets/uppage.svg';

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
  const [searchTerm, setSearchTerm] = useState<string>(''); // ✅ สำหรับช่อง search
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 2;

  const apartments: Apartment[] = [
    {
      id: 1,
      name: 'Cosmo Mansion',
      rating: 4.0,
      reviews: 8,
      price: 4600,
      rooms: 3,
      location: 'Prachautit',
      address: 'Pracha Uthit road, Bangmod, Thungkru, Bangkok',
      phone: '0XXXXXXXXX',
      image:
        'https://bcdn.renthub.in.th/listing_picture/201603/20160323/KFVR1t5u5w6KhpFVDWLY.jpg?class=moptimized',
    },
    {
      id: 2,
      name: '19/3 Resident',
      rating: 5.0,
      reviews: 30,
      price: 7000,
      rooms: 3,
      location: 'Prachautit',
      address: 'Phutthabucha road, Bangmod, Thungkru, Bangkok',
      phone: '0XXXXXXXXX',
      image:
        'https://bcdn.renthub.in.th/listing_picture/201809/20180902/F2fJpr4Vz3CKeAVwV5ZD.jpg?class=doptimized',
    },
    {
      id: 3,
      name: 'The Asoke Tower',
      rating: 4.5,
      reviews: 45,
      price: 12000,
      rooms: 5,
      location: 'Asoke',
      address: 'Sukhumvit 21 (Asoke), Khlong Toei Nuea, Watthana, Bangkok',
      phone: '02-XXX-XXXX',
      image:
        'https://bcdn.renthub.in.th/listing_picture/201809/20180902/F2fJpr4Vz3CKeAVwV5ZD.jpg?class=doptimized',
    },
    {
      id: 4,
      name: 'Asoke Place',
      rating: 3.8,
      reviews: 22,
      price: 9500,
      rooms: 2,
      location: 'Asoke',
      address: 'Sukhumvit road, Asoke, Khlong Toei, Bangkok',
      phone: '02-XXX-XXXX',
      image:
        'https://bcdn.renthub.in.th/listing_picture/201603/20160323/KFVR1t5u5w6KhpFVDWLY.jpg?class=moptimized',
    },
    {
      id: 5,
      name: 'Pathumwan Residence',
      rating: 4.2,
      reviews: 38,
      price: 8500,
      rooms: 4,
      location: 'Phathumwan',
      address: 'Phayathai road, Pathumwan, Bangkok',
      phone: '02-XXX-XXXX',
      image:
        'https://bcdn.renthub.in.th/listing_picture/201809/20180902/F2fJpr4Vz3CKeAVwV5ZD.jpg?class=doptimized',
    },
    {
      id: 6,
      name: 'Siam Garden Apartment',
      rating: 4.7,
      reviews: 52,
      price: 11000,
      rooms: 3,
      location: 'Phathumwan',
      address: 'Rama 1 road, Pathumwan, Bangkok',
      phone: '02-XXX-XXXX',
      image:
        'https://bcdn.renthub.in.th/listing_picture/201603/20160323/KFVR1t5u5w6KhpFVDWLY.jpg?class=moptimized',
    },
  ];

  const filteredApartments = apartments.filter((apt) => {
    const matchesSearch = apt.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (
      selectedLocations.length > 0 &&
      !selectedLocations.includes(apt.location)
    ) {
      return false;
    }

    if (selectedRatings.length > 0) {
      const matchesRating = selectedRatings.some(
        (rating) => Math.floor(apt.rating) === rating
      );
      if (!matchesRating) return false;
    }

    if (apt.price < minPrice || apt.price > maxPrice) {
      return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredApartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApartments = filteredApartments.slice(startIndex, endIndex);

  // Handlers
  const handleLocationChange = (location: string) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
    setCurrentPage(1);
  };

  const handleRatingChange = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
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

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxPrice - 1000);
    setMinPrice(value);
    setCurrentPage(1);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minPrice + 1000);
    setMaxPrice(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // const handleSearchClick = () => {
  //   setCurrentPage(1);
  // };

  return (
    <div className="font-poppins min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="flex items-center justify-between px-12 py-5">
        <div>
          <div className="flex items-center gap-3">
            <img
              className="h-12 w-12"
              src={apartmentIcon}
              alt="apartmentIcon"
            />
            <h1 className="text-[40px] font-bold text-[#2B5991]">
              Apartment Hub
            </h1>
          </div>
          <p className="mt-2 text-sm text-[#8E8E8E]">
            Looking for a new place? Find your next apartment right here
          </p>
        </div>

        {/* Search */}
        <div className="relative flex w-80 items-center">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">
            <img className="h-5 w-5" src={searchIcon} alt="searchIcon" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by name"
            className="w-full rounded-[16px] border-2 border-gray-300 py-3 pr-16 pl-12 focus:border-[#2B5991] focus:outline-none"
          />
        </div>

        <img
          className="h-16 w-16 cursor-pointer"
          src={userIcon}
          alt="userIcon"
        />
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-10 py-1">
        <div className="mb-5 flex gap-8">
          {/* Location */}
          <div className="flex-1 rounded-xl bg-white p-8 shadow">
            <h3 className="mb-4 text-xl font-semibold text-[#2B5991]">
              Location
            </h3>
            <div className="space-y-3 text-lg">
              {['Asoke', 'Prachautit', 'Phathumwan'].map((loc) => (
                <label
                  key={loc}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-blue-600"
                    checked={selectedLocations.includes(loc)}
                    onChange={() => handleLocationChange(loc)}
                  />
                  <span>{loc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="flex-1 rounded-xl bg-white p-8 shadow">
            <h3 className="mb-4 text-xl font-semibold text-[#2B5991]">
              Rating
            </h3>
            <div className="grid grid-cols-2 gap-y-3 text-lg">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label
                  key={rating}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-blue-600"
                    checked={selectedRatings.includes(rating)}
                    onChange={() => handleRatingChange(rating)}
                  />
                  <span>{rating}</span>
                  <span className="text-xl text-yellow-400">★</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div className="flex-1 rounded-xl bg-white p-8 shadow">
            <h3 className="mb-6 text-center text-xl font-semibold text-[#2B5991]">
              Price Range
            </h3>

            {/* Slider */}
            <div className="relative mb-10 w-full">
              <div className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-gray-300"></div>

              <div
                className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#2B5991]"
                style={{
                  left: `${(minPrice / 20000) * 100}%`,
                  width: `${((maxPrice - minPrice) / 20000) * 100}%`,
                }}
              ></div>

              <input
                type="range"
                min={0}
                max={20000}
                value={minPrice}
                onChange={handleMinChange}
                className="pointer-events-none absolute w-full appearance-none bg-transparent"
                style={{ top: 'calc(50% - 6px)' }}
              />

              <input
                type="range"
                min={0}
                max={20000}
                value={maxPrice}
                onChange={handleMaxChange}
                className="pointer-events-none absolute w-full appearance-none bg-transparent"
                style={{ top: 'calc(50% - 6px)' }}
              />

              <style>{`
                input[type="range"] {
                  pointer-events: none;
                }
                input[type="range"]::-webkit-slider-thumb {
                  appearance: none;
                  height: 22px;
                  width: 22px;
                  border-radius: 50%;
                  background-color: white;
                  border: 4px solid #2B5991;
                  cursor: pointer;
                  pointer-events: auto;
                  position: relative;
                  top: -4px;
                }
              `}</style>
            </div>

            {/* Inputs */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col items-center">
                <label className="mb-1 text-sm font-medium text-gray-500">
                  Min Price
                </label>
                <input
                  type="number"
                  value={minPrice}
                  min={0}
                  max={maxPrice - 1000}
                  onChange={(e) => handleMinChange(e)}
                  className="w-32 rounded-xl border-2 border-gray-200 px-4 py-2 text-center font-semibold text-[#2B5991]"
                />
              </div>

              <span className="mt-6 text-xl text-gray-500">-</span>

              <div className="flex flex-col items-center">
                <label className="mb-1 text-sm font-medium text-gray-500">
                  Max Price
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  min={minPrice + 1000}
                  max={20000}
                  onChange={(e) => handleMaxChange(e)}
                  className="w-32 rounded-xl border-2 border-gray-200 px-4 py-2 text-center font-semibold text-[#2B5991]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ผลลัพธ์ */}
        <p className="mb-5 text-sm text-gray-500">
          {filteredApartments.length} Listing found
        </p>

        {/* Apartment Cards */}
        <div className="space-y-5">
          {currentApartments.map((apartment) => (
            <NavLink
              key={apartment.id}
              to={`/apartment/${apartment.id}`}
              className="block flex gap-6 rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <img
                src={apartment.image}
                alt={apartment.name}
                className="h-36 w-52 rounded-lg object-cover"
              />
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {apartment.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-bold text-blue-600">
                        {apartment.rating.toFixed(1)}
                      </span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < Math.floor(apartment.rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({apartment.reviews})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-800">
                      {apartment.price.toLocaleString()}{' '}
                      <span className="text-sm font-normal text-gray-600">
                        Baht / Month
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Room available: {apartment.rooms}
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
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
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex h-10 items-center justify-center rounded-full border border-gray-300 bg-white px-4 hover:bg-gray-100 disabled:opacity-50"
            >
              ‹ prev
            </button>
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                      currentPage === pageNum
                        ? 'border-cyan-400 bg-[#01CCFF] text-white'
                        : 'border-gray-300 bg-white hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex h-10 items-center justify-center rounded-full border border-gray-300 bg-white px-4 hover:bg-gray-100 disabled:opacity-50"
            >
              next ›
            </button>
          </div>
        )}
      </main>

      {/* uppage */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed right-8 bottom-8 flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-xl shadow-lg transition-colors hover:bg-gray-50"
      >
        <img src={uppage} alt="uppage" />
      </button>
    </div>
  );
}
