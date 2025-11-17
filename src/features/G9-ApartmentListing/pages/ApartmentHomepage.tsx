import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@/router';
import UserIcon from '@/features/G9-ApartmentListing/assets/UserIcon.svg';
import ApartmentIcon from '@/features/G9-ApartmentListing/assets/ApartmentIcon.svg';
import SearchIcon from '@/features/G9-ApartmentListing/assets/SearchIcon.svg';
import UppageIcon from '@/features/G9-ApartmentListing/assets/UppageIcon.svg';
import LocationIcon from '@/features/G9-ApartmentListing/assets/LocationIcon.svg';
import PhoneIcon from '@/features/G9-ApartmentListing/assets/PhoneIcon.svg';
import StarIcon from '@/features/G9-ApartmentListing/assets/StarIcon.svg';
import GrayStarIcon from '@/features/G9-ApartmentListing/assets/GrayStarIcon.svg';

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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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
    const value = Number(e.target.value);
    const newMinPrice = Math.min(value, maxPrice - 1000);
    setMinPrice(newMinPrice);
    setCurrentPage(1);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const newMaxPrice = Math.max(value, minPrice + 1000);
    setMaxPrice(newMaxPrice);
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
              src={ApartmentIcon}
              alt="ApartmentIcon"
            />
            <h1 className="text-[40px] font-bold text-[#2B5991]">
              Apartment Hub
            </h1>
          </div>
          <p className="mt-2 text-sm text-[#8E8E8E]">
            Looking for a new place? Find your next apartment right here
          </p>
        </div>
        <div className="flex items-center gap-6">
          {/* Search */}
          <div className="relative flex w-80 items-center">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">
              <img className="h-5 w-5" src={SearchIcon} alt="SearchIcon" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by name"
              className="w-full rounded-lg border-1 border-gray-400 py-3 pr-16 pl-12 focus:border-[#2B5991] focus:outline-none"
            />
          </div>

          {/* User Icon and Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <img
              className="h-16 w-16 cursor-pointer"
              src={UserIcon}
              alt="UserIcon"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            />

            {/* Dropdown Menu*/}
            {isDropdownOpen && (
              <div className="ring-opacity-5 absolute right-0 z-10 mt-2 w-50 origin-top-right rounded-lg border-1 border-gray-400 bg-white shadow-lg focus:outline-none">
                <div className="py-1" role="none">
                  <Link
                    to="/MyRentedAPT"
                    className="text-md block w-full rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    My Rented Apartment
                  </Link>
                  {/* line */}
                  <div className="border-t border-gray-300"></div>
                  <Link
                    to="/AdminListedAPT"
                    className="text-md block w-full rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    My Listed Apartment
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
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
                  <img src={StarIcon} alt="star" className="h-6 w-6" />
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
              {/* Track background */}
              <div className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-gray-300"></div>

              {/* Active track */}
              <div
                className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#2B5991]"
                style={{
                  left: `${(minPrice / 20000) * 100}%`,
                  width: `${((maxPrice - minPrice) / 20000) * 100}%`,
                }}
              ></div>

              {/* Min price input */}
              <input
                type="range"
                min={0}
                max={20000}
                value={minPrice}
                onChange={handleMinChange}
                className="slider-min absolute w-full appearance-none bg-transparent"
                style={{
                  top: 'calc(50% - 11px)',
                  height: '22px',
                  zIndex: minPrice > maxPrice - 1000 ? 2 : 1,
                }}
              />

              {/* Max price input */}
              <input
                type="range"
                min={0}
                max={20000}
                value={maxPrice}
                onChange={handleMaxChange}
                className="slider-max absolute w-full appearance-none bg-transparent"
                style={{
                  top: 'calc(50% - 11px)',
                  height: '22px',
                  zIndex: 2,
                }}
              />

              <style>{`
                .slider-min, .slider-max {
                  pointer-events: none;
                }
                .slider-min::-webkit-slider-thumb, .slider-max::-webkit-slider-thumb {
                  appearance: none;
                  height: 22px;
                  width: 22px;
                  border-radius: 50%;
                  background-color: white;
                  border: 4px solid #2B5991;
                  cursor: pointer;
                  pointer-events: auto;
                  position: relative;
                }
                .slider-min::-moz-range-thumb, .slider-max::-moz-range-thumb {
                  height: 22px;
                  width: 22px;
                  border-radius: 50%;
                  background-color: white;
                  border: 4px solid #2B5991;
                  cursor: pointer;
                  pointer-events: auto;
                }
                .no-spinners::-webkit-inner-spin-button,
                .no-spinners::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
                }
                .no-spinners {
                -moz-appearance: textfield;
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
                  className="no-spinners w-32 rounded-xl border-2 border-gray-200 py-2 text-center font-semibold text-[#2B5991]"
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
                  className="no-spinners w-32 rounded-xl border-2 border-gray-200 py-2 text-center font-semibold text-[#2B5991]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <p className="mb-5 text-sm text-gray-500">
          {filteredApartments.length} Listing found
        </p>

        {/* Apartment Cards */}
        <div className="space-y-5">
          {currentApartments.map((apartment) => (
            <Link
              key={apartment.id}
              to="/ApartmentHomepage/:id"
              params={{ id: apartment.id.toString() }}
              className="flex gap-6 rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
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
                      <span className="font-md text-black">
                        {apartment.rating.toFixed(1)}
                      </span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <img
                            key={i}
                            src={
                              i < Math.floor(apartment.rating)
                                ? StarIcon
                                : GrayStarIcon
                            }
                            alt="star"
                            className="h-5 w-5"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({apartment.reviews})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#2B5991]">
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
                  <div className="mb-2 flex items-center gap-3">
                    <span className="inline-block h-6 w-6 text-gray-800">
                      <img src={LocationIcon} alt="LocationIcon" />
                    </span>
                    <span>{apartment.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="ml-1 inline-block h-4 w-4 text-gray-800">
                      <img src={PhoneIcon} alt="PhoneIcon" />
                    </span>
                    <span>{apartment.phone}</span>
                  </div>
                </div>
              </div>
            </Link>
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

            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="flex h-10 items-center justify-center rounded-full border border-gray-300 bg-white px-4 hover:bg-gray-100 disabled:opacity-50"
            >
              last »
            </button>
          </div>
        )}
      </main>

      {/* uppage */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed right-8 bottom-8 flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-xl shadow-lg transition-colors hover:bg-gray-50"
      >
        <img src={UppageIcon} alt="Uppage" />
      </button>
    </div>
  );
}
