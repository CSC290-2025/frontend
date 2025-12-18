import { X } from 'lucide-react';

interface ApproveConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ApproveConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: ApproveConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Content */}
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">
            Are you sure to
          </h2>
          <h2 className="mb-8 text-2xl font-semibold text-gray-900">
            Approve this course?
          </h2>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onConfirm}
              className="flex-1 rounded-xl bg-green-400 py-3 text-lg font-medium text-white transition-colors hover:bg-green-500 active:scale-95"
            >
              Yes
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-red-500 py-3 text-lg font-medium text-white transition-colors hover:bg-red-600 active:scale-95"
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
