// import { useState, useEffect } from 'react';
// import { APT } from '@/features/G9-ApartmentListing/hooks/index';

// import ConfirmDelete from '@/features/G9-ApartmentListing/components/ConfirmDelete';
// import SuccessModal from '@/features/G9-ApartmentListing/components/SuccessModal';

// import EditIcon from '@/features/G9-ApartmentListing/assets/EditIcon.svg';
// import LocationIcon from '@/features/G9-ApartmentListing/assets/LocationIcon.svg';
// import StarIcon from '@/features/G9-ApartmentListing/assets/StarIcon.svg';
// import GrayStarIcon from '@/features/G9-ApartmentListing/assets/GrayStarIcon.svg';
// import BackIcon from '@/features/G9-ApartmentListing/assets/BackIcon.svg';
// import PhoneIcon from '@/features/G9-ApartmentListing/assets/PhoneIcon.svg';

// interface ApartmentAPI {
//   apartmentId: number;
//   apartmentName: string;
//   apartment_location: string;
//   apartment_phone: string;
//   apartment_img?: string | null;
//   rating?: number | null;
//   reviews?: number | null;
// }

// export default function AdminListedAPT() {
//   const currentUserId = 3;

//   // use react-query hook to fetch apartments by user
//   const { data: apartmentsData, isLoading } = APT.useApartmentsByUser(currentUserId);

//   // local copy so we can support client-side delete without mutation
//   const [localApartments, setLocalApartments] = useState<ApartmentAPI[]>([]);

//   useEffect(() => {
//     if (Array.isArray(apartmentsData)) {
//       setLocalApartments(apartmentsData as ApartmentAPI[]);
//     } else {
//       setLocalApartments([]);
//     }
//   }, [apartmentsData]);

//   const [showPopup, setShowPopup] = useState(false);
//   const [selectedId, setSelectedId] = useState<number | null>(null);

//   const [showSuccess, setShowSuccess] = useState(false);
//   const apartments = localApartments;

//   // -------------------------------
//   // Delete (Frontend only)
//   // -------------------------------
//   const handleDeleteClick = (id: number) => {
//     setSelectedId(id);
//     setShowPopup(true);
//   };

//   const confirmDelete = () => {
//     if (selectedId !== null) {
//       setLocalApartments((prev) => prev.filter((apt) => apt.apartmentId !== selectedId));
//     }
//     setShowPopup(false);

//     setShowSuccess(true);
//     setTimeout(() => setShowSuccess(false), 2000);
//   };

//   // -------------------------------
//   // Loading State (from react-query)
//   // -------------------------------
//   if (isLoading) {
//     return (
//       <div className="flex h-screen w-full items-center justify-center text-xl">
//         Loading...
//       </div>
//     );
//   }

//   return (
//     <div className="font-poppins flex min-h-screen flex-col items-center bg-[#F9FAFB] px-4 py-10">
//       {/* Header */}
//       <div className="mb-6 flex w-full max-w-5xl items-center gap-3">
//         <a
//           href="/ApartmentHomepage"
//           className="flex h-10 w-10 items-center justify-center rounded-full transition duration-200 hover:bg-gray-100"
//         >
//           <img src={BackIcon} alt="Back" className="h-7 w-7" />
//         </a>
//         <h1 className="text-[48px] font-bold text-gray-900">
//           My Listed Apartment
//         </h1>
//       </div>

//       <div className="mb-6 flex w-full max-w-5xl items-center justify-between">
//         <h2 className="text-[18px] font-semibold text-gray-800">
//           Your Apartment
//         </h2>
//         <a
//           href="/AdminAddAPT"
//           className="flex items-center gap-2 rounded-lg bg-[#01CEF8] px-4 py-2 font-medium text-white hover:bg-[#4E8FB1]"
//         >
//           Add Apartment
//         </a>
//       </div>

//       {/* Apartment Cards */}
//       <div className="w-full max-w-5xl space-y-6">
//         {apartments.map((apt) => (
//           <div
//             key={apt.apartmentId}
//             onClick={() =>
//               (window.location.href = `/AdminTenantInfo?id=${apt.apartmentId}`)
//             }
//             className="flex cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-md transition hover:shadow-lg md:flex-row md:items-start"
//           >
//             <img
//               src={
//                 apt.apartment_img ??
//                 "https://placehold.co/300x200?text=No+Image"
//               }
//               alt={apt.apartmentName}
//               className="h-48 w-full rounded-xl object-cover md:w-64"
//             />

//             <div className="mt-4 flex-1 md:mt-0 md:ml-6">
//               <h3 className="text-[24px] font-bold text-gray-800">
//                 {apt.apartmentName}
//               </h3>

//               {/* Rating */}
//               <div className="mt-1 flex items-center gap-2">
//                 <p className="text-[18px] text-gray-700">
//                   {(apt.rating ?? 0).toFixed(1)}
//                 </p>

//                 <div className="flex">
//                   {Array.from({ length: 5 }, (_, i) => {
//                     const filledStars = Math.floor(apt.rating ?? 0);
//                     return (
//                       <img
//                         key={i}
//                         src={i < filledStars ? StarIcon : GrayStarIcon}
//                         alt="Star"
//                         className="h-6 w-6"
//                       />
//                     );
//                   })}
//                 </div>

