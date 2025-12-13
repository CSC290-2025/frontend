import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BusInfoProps {
  route: string;
  from: string;
  to: string;
  duration: string;
  fare: string;
  gpsAvailable?: boolean;
  stops: string[];
  isTappedIn: boolean;
  onTapConfirmed: (
    isTappingIn: boolean
  ) => Promise<{ success: boolean; message: string }>;
  isGlobalProcessing: boolean;
}

export default function BusInfo({
  route,
  from,
  to,
  duration,
  fare,
  gpsAvailable = true,
  stops,
  isTappedIn,
  onTapConfirmed,
  isGlobalProcessing,
}: BusInfoProps) {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tapLoading, setTapLoading] = useState(false);
  const [tapError, setTapError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const isDisabled = isGlobalProcessing || tapLoading;

  useEffect(() => {
    if (successMessage || tapError) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setTapError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, tapError]);

  const handleTapConfirm = async () => {
    if (isDisabled) return;

    setTapLoading(true);
    setTapError(null);
    setSuccessMessage(null);
    setShowConfirm(false);

    const isTappingIn = !isTappedIn;

    const { success, message } = await onTapConfirmed(isTappingIn);

    if (success) {
      setSuccessMessage(message);
    } else {
      setTapError(message);
    }
    setTapLoading(false);
  };

  const handleTapClick = (e: React.MouseEvent) => {
    if (isDisabled) return;
    e.stopPropagation();

    setShowConfirm(true);
  };

  const buttonText = isTappedIn ? 'Tapped In' : 'Tap In/Out';
  const buttonBgClass = isDisabled
    ? 'bg-gray-400'
    : isTappedIn
      ? 'bg-green-500 hover:bg-green-600'
      : 'bg-blue-500 hover:bg-blue-600';
  const modalMessage = isTappedIn
    ? 'Are you sure you want to TAP OUT? (Fare will be calculated and charged)'
    : 'Are you sure you want to TAP IN? (Max fare will be reserved)';

  return (
    <div className="rounded-xl bg-blue-800">
      {/* Header */}
      <div
        className={`flex cursor-pointer items-center justify-between p-3 select-none ${
          isTappedIn ? 'rounded-xl border-2 border-green-500' : 'rounded-xl'
        }`}
        onClick={() => setOpen(!open)}
        onMouseDown={(e) => e.preventDefault()}
        tabIndex={-1}
      >
        <div>
          <p className="text-sm font-semibold">{route}</p>
          <p className="text-xs text-blue-200">
            {from} → {to}
          </p>
        </div>

        <div className="flex flex-col items-end space-y-1">
          <div className="rounded-md bg-blue-600 px-2 py-1 text-xs">
            {duration}
          </div>
          {isDisabled ? (
            <div className="text-xs text-yellow-300">Processing...</div>
          ) : tapError ? (
            <div className="text-xs text-red-300">Failed!</div>
          ) : successMessage ? (
            <div className="text-xs text-lime-300">Success!</div>
          ) : (
            <div
              className={`flex items-center gap-1 rounded-b-lg px-3 py-1 text-xs font-semibold shadow-lg transition-colors duration-300 ${buttonBgClass}`}
              onClick={handleTapClick}
              onMouseDown={(e) => e.stopPropagation()}
              tabIndex={0}
              role="button"
            >
              <span>{buttonText}</span>
            </div>
          )}
        </div>
      </div>

      {(tapError || successMessage) && (
        <div
          className={`p-2 text-center text-xs ${tapError ? 'bg-red-700' : 'bg-lime-700'} rounded-b-xl text-white`}
        >
          {tapError || successMessage}
        </div>
      )}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="stops"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="space-y-3 rounded-b-xl bg-white px-6 py-4 text-gray-800 select-none"
            onMouseDown={(e) => e.preventDefault()}
            tabIndex={-1}
          >
            {stops.map((stop, index) => (
              <div
                key={index}
                className="flex items-center gap-3 select-none"
                onMouseDown={(e) => e.preventDefault()}
                tabIndex={-1}
              >
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  {index !== stops.length - 1 && (
                    <div className="h-6 w-[2px] bg-blue-300"></div>
                  )}
                </div>
                <p className="text-sm select-none">{stop}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xs rounded-lg bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                Confirm {isTappedIn ? 'Tap Out' : 'Tap In'}
              </h3>
              <p className="mb-6 text-sm text-gray-600">{modalMessage}</p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTapConfirm}
                  disabled={isDisabled}
                  className={`rounded-md px-4 py-2 text-sm font-medium text-white ${isDisabled ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
