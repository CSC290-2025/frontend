export default function WarningModel({
  open,
  warning,
  text,
  onClose,
}: {
  open: boolean;
  warning: string;
  text: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative w-[480px] rounded-2xl bg-gradient-to-b from-red-50 to-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-xl text-gray-600"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="mb-4 text-center text-2xl font-bold text-red-700">
          ⚠️ {warning}
        </h2>

        <div className="flex items-center justify-center">
          <div className="animate-pulse text-7xl">⚠️</div>
        </div>

        <p className="mt-4 text-center text-lg font-semibold">{text}</p>

        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center">
          <p>
            Please take necessary precautions and stay alert. Follow local
            authorities instructions.
          </p>
        </div>

        <button
          className="mt-6 w-full rounded-lg bg-red-500 py-2 text-white hover:bg-red-600"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
