import { useState } from 'react';
import ConfirmDelete from '@/features/G9-ApartmentListing/components/ConfirmDelete';
import EditIcon from '@/features/G9-ApartmentListing/assets/EditIcon.svg';
import LocationIcon from '@/features/G9-ApartmentListing/assets/LocationIcon.svg';
import StarIcon from '@/features/G9-ApartmentListing/assets/StarIcon.svg';
import GrayStarIcon from '@/features/G9-ApartmentListing/assets/GrayStarIcon.svg';

export default function AdminListedAPT() {
  const [apartments, setApartments] = useState([
    {
      id: 1,
      name: 'Cosmo Mansion',
      rating: 4.0,
      reviews: 17,
      address: 'Pracha Uthit road, Bangmod, Thungkru, Bangkok',
      phone: '081-234-5678',
      image:
        'https://bcdn.renthub.in.th/listing_picture/201603/20160323/KFVR1t5u5w6KhpFVDWLY.jpg?class=moptimized',
    },
  ]);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setShowPopup(true);
  };

  const confirmDelete = () => {
    if (selectedId !== null) {
      setApartments((prev) => prev.filter((apt) => apt.id !== selectedId));
    }
    setShowPopup(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F9FAFB] px-4 py-10">
      <div className="mb-6 w-full max-w-5xl">
        <h1 className="text-4xl font-bold">My Listed Apartment</h1>
      </div>

      <div className="mb-6 flex w-full max-w-5xl items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Your Apartment</h2>
        <a
          href="/AdminAddAPT"
          className="flex items-center gap-2 rounded-lg bg-[#01CEF8] px-4 py-2 font-medium text-white hover:bg-[#4E8FB1]"
        >
          Add Apartment
        </a>
      </div>

      <div className="w-full max-w-5xl space-y-6">
        {apartments.map((apt) => (
          <div
            key={apt.id}
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-md transition hover:shadow-lg md:flex-row md:items-start"
          >
            <img
              src={apt.image}
              alt={apt.name}
              className="h-40 w-full rounded-xl object-cover md:w-48"
            />

            <div className="mt-4 flex-1 md:mt-0 md:ml-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {apt.name}
              </h3>

              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm text-gray-700">{apt.rating.toFixed(1)}</p>

                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => {
                    const filledStars = Math.floor(apt.rating);
                    return (
                      <img
                        key={i}
                        src={i < filledStars ? StarIcon : GrayStarIcon}
                        alt={i < filledStars ? 'Star' : 'Gray Star'}
                        className="h-4 w-4"
                      />
                    );
                  })}
                </div>

                <span className="text-sm text-gray-600">({apt.reviews})</span>
              </div>

              <p className="mt-2 text-sm text-gray-700">{apt.address}</p>
              <p className="text-sm text-gray-700">{apt.phone}</p>
            </div>

            <div className="mt-4 flex flex-col items-end gap-20 md:mt-0 md:ml-4">
              <a
                href="/AdminEditAPT"
                className="flex items-center justify-center gap-2 px-3 py-2 font-medium text-gray-700"
              >
                <img src={EditIcon} alt="Edit" className="h-4 w-4" />
              </a>

              <button
                onClick={() => handleDeleteClick(apt.id)}
                className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-7 py-2 font-medium text-[#2B5991] hover:bg-gray-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showPopup && (
        <ConfirmDelete
          message="Are you sure you want to delete this apartment?"
          onConfirm={confirmDelete}
          onCancel={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
