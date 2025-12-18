export default function LevelBadge({
  title,
  active,
}: {
  title: string;
  active: boolean;
}) {
  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      {active && (
        <div className="absolute inset-0 scale-90 animate-pulse rounded-full bg-white opacity-50 blur-2xl" />
      )}

      <div
        className={`relative z-10 flex h-28 w-28 flex-col items-center justify-center overflow-hidden rounded-full text-center transition-all duration-300 ease-out sm:h-32 sm:w-32 ${
          active
            ? 'scale-105 bg-linear-to-br from-[#6FBF44] to-emerald-600 text-white shadow-2xl ring-[5px] shadow-green-500/40 ring-white/30'
            : 'bg-white text-gray-300 ring-4 ring-gray-100 grayscale'
        } `}
      >
        {/* Icon */}
        <div className="mb-1 shrink-0 pt-1">
          {active ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-10 w-10 drop-shadow-md"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            // Icon when Inactive
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-10 w-10 opacity-50"
            >
              <path
                fillRule="evenodd"
                d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>

        {/* Title */}
        <div className="flex w-full items-center justify-center px-2 pb-1">
          <span
            className={`text-center leading-none font-bold tracking-wide uppercase drop-shadow-sm ${title.length > 10 ? 'text-[10px] sm:text-[11px]' : 'text-xs sm:text-sm'} `}
          >
            {title}
          </span>
        </div>
      </div>
    </div>
  );
}
