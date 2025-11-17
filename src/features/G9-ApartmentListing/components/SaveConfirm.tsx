interface SaveConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function SaveConfirmationPopup({
  isOpen,
  onClose,
  onConfirm,
}: SaveConfirmationPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="font-poppins fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-120 rounded-xl bg-white p-6 text-center shadow-xl">
        <p className="mb-4 text-xl font-bold text-gray-800">Save Changes?</p>
        <p className="mb-6 text-gray-600">
          Are you sure you want to save the changes you made?
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="rounded-md bg-[#01CEF8] px-6 py-2 font-medium text-white transition hover:bg-[#4E8FB1]"
          >
            Save
          </button>

          <button
            onClick={onClose}
            className="rounded-md bg-gray-300 px-6 py-2 font-medium text-gray-800 transition hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
