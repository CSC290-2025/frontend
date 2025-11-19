import React, { useState } from 'react';
import CloseIcon from '@/features/G9-ApartmentListing/assets/CloseIcon.svg';
import StarIcon from '@/features/G9-ApartmentListing/assets/StarIcon.svg';
import GrayStarIcon from '@/features/G9-ApartmentListing/assets/GrayStarIcon.svg';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showError, setShowError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating === 0) {
      setShowError(true);
      return;
    }
    onSubmit(rating, comment);
    setRating(0);
    setComment('');
    setShowError(false);
    onClose();
  };

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
    setShowError(false);
  };

  const handleStarHover = (starValue: number) => {
    setHoverRating(starValue);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  return (
    <div className="font-poppins fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full text-2xl hover:bg-gray-100"
        >
          <img
            src={CloseIcon}
            alt="Closepage"
            className="transition-opacity hover:opacity-80"
          />
        </button>

        <h2 className="mb-6 text-2xl font-bold">Write a review</h2>

        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold">
            Rating<span className="ml-1 text-red-500">*</span>
            {showError && (
              <span className="ml-2 text-sm font-normal text-red-500">
                Please select a rating before submitting
              </span>
            )}
          </h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => handleStarHover(star)}
                onMouseLeave={handleStarLeave}
                className="transition-transform hover:scale-110"
              >
                <img
                  src={
                    star <= (hoverRating || rating) ? StarIcon : GrayStarIcon
                  }
                  alt={`star-${star}`}
                  className="h-12 w-12"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold">Comment</h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review here"
            className="h-32 w-full resize-none rounded-lg border border-gray-300 p-4 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="rounded-full bg-cyan-400 px-9 py-3 text-lg font-semibold text-white hover:bg-cyan-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
