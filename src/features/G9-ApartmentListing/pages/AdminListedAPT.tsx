import { useState, useEffect } from 'react';
import '@/features/G9-ApartmentListing/styles/animations.css';
import ConfirmDelete from '@/features/G9-ApartmentListing/components/ConfirmDelete';
import SuccessModal from '@/features/G9-ApartmentListing/components/SuccessModal';
import EditIcon from '@/features/G9-ApartmentListing/assets/EditIcon.svg';
import LocationIcon from '@/features/G9-ApartmentListing/assets/LocationIcon.svg';
import StarIcon from '@/features/G9-ApartmentListing/assets/StarIcon.svg';
import GrayStarIcon from '@/features/G9-ApartmentListing/assets/GrayStarIcon.svg';
import BackIcon from '@/features/G9-ApartmentListing/assets/BackIcon.svg';
import PhoneIcon from '@/features/G9-ApartmentListing/assets/PhoneIcon.svg';
import {
  useApartmentsByUser,
  useDeleteApartment,
} from '@/features/G9-ApartmentListing/hooks/useApartment';
import { Owner, Upload } from '@/features/G9-ApartmentListing/hooks/index';
import { FollowerPointerCard } from '@/features/G9-ApartmentListing/components/following-pointer';

interface Apartment {
  apartmentId?: number;
  id?: number;
  apartmentName?: string;
  name?: string;
  apartment_location?: string;
  addresses?: {
    id: number;
    address_line?: string;
    province?: string;
    district?: string;
    subdistrict?: string;
    postal_code?: string;
  };
  apartment_phone?: string;
  phone?: string;
  apartment_img?: string;
  image?: string;
  rating?:
    | number
    | number[]
    | { avg?: number; rating?: number; count?: number };
  reviews?: number;
}

// Component to handle individual apartment with image loading
function ApartmentCard({
  apt,
  onDelete,
}: {
  apt: Apartment;
  onDelete: (id: number) => void;
}) {
  const id = apt.apartmentId ?? apt.id;
  const { data: images } = Upload.usePicturesByApartment(id || 0);

  // Early return if no ID is available
  if (!id) {
    return null;
  }

  const defaultImage =
    'https://i.pinimg.com/736x/e6/b6/87/e6b6879516fe0c7e046dfc83922626d6.jpg';

  const imageArray = images?.data?.data || images?.data || [];
  const apartmentImage =
    imageArray && imageArray.length > 0 ? imageArray[0].url : defaultImage;

  const name = apt.apartmentName ?? apt.name;
  const addressData = apt.addresses;
  const address = addressData
    ? `${addressData.address_line || ''} ${addressData.subdistrict || ''} ${addressData.district || ''} ${addressData.province || ''} ${addressData.postal_code || ''}`
    : apt.apartment_location || '';
  const phone = apt.apartment_phone ?? apt.phone ?? '';

  // Compute rating robustly — API may return a number, an object, or an array of ratings
  let rating = 0;
  let reviews = 0;

  if (Array.isArray(apt.rating)) {
    // rating is an array — try to derive numeric values from common shapes
    const values = apt.rating
      .map((r: unknown) => {
        if (typeof r === 'number') return r;
        if (
          r &&
          typeof r === 'object' &&
          'rating' in r &&
          typeof (r as { rating: unknown }).rating === 'number'
        )
          return (r as { rating: number }).rating;
        if (
          r &&
          typeof r === 'object' &&
          'value' in r &&
          typeof (r as { value: unknown }).value === 'number'
        )
          return (r as { value: number }).value;
        return NaN;
      })
      .filter((v: number) => !Number.isNaN(v));

    if (values.length > 0) {
      rating =
        values.reduce((s: number, v: number) => s + v, 0) / values.length;
      reviews = apt.reviews ?? values.length;
    } else {
      rating = Number(apt.rating ?? 0) || 0;
      reviews = apt.reviews ?? 0;
    }
  } else if (apt.rating && typeof apt.rating === 'object') {
    // possible shape: { avg: number } or { rating: number }
    rating = Number(apt.rating.avg ?? apt.rating.rating ?? 0) || 0;
    reviews = apt.reviews ?? apt.rating.count ?? 0;
  } else {
    rating = Number(apt.rating ?? 0) || 0;
    reviews = apt.reviews ?? (apt.rating ? 1 : 0);
  }

  return (
    <FollowerPointerCard
      title={'Click on an apartment to view tenant information'}
    >
      <div
        key={id}
        onClick={() => (window.location.href = `/AdminTenantInfo?id=${id}`)}
        className="flex cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-md transition hover:shadow-lg md:flex-row md:items-start"
      >
        <img
          src={apartmentImage}
          alt={name}
          className="h-48 w-full rounded-xl object-cover md:w-64"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = defaultImage;
          }}
        />

        <div className="mt-4 flex-1 md:mt-0 md:ml-6">
          <h3 className="text-[24px] font-bold text-gray-800">{name}</h3>

          <div className="mt-1 flex items-center gap-2">
            <p className="text-[18px] text-gray-700">{rating.toFixed(1)}</p>

            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => {
                const filledStars = Math.floor(rating);
                return (
                  <img
                    key={i}
                    src={i < filledStars ? StarIcon : GrayStarIcon}
                    alt={i < filledStars ? 'Star' : 'Gray Star'}
                    className="h-6 w-6"
                  />
                );
              })}
            </div>

            <span className="text-[18px] text-gray-600">({reviews})</span>
          </div>

          <div className="mt-2 flex items-center text-[16px] text-gray-600">
            <img src={LocationIcon} alt="Location" className="mr-2 h-6 w-6" />
            <p className="mt-2 text-[18px] text-gray-700">{address}</p>
          </div>

          <div className="mt-2 flex items-center text-[16px] text-gray-600">
            <img src={PhoneIcon} alt="Phone" className="mr-3 h-5 w-5" />
            <p className="text-[18px] text-gray-700">{phone}</p>
          </div>
        </div>

        <div
          className="mt-4 flex flex-col items-end gap-20 md:mt-0 md:ml-4"
          onClick={(e) => e.stopPropagation()}
        >
          <a
            href={`/AdminEditAPT?apartmentId=${id}`}
            className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 font-medium text-gray-700 transition-all duration-300 hover:scale-110 hover:bg-gray-100"
          >
            <img
              src={EditIcon}
              alt="Edit"
              className="h-5 w-5 transition-transform duration-300 hover:rotate-12"
            />
          </a>

          <button
            onClick={() => onDelete(id)}
            className="mt-8 flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-7 py-2 font-medium text-[#2B5991] transition-all duration-300 hover:scale-105 hover:border-red-300 hover:bg-red-50 hover:text-red-600 hover:shadow-md"
          >
            Delete
          </button>
        </div>
      </div>
    </FollowerPointerCard>
  );
}

