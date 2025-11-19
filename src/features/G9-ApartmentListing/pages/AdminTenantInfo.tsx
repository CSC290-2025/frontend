import { useState, useEffect } from 'react';
import { useNavigate } from '@/router';
import ConfirmDelete from '@/features/G9-ApartmentListing/components/ConfirmDelete';
import EditIcon from '@/features/G9-ApartmentListing/assets/EditIcon.svg';
import BackIcon from '@/features/G9-ApartmentListing/assets/BackIcon.svg';

export default function AdminTenantInfo() {
  const navigate = useNavigate();
  const apartmentName = 'Current Tenants';

  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('bookingData');
    if (saved) {
      const data = JSON.parse(saved);

      setTenants([
        {
          id: 1,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email,
          roomType: data.roomType,
          checkin: data.checkin,
        },
      ]);
    }
  }, []);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleEndContractClick = (id: number) => {
    setSelectedId(id);
    setShowPopup(true);
  };

  const confirmEndContract = () => {
    if (selectedId !== null) {
      setTenants((prev) => prev.filter((t) => t.id !== selectedId));
    }
    setShowPopup(false);
  };

  return (
    <div className="font-poppins flex min-h-screen flex-col items-center bg-[#F9FAFB] px-4 py-10">
      <div className="mb-6 flex w-full max-w-5xl items-center gap-3">
        <a
          href="/AdminListedAPT"
          className="flex h-10 w-10 items-center justify-center rounded-full transition duration-200 hover:bg-gray-100"
        >
          <img src={BackIcon} alt="Back" className="h-7 w-7" />
        </a>
        <h1 className="text-[48px] font-bold text-gray-900">
          Tenant Information
        </h1>
      </div>

      <div className="mb-6 flex w-full max-w-5xl items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">{apartmentName}</h2>
      </div>

      <div className="w-full max-w-5xl space-y-6">
        {tenants.map((tenant) => (
          <div
            key={tenant.id}
            className="flex cursor-pointer flex-col items-center rounded-xl border border-gray-200 bg-white p-5 shadow-md transition hover:shadow-lg md:flex-row md:items-start"
          >
            <div className="mt-4 flex-1 md:mt-0 md:ml-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {tenant.firstName} {tenant.lastName}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{tenant.phone}</p>
              <p className="text-sm text-gray-600">{tenant.email}</p>
              <p className="text-sm text-gray-700">
                Check-in: <span className="font-medium">{tenant.checkin}</span>
              </p>
            </div>

            <div
              className="md:ml- 4 mt-4 flex flex-col items-end gap-20 md:mt-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => navigate('/AdminEditTenant')}
                className="flex items-center justify-center gap-2 px-3 py-2 font-medium text-gray-700"
              >
                <img src={EditIcon} alt="Edit" className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleEndContractClick(tenant.id)}
                className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-2 font-medium text-[#2B5991] hover:bg-gray-200"
              >
                End Contract
              </button>
            </div>
          </div>
        ))}
      </div>

      {showPopup && (
        <ConfirmDelete
          message="Are you sure you want to end this contract?"
          onConfirm={confirmEndContract}
          onCancel={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
