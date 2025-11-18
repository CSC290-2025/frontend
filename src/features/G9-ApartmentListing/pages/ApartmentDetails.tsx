import React, { useState } from 'react';
import { Link } from '@/router';
import UppageIcon from '@/features/G9-ApartmentListing/assets/UppageIcon.svg';
import LocationIcon from '@/features/G9-ApartmentListing/assets/LocationIcon.svg';
import PhoneIcon from '@/features/G9-ApartmentListing/assets/PhoneIcon.svg';
import ShareIcon from '@/features/G9-ApartmentListing/assets/ShareIcon.svg';
import BackIcon from '@/features/G9-ApartmentListing/assets/BackIcon.svg';
import ShareModal from '@/features/G9-ApartmentListing/components/Share';
import ReviewModal from '@/features/G9-ApartmentListing/components/Review';

interface ReviewData {
  id: number;
  author: string;
  date: string;
  rating: number;
  comment: string;
  avatar: string;
}

interface RoomType {
  type: string;
  size: string;
  price: string;
  status: 'Available' | 'Unavailable';
}

interface NearbyPlace {
  name: string;
  distance: string;
  type: 'bus' | 'hospital' | 'university';
}

interface ApartmentDetail {
  id: number;
  name: string;
  rating: number;
  totalReviews: number;
  description: string;
  address: string;
  phone: string;
  line: string;
  facebook: string;
  mainImage: string;
  images: string[];
  waterPrice: string;
  electricityPrice: string;
  internet: string;
  roomTypes: RoomType[];
  nearbyPlaces: NearbyPlace[];
  reviews: ReviewData[];
}

