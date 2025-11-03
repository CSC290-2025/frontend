import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Star } from 'lucide-react';
import ConfirmDelete from '../components/ConfirmDelete';

export default function AdminListedAPT() {
  const navigate = useNavigate();

  const [apartments, setApartments] = useState([
    {
      id: 1,
      name: 'Cosmo Mansion',
      rating: 4.0,
      reviews: 17,
      address: 'Pracha Uthit road, Bangmod, Thungkru, Bangkok',
      phone: '02 xxx xxxx',
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
        <button
          onClick={() => navigate('/AdminAddAPT')}
          className="flex items-center gap-2 rounded-lg bg-[#01CEF8] px-4 py-2 font-medium text-white hover:bg-[#4E8FB1]"
        >
          Add Apartment
        </button>
      </div>

      <div className="w-full max-w-5xl space-y-6">
        {apartments.map((apt) => (
          <div
            key={apt.id}
            className="flex cursor-pointer flex-col items-center rounded-xl border border-gray-200 bg-white p-5 shadow-md transition hover:shadow-lg md:flex-row md:items-start"
            onClick={() =>
              navigate('/AdminTenantInfo', {
                state: { apartmentName: apt.name },
              })
            }
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
              <div className="flex items-center gap-1 text-sm text-yellow-500">
                {Array.from({ length: apt.rating }).map((_, i) => (
                  <Star key={i} size={16} fill="#FFD700" stroke="#FFD700" />
                ))}
                <span className="ml-1 text-gray-600">({apt.reviews})</span>
              </div>
              <p className="mt-2 text-sm text-gray-700">{apt.address}</p>
              <p className="text-sm text-gray-700">{apt.phone}</p>
            </div>

            <div
              className="mt-4 flex flex-col items-end gap-20 md:mt-0 md:ml-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => navigate('/AdminEditAPT')}
                className="flex items-center justify-center gap-2 px-3 py-2 font-medium text-gray-700"
              >
                <Pencil size={18} />
              </button>
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
