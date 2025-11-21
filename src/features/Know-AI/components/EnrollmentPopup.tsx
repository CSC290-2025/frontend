export default function EnrollmentPopup() {
  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
        <button className="absolute top-6 right-6 text-gray-400 transition-colors hover:text-gray-600">
          <svg
            className="h-6 w-6"
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

        <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
          Enroll Course
        </h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium text-gray-900">
                Firstname
              </label>
              <input
                type="text"
                defaultValue="Nateetan"
                className="w-full rounded-full bg-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-[#01CCFF] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block font-medium text-gray-900">
                Lastname
              </label>
              <input
                type="text"
                defaultValue="Buapasert"
                className="w-full rounded-full bg-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-[#01CCFF] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium text-gray-900">
                Phone Number
              </label>
              <input
                type="tel"
                defaultValue="0897895678"
                className="w-full rounded-full bg-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-[#01CCFF] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block font-medium text-gray-900">
                Email
              </label>
              <input
                type="email"
                defaultValue="nateetan@gmail.com"
                className="w-full rounded-full bg-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-[#01CCFF] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl bg-gray-50 p-6">
            <h3 className="mb-4 text-xl font-bold text-gray-900">Detail</h3>

            <div className="flex gap-2">
              <span className="font-medium text-gray-900">Course:</span>
              <span className="font-medium text-[#01CCFF]">What is AI?</span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium text-gray-900">Teacher:</span>
              <span className="font-medium text-[#01CCFF]">
                Warrapratch Chokun
              </span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium text-gray-900">Time:</span>
              <span className="font-medium text-[#01CCFF]">18:00 - 20:00</span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium text-gray-900">Place:</span>
              <span className="font-medium text-[#01CCFF]">
                Siam Paragon Hall (FI.3)
              </span>
            </div>
          </div>

          <button className="w-full rounded-full bg-[#7FFF7F] py-4 text-xl font-bold text-white shadow-md transition-colors duration-200 hover:bg-[#6FEF6F]">
            Enroll now!
          </button>
        </div>
      </div>
    </div>
  );
}