export default function ApartmentDetailPage() {
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const reviewsPerPage = 3;
  const shareUrl = 'https://share.google/jZvJI3nwd7jcVDi48';

  // use Link from '@/router' for navigation links instead of useNavigate

  const apartmentReviews: ReviewData[] = [
    {
      id: 1,
      author: 'Yang Jungwon',
      date: '3 month ago',
      rating: 4,
      comment:
        "A solid place to live. The rooms are a decent size, and the included utilities (Wi-Fi never fail. It's an older building, so things like the elevators and laundry can be slow/clogged, but the maintenance staff is surprisingly quick and efficient when you report a problem.",
      avatar: '👤',
    },
    {
      id: 2,
      author: 'Oguri Cap',
      date: '6 month ago',
      rating: 5,
      comment:
        'There are many food places near this dorm. You can easily walk to three different dining halls and several fast-food spots.',
      avatar: '👤',
    },
    {
      id: 3,
      author: 'Lazumaki Sasuke',
      date: '10 month ago',
      rating: 3,
      comment:
        'The facilities themselves here are great. However, the location is the problem: the room insulation, which is terrible. The walls cannot hold back sound at all. Sometimes I can hear my neighbors having loud nights, and other times, I can clearly hear the full content of an argument or a fight next door in my room. It makes quiet time, especially late at night, very difficult. If you need silence to study or sleep, this place will be a challenge.',
      avatar: '👤',
    },
    {
      id: 4,
      author: 'Olivia Chen',
      date: '1 year ago',
      rating: 5,
      comment:
        'Perfect location for students! Walking distance to KMUTT and plenty of food options nearby. The staff is friendly and maintenance is quick.',
      avatar: '👤',
    },
    {
      id: 5,
      author: 'Liam Taylor',
      date: '1 year ago',
      rating: 4,
      comment:
        'Good value for money. The room is clean and well-maintained. Internet speed is excellent for online classes and streaming.',
      avatar: '👤',
    },
    {
      id: 6,
      author: 'Sophia Rodriguez',
      date: '1 year ago',
      rating: 4,
      comment:
        'Nice apartment with all the basic amenities. The only downside is parking can be tight during peak hours.',
      avatar: '👤',
    },
    {
      id: 7,
      author: 'Emma Kumar',
      date: '2 years ago',
      rating: 3,
      comment:
        'Decent place but could use some renovation. The AC works well which is important in Bangkok heat.',
      avatar: '👤',
    },
  ];

  const totalReviews = apartmentReviews.length;
  const totalRatingSum = apartmentReviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  const averageRating = totalReviews > 0 ? totalRatingSum / totalReviews : 0;

  const apartment: ApartmentDetail = {
    id: 1,
    name: 'Cosmo Mansion',
    rating: averageRating,
    totalReviews: totalReviews,
    description: `READY TO MOVE IN!
Apartment for rent modern style fully furnished with electronic appliances.
Located at Soi Pracha Uthit45 near to KMUTT, Lotus, Big C, Bangpakok
Hospital and etc.
Annual contract price starts from 4,600 Baht/Month
FREE : Internet, cable TV
Furniture and appliances includes: refrigerator, water heater, air conditioner

Contact us
Line: UFA888
Facebook: https://www.facebook.com/cosmomansion/`,
    address:
      '110, 112 Pracha Uthit Soi 45, Pracha Uthit Road, Bang Mod, Thung Khru District, Bangkok 10140',
    phone: '0999999999',
    line: 'UFA888',
    facebook: 'https://www.facebook.com/cosmomansion/',
    mainImage:
      'https://bcdn.renthub.in.th/listing_picture/201603/20160323/KFVR1t5u5w6KhpFVDWLY.jpg?class=moptimized',
    images: [
      'https://bcdn.renthub.in.th/listing_picture/201603/20160323/KFVR1t5u5w6KhpFVDWLY.jpg?class=moptimized',
      'https://bcdn.renthub.in.th/listing_picture/201809/20180902/F2fJpr4Vz3CKeAVwV5ZD.jpg?class=doptimized',
      'https://bcdn.renthub.in.th/listing_picture/202012/20201223/ZMrUqc8KqZY34TwiMB52.jpg?class=doptimized',
    ],
    waterPrice: '7 THB/unit',
    electricityPrice: '17 THB/unit',
    internet: 'Free',
    roomTypes: [
      {
        type: 'Studio',
        size: '18 sq.m.',
        price: '4,600 THB',
        status: 'Available',
      },
      {
        type: 'Studio2',
        size: '24 sq.m.',
        price: '4,900 THB',
        status: 'Available',
      },
      {
        type: 'Two bed room',
        size: '48 sq.m.',
        price: '8,000 THB',
        status: 'Unavailable',
      },
    ],
    nearbyPlaces: [
      { name: 'Prachauthit 39', distance: '120 m', type: 'bus' },
      { name: 'Prachauthit 42', distance: '360m', type: 'bus' },
      { name: 'Suksawat Hospital', distance: '2.9 km', type: 'hospital' },
      {
        name: "King Mongkut's University of Technology Thonburi",
        distance: '360 m',
        type: 'university',
      },
    ],
    reviews: apartmentReviews,
  };

  const totalReviewPages = Math.ceil(apartment.reviews.length / reviewsPerPage);
  const startReviewIndex = (currentReviewPage - 1) * reviewsPerPage;
  const currentReviews = apartment.reviews.slice(
    startReviewIndex,
    startReviewIndex + reviewsPerPage
  );

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
      >
        ★
      </span>
    ));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalReviewPages) {
      setCurrentReviewPage(page);
    }
  };

  // navigation handled via <Link> in JSX

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? apartment.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === apartment.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleReviewSubmit = (rating: number, comment: string) => {
    console.log('New Review - Rating:', rating, 'Comment:', comment);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      <div className="mx-auto max-w-7xl px-8 py-6">
        <div className="grid grid-cols-2 items-center gap-8">
          <div className="flex items-center gap-4">
            {/* Back Icon */}
            <button
              onClick={() => (window.location.href = '/ApartmentHomepage')}
              className="flex h-10 w-10 items-center justify-center rounded-full text-2xl hover:bg-gray-100"
            >
              <img src={BackIcon} alt="Backpage" />
            </button>
            <h1 className="text-3xl font-bold">{apartment.name}</h1>
          </div>

          {/* Share */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex flex-col items-center gap-1 rounded-lg p-2 hover:bg-gray-100"
            >
              <span className="h-8 w-8">
                <img src={ShareIcon} alt="ShareIcon" />
              </span>
              <span className="text-sm text-gray-600">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pictures */}
      <div className="mx-auto mt-[-20px] max-w-7xl px-8 py-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="mb-6">
              <div className="group relative mb-4">
                <img
                  src={apartment.images[currentImageIndex]}
                  alt={apartment.name}
                  className="h-80 w-full rounded-lg object-cover"
                />
                <button
                  onClick={handlePrevImage}
                  className="absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-2xl opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100 hover:bg-white"
                >
                  ‹
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-2xl opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100 hover:bg-white"
                >
                  ›
                </button>
              </div>

              <div className="flex gap-4">
                {apartment.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg ${
                      currentImageIndex === index ? 'ring-4 ring-cyan-400' : ''
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${apartment.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6 space-y-3">
              <div className="flex items-start gap-4 text-gray-700">
                <span className="inline-block h-9 w-9 text-gray-800">
                  <img src={LocationIcon} alt="LocationIcon" />
                </span>
                <span>{apartment.address}</span>
              </div>
              <div className="flex items-center gap-4 text-gray-700">
                <span className="ml-1 inline-block h-5 w-5 text-gray-800">
                  <img src={PhoneIcon} alt="PhoneIcon" />
                </span>
                <span className="text-lg">{apartment.phone}</span>
              </div>
            </div>

            {/* Reviews */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Reviews</h2>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="rounded-lg bg-cyan-400 px-6 py-2 text-sm text-white hover:bg-cyan-500"
                >
                  Write a review
                </button>
              </div>

              <div className="mb-6">
                <h3 className="mb-2 font-semibold">Rating</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {apartment.rating.toFixed(1)}
                  </span>
                  <div className="flex text-xl">
                    {renderStars(Math.floor(apartment.rating))}
                  </div>
                  <span className="text-gray-600">
                    ({apartment.totalReviews})
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="mb-4 font-semibold">Comment</h3>
                <div className="space-y-6">
                  {currentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b pb-6 last:border-b-0"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-xl">
                            {review.avatar}
                          </div>
                          <div>
                            <p className="font-semibold">{review.author}</p>
                            <p className="text-sm text-gray-500">
                              {review.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex text-lg">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="ml-13 text-sm leading-relaxed text-gray-700">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Pagination */}
              {totalReviewPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => handlePageChange(currentReviewPage - 1)}
                    disabled={currentReviewPage === 1}
                    className="flex h-10 items-center justify-center rounded-full border border-gray-300 bg-white px-4 hover:bg-gray-100 disabled:opacity-50"
                  >
                    ‹ prev
                  </button>
                  {[...Array(totalReviewPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalReviewPages ||
                      (pageNum >= currentReviewPage - 1 &&
                        pageNum <= currentReviewPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                            currentReviewPage === pageNum
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
                    onClick={() => handlePageChange(currentReviewPage + 1)}
                    disabled={currentReviewPage === totalReviewPages}
                    className="flex h-10 items-center justify-center rounded-full border border-gray-300 bg-white px-4 hover:bg-gray-100 disabled:opacity-50"
                  >
                    next ›
                  </button>

                  <button
                    onClick={() => handlePageChange(totalReviewPages)}
                    disabled={currentReviewPage === totalReviewPages}
                    className="flex h-10 items-center justify-center rounded-full border border-gray-300 bg-white px-4 hover:bg-gray-100 disabled:opacity-50"
                  >
                    last »
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* About this place */}
          <div>
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">About this place</h2>

              <h3 className="mb-2 font-semibold">Description</h3>
              <p className="mb-4 text-sm leading-relaxed whitespace-pre-line text-gray-700">
                {apartment.description}
              </p>

              <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Water price :</span>
                  <span className="font-medium">{apartment.waterPrice}</span>
                </div>
                <div className="flex justify-end text-xs text-gray-500">
                  <span>100 THB (minimum)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Electricity Price:</span>
                  <span className="font-medium">
                    {apartment.electricityPrice}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Internet :</span>
                  <span className="font-medium">{apartment.internet}</span>
                </div>
              </div>
            </div>

            {/* Room type */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Room Type</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left font-semibold">
                        Room Type
                      </th>
                      <th className="pb-3 text-left font-semibold">Size</th>
                      <th className="pb-3 text-left font-semibold">
                        <div>Monthly Rental</div>
                        <div className="text-xs font-normal text-gray-500">
                          (Contract 1 year)
                        </div>
                      </th>
                      <th className="pb-3 text-left font-semibold">
                        Room Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {apartment.roomTypes.map((room, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="py-3">{room.type}</td>
                        <td className="py-3">{room.size}</td>
                        <td className="py-3">{room.price}</td>
                        <td className="py-3">
                          <span
                            className={`rounded-md px-3 py-1 text-xs font-semibold ${
                              room.status === 'Available'
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                            }`}
                          >
                            {room.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Nearby */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Nearby places</h2>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center gap-2 font-semibold text-gray-800">
                    <span>Bus station</span>
                  </div>
                  {apartment.nearbyPlaces
                    .filter((p) => p.type === 'bus')
                    .map((place, i) => (
                      <div
                        key={i}
                        className="ml-5 flex justify-between py-1 text-sm"
                      >
                        <span className="text-gray-700">{place.name}</span>
                        <span className="text-gray-600">{place.distance}</span>
                      </div>
                    ))}
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2 font-semibold text-gray-800">
                    <span>Hospital</span>
                  </div>
                  {apartment.nearbyPlaces
                    .filter((p) => p.type === 'hospital')
                    .map((place, i) => (
                      <div
                        key={i}
                        className="ml-5 flex justify-between py-1 text-sm"
                      >
                        <span className="text-gray-700">{place.name}</span>
                        <span className="text-gray-600">{place.distance}</span>
                      </div>
                    ))}
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2 font-semibold text-gray-800">
                    <span>University</span>
                  </div>
                  {apartment.nearbyPlaces
                    .filter((p) => p.type === 'university')
                    .map((place, i) => (
                      <div
                        key={i}
                        className="ml-5 flex justify-between py-1 text-sm"
                      >
                        <span className="text-gray-700">{place.name}</span>
                        <span className="text-gray-600">{place.distance}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Book now */}
            <Link
              to="/ApartmentBooking"
              className="flex w-full items-center justify-center rounded-lg bg-cyan-400 py-4 text-xl font-bold text-white hover:bg-cyan-500"
            >
              Book now !
            </Link>
          </div>
        </div>
      </div>

      {/* uppage */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed right-8 bottom-8 flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-xl shadow-lg transition-colors hover:bg-gray-50"
      >
        <img src={UppageIcon} alt="Uppage" />
      </button>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
