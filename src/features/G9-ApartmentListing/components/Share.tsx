import React, { useState } from 'react';
import CloseIcon from '@/features/G9-ApartmentListing/assets/CloseIcon.svg';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  shareUrl,
}: ShareModalProps) {
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedNotification(true);
      setTimeout(() => {
        setShowCopiedNotification(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      <div className="font-poppins fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="max-w-2sm relative w-md rounded-2xl bg-white p-6 shadow-xl">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full text-2xl text-gray-600 hover:bg-gray-100"
          >
            <img
              src={CloseIcon}
              alt="Closepage"
              className="transition-opacity hover:opacity-80"
            />
          </button>

          <h2 className="mb-6 text-2xl font-bold">Link to share</h2>

          <div className="mb-6">
            <div className="rounded-lg border-2 border-gray-300 bg-white p-4">
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-blue-600 hover:underline"
              >
                {shareUrl}
              </a>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleCopyLink}
              className="rounded-full bg-cyan-400 px-8 py-3 text-lg font-semibold text-white hover:bg-cyan-500"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {showCopiedNotification && (
        <div className="fixed top-8 left-1/2 z-[60] -translate-x-1/2 transform">
          <div className="flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-white shadow-lg">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-medium">Copied to clipboard</span>
          </div>
        </div>
      )}
    </>
  );
}
