export default function SubmitModal({ open, result, onClose, onNext }: any) {
  if (!open || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative m-4 w-full max-w-xl animate-[scale-in_0.2s_ease-out] rounded-3xl bg-white p-8 shadow-2xl md:p-10">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          onClick={onClose}
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Icon and Title */}
        <div className="mb-6 flex flex-col items-center">
          <div
            className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
              result.is_correct ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {result.is_correct ? (
              <svg
                className="h-10 w-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="h-10 w-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>

          <h2 className="mb-2 text-center text-3xl font-bold text-gray-800">
            {result.is_correct ? 'Excellent!' : 'Not Quite'}
          </h2>

          <p
            className={`text-center text-lg font-semibold ${
              result.is_correct ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {result.is_correct ? 'Your answer is correct' : 'Try again'}
          </p>
        </div>

        {/* Feedback From Gemini */}
        <div className="mb-8 rounded-2xl bg-linear-to-br from-blue-50 to-purple-50 p-6">
          <div className="mb-2 flex items-center gap-2">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span className="font-semibold text-gray-700">
              Feedback From Gemini
            </span>
          </div>
          <p className="leading-relaxed text-gray-700">{result.feedback}</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            className="rounded-full bg-gray-200 px-8 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-300 hover:shadow-md"
            onClick={onClose}
          >
            Back to Exercise
          </button>

          {result.is_correct && (
            <button
              className="rounded-full bg-linear-to-r from-green-400 to-green-500 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:from-green-500 hover:to-green-600 hover:shadow-xl"
              onClick={onNext}
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
