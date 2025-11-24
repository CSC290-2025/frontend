interface ConfirmEndContractProps {
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmEndContract({
  message = 'Are you sure?',
  onConfirm,
  onCancel,
}: ConfirmEndContractProps) {
  return (
    <div className="font-poppins fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-110 rounded-xl bg-white p-6 text-center shadow-xl">
        <p className="mb-3 text-[24px] font-bold text-gray-800">{message}</p>
        <p className="text-[14px] text-gray-600">
          Are you sure you want to end this contract?
        </p>
        <p className="mb-4 text-[14px] text-gray-600">
          This tenant will no longer appear on your apartment&apos;s tenant
          list.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-500 px-6 py-2 font-medium text-white transition hover:bg-red-600"
          >
            Yes
          </button>

          <button
            onClick={onCancel}
            className="rounded-md bg-gray-300 px-6 py-2 font-medium text-gray-800 transition hover:bg-gray-400"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
