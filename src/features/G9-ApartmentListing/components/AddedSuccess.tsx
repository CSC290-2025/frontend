import React, { useEffect } from 'react';

interface AddedSuccessProps {
  showSuccess: boolean;
  showError: boolean;
  errorMessage: string;
  onCloseSuccess: () => void;
  onCloseError: () => void;
}

export default function AddedSuccess({
  showSuccess,
  showError,
  errorMessage,
  onCloseSuccess,
  onCloseError,
}: AddedSuccessProps): React.ReactElement | null {
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        onCloseError();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showError, onCloseError]);

  const handleConfirm = (): void => {
    window.location.href = '/AdminListedAPT';
  };

  return (
    <>
      {showSuccess && (
        <div className="font-poppins fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-fix mx-4 max-w-sm rounded-lg bg-white p-8 shadow-xl">
            <h2 className="mb-4 text-center text-2xl font-bold">Success!</h2>
            <div className="flex justify-center">
              <button
                onClick={handleConfirm}
                className="rounded-lg bg-cyan-400 px-6 py-2 font-semibold text-white hover:bg-cyan-500"
              >
                View Listed Apartments
              </button>
            </div>
          </div>
        </div>
      )}

      {showError && (
        <div className="animate-fade-in fixed top-4 left-1/2 z-50 -translate-x-1/2">
          <div className="rounded-lg bg-red-500 px-6 py-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="font-semibold text-white">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
