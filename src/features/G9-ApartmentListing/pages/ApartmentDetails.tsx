import { useState } from 'react';
import '@/features/G9-ApartmentListing/styles/animations.css';
import { useParams } from '@/router';
import {
  APT,
  Room,
  Upload,
  Rating,
  Address,
} from '@/features/G9-ApartmentListing/hooks/index';
import type {
  roomTypes,
  ratingTypes,
  uploadTypes,
  apartmentTypes,
} from '@/features/G9-ApartmentListing/types/index';
import UppageIcon from '@/features/G9-ApartmentListing/assets/UppageIcon.svg';
import LocationIcon from '@/features/G9-ApartmentListing/assets/LocationIcon.svg';
import PhoneIcon from '@/features/G9-ApartmentListing/assets/PhoneIcon.svg';
import ShareIcon from '@/features/G9-ApartmentListing/assets/ShareIcon.svg';
import BackIcon from '@/features/G9-ApartmentListing/assets/BackIcon.svg';
import StarIcon from '@/features/G9-ApartmentListing/assets/StarIcon.svg';
import GrayStarIcon from '@/features/G9-ApartmentListing/assets/GrayStarIcon.svg';
import LeftIcon from '@/features/G9-ApartmentListing/assets/LeftIcon.svg';
import RightIcon from '@/features/G9-ApartmentListing/assets/RightIcon.svg';
import ShareModal from '@/features/G9-ApartmentListing/components/Share';
import ReviewModal from '@/features/G9-ApartmentListing/components/Review';
import {
  FailedError,
  SuccessToast,
} from '@/features/G9-ApartmentListing/components/toastBox';
import { MessageCircle } from 'lucide-react';
export default function ApartmentDetailPage() {
  const params = useParams('/ApartmentHomepage/:id');
  const apartmentId = params.id;

  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const [newlyAddedReview, setNewlyAddedReview] = useState<number | null>(null);
  const [editingReview, setEditingReview] = useState<{
    id: number;
    rating: number;
    comment: string;
  } | null>(null);
  const [reviewModalMode, setReviewModalMode] = useState<'create' | 'edit'>(
    'create'
  );
  const reviewsPerPage = 3;
  const shareUrl = window.location.href;

  const {
    data: apartmentData,
    isLoading: _isLoading,
    error: _error,
  } = APT.useApartment(parseInt(apartmentId));
  const { data: rating } = Rating.useCommentsByApartment(parseInt(apartmentId));
  const { data: room } = Room.useRooms(parseInt(apartmentId));
  const averageRating = Rating.useAverageRating(parseInt(apartmentId));
  const { data: images } = Upload.usePicturesByApartment(parseInt(apartmentId));
  const createRating = Rating.useCreateRating();
  const updateRating = Rating.useUpdateRatingWithContext(parseInt(apartmentId));
  const deleteRating = Rating.useDeleteRatingWithContext(parseInt(apartmentId));
  const rawApartment = apartmentData?.data || apartmentData || null;
  const ratingArray: ratingTypes.default[] =
    rating?.data?.data || rating?.data || [];
  const totalRatings = ratingArray.length;
  const imageArray: uploadTypes.uploadData[] =
    images?.data?.data || images?.data || [];
  const roomArray: roomTypes.Room[] =
    room || room?.data?.data || room?.data || [];

  // TODO: Replace with actual user ID from authentication context
  const currentUserId = 14;

  // Calculate manual average from rating array as fallback
  const manualAverage =
    totalRatings > 0
      ? ratingArray.reduce((sum, rating) => sum + rating.rating, 0) /
        totalRatings
      : 0;

  // Fetch address data using the address_id from apartment
  const { data: addressData } = Address.fetchAddressById(
    rawApartment?.address_id || 0
  );
  const address = addressData?.data || null;
  const apartment = {
    id: rawApartment?.id || parseInt(apartmentId),
    name: rawApartment?.name || 'Loading...',
    description: rawApartment?.description || '',
    address: address
      ? `${address.address_line}, ${address.subdistrict}, ${address.district}, ${address.province} ${address.postal_code}`
      : 'Address not available',
    phone: rawApartment?.phone || '',
    electric_price: rawApartment?.electric_price || 0,
    water_price: rawApartment?.water_price || 0,
    apartment_type: rawApartment?.apartment_type || 'apartment',
    apartment_location: rawApartment?.apartment_location || 'prachauthit',
    internet: (rawApartment?.internet as apartmentTypes.InternetType) || 'none',
    rating: Number(averageRating?.data?.average) || manualAverage || 0,
    totalReviews: totalRatings,
    images: imageArray.map((img) => img.url),
    roomTypes: roomArray.map((room) => ({
      type: room.type,
      size: room.size,
      price:
        room.price_start === room.price_end
          ? `${room.price_start} THB`
          : `${room.price_start}-${room.price_end} THB`,
      status: room.room_status === 'available' ? 'Available' : 'Unavailable',
    })),
    nearbyPlaces: [], // TODO: Add nearby places API
    reviews: ratingArray
      .map((rating) => ({
        id: rating.id,
        author: `User ${rating.userId}`, // TODO: Join with user table for actual names
        date: rating.createdAt
          ? new Date(rating.createdAt).toLocaleDateString()
          : new Date().toLocaleDateString(),
        rating: rating.rating,
        comment: rating.comment,
        avatar: '👤',
        userId: rating.userId,
        isCurrentUser: rating.userId === currentUserId,
      }))
      .sort((a, b) => {
        // Sort user's own reviews to the top
        if (a.isCurrentUser && !b.isCurrentUser) return -1;
        if (!a.isCurrentUser && b.isCurrentUser) return 1;
        // Then sort by creation date (newest first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }),
  };

  const totalReviewPages = Math.ceil(apartment.reviews.length / reviewsPerPage);
  const startReviewIndex = (currentReviewPage - 1) * reviewsPerPage;
  const currentReviews = apartment.reviews.slice(
    startReviewIndex,
    startReviewIndex + reviewsPerPage
  );

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <img
        key={i}
        src={i < rating ? StarIcon : GrayStarIcon}
        alt="star"
        className={`h-5 w-5 shrink-0`}
      />
    ));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalReviewPages) {
      setCurrentReviewPage(page);
    }
  };

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

  const handleReviewSubmit = async (ratingValue: number, comment: string) => {
    // Prevent multiple submissions while one is in progress
    if (createRating.isPending || isSubmittingReview) {
      return;
    }
    try {
      setIsSubmittingReview(true);

      // Check for existing review by this user
      if (ratingArray.some((r) => r.userId === currentUserId)) {
        FailedError('You can only review this apartment once');
        return;
      }

      const result = await createRating.mutateAsync({
        apartmentId: apartment.id,
        userId: currentUserId,
        rating: ratingValue,
        comment,
      });

      // Track newly added review for animation
      if (result?.data?.id) {
        setNewlyAddedReview(result.data.id);
        setTimeout(() => setNewlyAddedReview(null), 2000);
      }

      SuccessToast('Review submitted successfully.');
      setIsReviewModalOpen(false);
      setCurrentReviewPage(1);
    } catch (error) {
      console.error('Failed to submit review:', error);
      FailedError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleUpdateReview = async (
    reviewId: number,
    ratingValue: number,
    comment: string
  ) => {
    try {
      setIsSubmittingReview(true);

      await updateRating.mutateAsync({
        id: reviewId,
        data: {
          rating: ratingValue,
          comment,
        },
      });

      SuccessToast('Review updated successfully.');
      setIsReviewModalOpen(false);
      setEditingReview(null);
      setReviewModalMode('create');
    } catch (error) {
      console.error('Failed to update review:', error);
      FailedError('Failed to update review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEditReview = (review: {
    id: number;
    rating: number;
    comment: string;
  }) => {
    setEditingReview(review);
    setReviewModalMode('edit');
    setIsReviewModalOpen(true);
  };

  const handleDeleteReview = async (ratingId: number) => {
    try {
      setDeletingReviewId(ratingId);

      // Small delay for visual feedback
      await new Promise((resolve) => setTimeout(resolve, 200));

      await deleteRating.mutateAsync(ratingId);
      SuccessToast('Review deleted successfully.');

      // Reset to first page if current page becomes empty
      const remainingReviews = apartment.reviews.length - 1;
      const maxPages = Math.ceil(remainingReviews / reviewsPerPage);
      if (currentReviewPage > maxPages && maxPages > 0) {
        setCurrentReviewPage(maxPages);
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
      FailedError('Failed to delete review. Please try again.');
    } finally {
      setDeletingReviewId(null);
    }
  };

  return (
    <div className="font-poppins animate-fade-in min-h-screen bg-[#F9FAFB] font-sans">
      <div className="mx-auto max-w-7xl px-8 py-6">
        <div className="animate-slide-down grid grid-cols-2 items-center gap-8">
          <div className="flex items-center gap-4">
            {/* Back Icon */}
            <button
              onClick={() => (window.location.href = '/ApartmentHomepage')}
              className="flex h-10 w-10 items-center justify-center rounded-full text-2xl transition-all duration-300 hover:scale-110 hover:bg-gray-100"
            >
              <img
                src={BackIcon}
                alt="Backpage"
                className="transition-transform duration-300"
              />
            </button>
            <h1
              className={`text-3xl font-bold ${_isLoading ? 'shimmer-animation h-8 w-64 rounded bg-gray-200' : ''}`}
            >
              {_isLoading ? '' : apartment.name}
            </h1>
          </div>

          {/* Share */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex flex-col items-center gap-1 rounded-full p-2 hover:bg-gray-100"
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
      <div className="mx-auto -mt-5 max-w-7xl px-8 py-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="mb-6">
              <div className="group relative mb-4">
                {_isLoading ? (
                  <div className="shimmer-animation h-80 w-full rounded-lg bg-gray-200"></div>
                ) : (
                  <img
                    src={
                      apartment.images[currentImageIndex] ||
                      'https://i.pinimg.com/736x/e6/b6/87/e6b6879516fe0c7e046dfc83922626d6.jpg'
                    }
                    alt={apartment.name}
                    className="animate-fade-in h-80 w-full rounded-lg object-cover"
                  />
                )}

                <button
                  onClick={handlePrevImage}
                  className="absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-2xl opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100 hover:bg-white"
                >
                  <img
                    src={LeftIcon}
                    alt="LeftIcon"
                    className="transition-opacity hover:opacity-80"
                  />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-2xl opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100 hover:bg-white"
                >
                  <img
                    src={RightIcon}
                    alt="RightIcon"
                    className="transition-opacity hover:opacity-80"
                  />
                </button>
              </div>

              <div className="overflow-x-4 my-5 flex gap-4">
                {apartment.images
                  .slice(0, 5)
                  .map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleThumbnailClick(index)}
                      className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg ${
                        currentImageIndex === index
                          ? 'ring-4 ring-cyan-400'
                          : ''
                      }`}
                    >
                      <img
                        src={
                          img ||
                          'https://i.pinimg.com/736x/e6/b6/87/e6b6879516fe0c7e046dfc83922626d6.jpg'
                        }
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
                {_isLoading ? (
                  <div className="shimmer-animation h-6 w-80 rounded bg-gray-200"></div>
                ) : (
                  <span className="animate-slide-right">
                    {apartment.address}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-gray-700">
                <span className="ml-1 inline-block h-5 w-5 text-gray-800">
                  <img src={PhoneIcon} alt="PhoneIcon" />
                </span>
                {_isLoading ? (
                  <div className="shimmer-animation h-6 w-40 rounded bg-gray-200"></div>
                ) : (
                  <span className="animate-slide-right text-lg">
                    {apartment.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="rounded-lg bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Reviews</h2>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  disabled={isSubmittingReview}
                  className={`transform rounded-lg px-6 py-2 text-sm text-white transition-all duration-200 ${
                    isSubmittingReview
                      ? 'cursor-not-allowed bg-gray-400'
                      : 'bg-cyan-400 hover:scale-105 hover:bg-cyan-500 active:scale-95'
                  }`}
                >
                  {isSubmittingReview ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </span>
                  ) : (
                    'Write a review'
                  )}
                </button>
              </div>

              <div className="mb-6">
                <h3 className="mb-2 font-semibold">Rating</h3>
                <div className="flex items-center gap-2 transition-all duration-300">
                  <span className="text-2xl font-bold">
                    {Number(apartment.rating).toFixed(1)}
                  </span>
                  <div className="flex text-xl">
                    {renderStars(Math.floor(Number(apartment.rating)))}
                  </div>
                  <span className="text-gray-600">
                    ({apartment.totalReviews})
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="mb-4 font-semibold">Comment</h3>
                <div className="space-y-6">
                  {currentReviews.length === 0 ? (
                    <div className="py-12 text-center opacity-75 transition-all duration-500 hover:opacity-100">
                      <div className="mb-4 flex justify-center text-8xl text-gray-500">
                        <MessageCircle size={70} />
                      </div>
                      <p className="text-gray-500">
                        No reviews yet. Be the first to write a review!
                      </p>
                    </div>
                  ) : (
                    currentReviews.map((review, index) => {
                      const isCurrentUserReview = review.isCurrentUser;
                      const isDeleting = deletingReviewId === review.id;
                      const isNewlyAdded = newlyAddedReview === review.id;

                      return (
                        <div
                          key={review.id}
                          className={`group relative border-b pb-6 transition-all duration-500 ease-out last:border-b-0 ${
                            isDeleting
                              ? 'scale-95 opacity-30 blur-sm'
                              : 'scale-100 opacity-100'
                          } ${
                            isNewlyAdded
                              ? '-m-4 animate-pulse rounded-lg bg-green-50 p-4 shadow-lg'
                              : ''
                          } `}
                          style={{
                            transitionDelay: `${index * 50}ms`,
                            animation: isNewlyAdded
                              ? 'pulse 2s ease-in-out'
                              : undefined,
                          }}
                        >
                          <div className="mb-3 flex items-start justify-between">
                            <div className="flex gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl transition-all duration-300 ${
                                  isNewlyAdded
                                    ? 'animate-bounce bg-green-400 text-white shadow-lg'
                                    : isCurrentUserReview
                                      ? 'bg-blue-400 text-white shadow-md'
                                      : 'bg-gray-200 group-hover:bg-gray-300'
                                }`}
                              >
                                {review.avatar}
                              </div>
                              <div className="transition-transform duration-200 group-hover:translate-x-1">
                                <p
                                  className={`font-semibold ${isCurrentUserReview ? 'text-blue-700' : ''}`}
                                >
                                  {review.author}
                                  {isCurrentUserReview && (
                                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600">
                                      You
                                    </span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {review.date}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex text-lg transition-transform duration-200 hover:scale-110">
                                {renderStars(review.rating)}
                              </div>
                              {isCurrentUserReview && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() =>
                                      handleEditReview({
                                        id: review.id,
                                        rating: review.rating,
                                        comment: review.comment,
                                      })
                                    }
                                    className="ml-2 transform rounded-full p-1 text-blue-600 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:scale-110 hover:bg-blue-100 hover:text-blue-800"
                                    title="Edit your review"
                                    disabled={isSubmittingReview || isDeleting}
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteReview(review.id)
                                    }
                                    className={`transform rounded-full p-1 text-red-500 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:scale-110 hover:text-red-700 ${
                                      isDeleting
                                        ? 'animate-spin opacity-100'
                                        : 'hover:bg-red-100'
                                    }`}
                                    title="Delete your review"
                                    disabled={
                                      deleteRating.isPending || isDeleting
                                    }
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="ml-13 text-sm leading-relaxed text-gray-700 transition-all duration-200 group-hover:text-gray-900">
                            {review.comment}
                          </p>
                          {isNewlyAdded && (
                            <div
                              className="absolute -top-2 -right-2 animate-bounce rounded-full bg-green-500 px-2 py-1 text-xs text-white shadow-md"
                              style={{ animationDuration: '1s' }}
                            >
                              New!
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
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
              {_isLoading ? (
                <div className="space-y-2">
                  <div className="shimmer-animation h-4 w-full rounded bg-gray-200"></div>
                  <div className="shimmer-animation h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="shimmer-animation h-4 w-1/2 rounded bg-gray-200"></div>
                </div>
              ) : (
                <p className="animate-fade-in pb-3 text-sm leading-relaxed whitespace-pre-line text-gray-700">
                  {apartment.description}
                </p>
              )}

              {_isLoading ? (
                <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                  <div className="flex justify-between">
                    <div className="shimmer-animation h-4 w-24 rounded bg-gray-200"></div>
                    <div className="shimmer-animation h-4 w-20 rounded bg-gray-200"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="shimmer-animation h-4 w-28 rounded bg-gray-200"></div>
                    <div className="shimmer-animation h-4 w-20 rounded bg-gray-200"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="shimmer-animation h-4 w-16 rounded bg-gray-200"></div>
                    <div className="shimmer-animation h-4 w-16 rounded bg-gray-200"></div>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Water price :</span>
                    <span className="font-medium">
                      {apartment.water_price} THB/unit
                    </span>
                  </div>
                  <div className="flex justify-end text-xs text-gray-500">
                    <span>100 THB (minimum)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Electricity Price :</span>
                    <span className="font-medium">
                      {apartment.electric_price} THB/unit
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Internet :</span>
                    <span className="font-medium">
                      {apartment.internet === 'not_free'
                        ? 'not free'
                        : apartment.internet === 'free'
                          ? 'free'
                          : 'none'}
                    </span>
                  </div>
                </div>
              )}
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
                    {_isLoading ? (
                      [...Array(3)].map((_, index) => (
                        <tr key={index} className="border-b last:border-b-0">
                          <td className="py-3">
                            <div className="shimmer-animation h-4 w-20 rounded bg-gray-200"></div>
                          </td>
                          <td className="py-3">
                            <div className="shimmer-animation h-4 w-16 rounded bg-gray-200"></div>
                          </td>
                          <td className="py-3">
                            <div className="shimmer-animation h-4 w-24 rounded bg-gray-200"></div>
                          </td>
                          <td className="py-3">
                            <div className="shimmer-animation h-6 w-16 rounded bg-gray-200"></div>
                          </td>
                        </tr>
                      ))
                    ) : apartment.roomTypes.length > 0 ? (
                      apartment.roomTypes.map((room, index) => {
                        return (
                          <tr
                            key={index}
                            className="animate-fade-in border-b last:border-b-0"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
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
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-6 text-center text-sm text-gray-500"
                        >
                          No rooms available at this time
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Nearby places - TODO: Add API integration when available */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Nearby places</h2>
              <div className="text-sm text-gray-500">
                Nearby places information will be available soon.
              </div>
            </div>

            {/* Book now */}
            <button
              onClick={() => {
                window.location.href = `/ApartmentBooking?apartmentId=${apartment.id}`;
              }}
              className="flex w-full transform items-center justify-center rounded-lg bg-cyan-400 py-4 text-xl font-bold text-white transition-all duration-200 hover:scale-105 hover:bg-cyan-500 active:scale-95"
            >
              Book now !
            </button>
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
        onClose={() => {
          setIsReviewModalOpen(false);
          setEditingReview(null);
          setReviewModalMode('create');
        }}
        onSubmit={handleReviewSubmit}
        onUpdate={handleUpdateReview}
        mode={reviewModalMode}
        existingReview={editingReview}
      />
    </div>
  );
}