//                 <span className="text-[18px] text-gray-600">
//                   ({apt.reviews ?? 0})
//                 </span>
//               </div>

//               {/* Location */}
//               <div className="mt-2 flex items-center text-[16px] text-gray-600">
//                 <img
//                   src={LocationIcon}
//                   alt="Location"
//                   className="mr-2 h-6 w-6"
//                 />
//                 <p className="mt-2 text-[18px] text-gray-700">
//                   {apt.apartment_location}
//                 </p>
//               </div>

//               {/* Phone */}
//               <div className="mt-2 flex items-center text-[16px] text-gray-600">
//                 <img src={PhoneIcon} alt="Phone" className="mr-3 h-5 w-5" />
//                 <p className="text-[18px] text-gray-700">
//                   {apt.apartment_phone}
//                 </p>
//               </div>
//             </div>

//             {/* Edit + Delete */}

//             <div
//               className="mt-4 flex flex-col items-end gap-20 md:mt-0 md:ml-4"
//               onClick={(e) => e.stopPropagation()}
//             >
//               {/* Edit Button */}
//               <a
//                 href={`/AdminEditAPT?id=${apt.apartmentId}`}
//                 className="flex items-center justify-center gap-2 px-3 py-2 font-medium text-gray-700"
//               >
//                 <img src={EditIcon} alt="Edit" className="h-5 w-5" />
//               </a>

//               {/* Delete Button */}
//               <button
//                 onClick={() => handleDeleteClick(apt.apartmentId)}
//                 className="mt-8 flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-7 py-2 font-medium text-[#2B5991] hover:bg-gray-200"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {showPopup && (
//         <ConfirmDelete
//           message="Delete this Apartment?"
//           onConfirm={confirmDelete}
//           onCancel={() => setShowPopup(false)}
//         />
//       )}

//       {showSuccess && <SuccessModal message="Deleted Successfully" />}
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
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

export default function AdminListedAPT() {
  const currentUserId = 3; // TODO: replace with real auth user id

  const {
    data: apartmentsData,
    isLoading,
    error,
  } = useApartmentsByUser(currentUserId);

  const [localApartments, setLocalApartments] = useState<any[]>([]);

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

  if (isLoading) {
    return (
      <div className="font-poppins flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB]">
        <div className="text-xl text-gray-600">Loading your apartments...</div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading apartments:', error);
  }

  const apartments = localApartments;

  const defaultImage = 'https://placehold.co/300x200?text=No+Image';

  return (
    <div className="font-poppins flex min-h-screen flex-col items-center bg-[#F9FAFB] px-4 py-10">
      <div className="mb-6 flex w-full max-w-5xl items-center gap-3">
        <a
          href="/ApartmentHomepage"
          className="flex h-10 w-10 items-center justify-center rounded-full transition duration-200 hover:bg-gray-100"
        >
          <img src={BackIcon} alt="Back" className="h-7 w-7" />
        </a>
        <h1 className="text-[48px] font-bold text-gray-900">
          My Listed Apartment
        </h1>
      </div>

      <div className="mb-6 flex w-full max-w-5xl items-center justify-between">
        <h2 className="text-[18px] font-semibold text-gray-800">
          Your Apartment
        </h2>
        <a
          href="/AdminAddAPT"
          className="flex items-center gap-2 rounded-lg bg-[#01CEF8] px-4 py-2 font-medium text-white hover:bg-[#4E8FB1]"
        >
          Add Apartment
        </a>
      </div>

      <div className="w-full max-w-5xl space-y-6">
        {apartments.length > 0 ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          apartments.map((apt: any) => {
            const id = apt.apartmentId ?? apt.id;
            const name = apt.apartmentName ?? apt.name;
            const image = apt.apartment_img ?? apt.image ?? defaultImage;
            const rating = Number(apt.rating ?? 0);
            const reviews = apt.reviews ?? 0;
            const address = apt.apartment_location ?? apt.address ?? '';
            const phone = apt.apartment_phone ?? apt.phone ?? '';

            return (
              <div
                key={id}
                onClick={() =>
                  (window.location.href = `/AdminTenantInfo?id=${id}`)
                }
                className="flex cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-md transition hover:shadow-lg md:flex-row md:items-start"
              >
                <img
                  src={image}
                  alt={name}
                  className="h-48 w-full rounded-xl object-cover md:w-64"
                />

                <div className="mt-4 flex-1 md:mt-0 md:ml-6">
                  <h3 className="text-[24px] font-bold text-gray-800">
                    {name}
                  </h3>

                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-[18px] text-gray-700">
                      {rating.toFixed(1)}
                    </p>

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

                    <span className="text-[18px] text-gray-600">
                      ({reviews})
                    </span>
                  </div>

                  <div className="mt-2 flex items-center text-[16px] text-gray-600">
                    <img
                      src={LocationIcon}
                      alt="Location"
                      className="mr-2 h-6 w-6"
                    />
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
                    href={`/AdminEditAPT?id=${id}`}
                    className="flex items-center justify-center gap-2 px-3 py-2 font-medium text-gray-700"
                  >
                    <img src={EditIcon} alt="Edit" className="h-5 w-5" />
                  </a>

                  <button
                    onClick={() => handleDeleteClick(id)}
                    className="mt-8 flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-7 py-2 font-medium text-[#2B5991] hover:bg-gray-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center">
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
