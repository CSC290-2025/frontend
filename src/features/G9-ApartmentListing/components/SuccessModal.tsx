import React from 'react';

interface SuccessModalProps {
  message: string;
}

export default function SuccessModal({ message }: SuccessModalProps) {
  return (
    <div className="fixed top-8 left-1/2 z-[999] -translate-x-1/2 transform">
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
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