export default function AdminListedAPT() {
  const { data: userData } = Owner.useUser();
  const userId = userData?.userId;
  const { data: apartmentsData, error } = useApartmentsByUser(userId);
  const [localApartments, setLocalApartments] = useState<Apartment[]>([]);
  useEffect(() => {
    // apartmentsData may be the array itself or an object with .data
    if (Array.isArray(apartmentsData)) {
      setLocalApartments(apartmentsData);
    } else if (apartmentsData?.data && Array.isArray(apartmentsData.data)) {
      setLocalApartments(apartmentsData.data);
    } else {
      setLocalApartments([]);
    }
  }, [apartmentsData]);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const deleteApartment = useDeleteApartment();

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setShowPopup(true);
  };

  const confirmDelete = () => {
    if (selectedId !== null) {
      deleteApartment.mutate(selectedId, {
        onSuccess: () => {
          setLocalApartments((prev) =>
            prev.filter((apt) => (apt.apartmentId ?? apt.id) !== selectedId)
          );
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        },
        onError: (err) => {
          console.error('Failed to delete apartment', err);
        },
      });
    }

    setShowPopup(false);
  };

  if (error) {
    console.error('Error loading apartments:', error);
  }

  const apartments = localApartments;

  return (
    <div className="font-poppins animate-fade-in flex min-h-screen flex-col items-center bg-[#F9FAFB] px-4 py-10">
      <div className="animate-slide-down mb-6 flex w-full max-w-5xl items-center gap-3">
        <a
          href="/ApartmentHomepage"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 hover:bg-gray-100"
        >
          <img
            src={BackIcon}
            alt="Back"
            className="h-7 w-7 transition-transform duration-300"
          />
        </a>
        <h1 className="text-[48px] font-bold text-gray-900 transition-colors duration-300 hover:text-blue-600">
          My Listed Apartment
        </h1>
      </div>

      <div className="animate-slide-up mb-6 flex w-full max-w-5xl items-center justify-between">
        <h2 className="text-[18px] font-semibold text-gray-800">
          Your Apartment
        </h2>
        <a
          href="/AdminAddAPT"
          className="flex items-center gap-2 rounded-lg bg-[#01CEF8] px-4 py-2 font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-[#4E8FB1] hover:shadow-lg"
        >
          Add Apartment
        </a>
      </div>

      <div className="animate-fade-in w-full max-w-5xl space-y-6">
        {apartments.length > 0 ? (
          apartments.map((apt: Apartment, index: number) => (
            <div
              key={apt.apartmentId ?? apt.id}
              className="animate-stagger"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <ApartmentCard apt={apt} onDelete={handleDeleteClick} />
            </div>
          ))
        ) : (
          <div className="animate-slide-up py-12 text-center">
            <h3 className="mb-2 text-xl font-medium text-gray-600">
              No Apartments
            </h3>
            <p className="text-gray-500">You have no listed apartments.</p>
          </div>
        )}
      </div>

      {showPopup && (
        <ConfirmDelete
          message="Delete this Apartment?"
          onConfirm={confirmDelete}
          onCancel={() => setShowPopup(false)}
        />
      )}

      {showSuccess && <SuccessModal message="Deleted Successfully" />}
    </div>
  );
}
