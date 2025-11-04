import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, CalendarDays } from 'lucide-react';

type Tenant = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  roomType: string;
  checkin: string;
  apartmentName?: string;
};

export default function AdminEditTenant() {
  const navigate = useNavigate();
  const location = useLocation();
  const tenant = location.state?.tenant as Tenant | undefined;
  const apartmentName = location.state?.apartmentName || 'Current Tenant';

  const [formData, setFormData] = useState<Tenant>({
    id: tenant?.id || Date.now(),
    firstName: tenant?.firstName || '',
    lastName: tenant?.lastName || '',
    phone: tenant?.phone || '',
    email: tenant?.email || '',
    roomType: tenant?.roomType || 'Studio',
    checkin: tenant?.checkin || '',
    apartmentName,
  });

  const handleChange = <K extends keyof Tenant>(field: K, value: Tenant[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Saved tenant:', formData);
    navigate('/AdminTenantInfo', {
      state: { updatedTenant: formData, apartmentName: formData.apartmentName },
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F9FAFB] px-4 py-10">
      <div className="mb-6 w-full max-w-5xl">
        <h1 className="text-4xl font-bold text-gray-800">Edit Tenant Info.</h1>
      </div>

      <div className="w-full max-w-5xl rounded-3xl border border-gray-200 bg-white p-10 shadow-lg">
        <div className="mb-8">
          <div className="mb-3 flex items-center space-x-2">
            <User className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Personal details
            </h2>
          </div>
          <hr className="mb-6 border-gray-200" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name :
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name :
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone :
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email :
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-3 flex items-center space-x-2">
            <CalendarDays className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Room details
            </h2>
          </div>
          <hr className="mb-6 border-gray-200" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Room Type :
              </label>
              <select
                value={formData.roomType}
                onChange={(e) => handleChange('roomType', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none"
              >
                <option value="Studio">Studio</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Check-in Date :
              </label>
              <input
                type="date"
                value={formData.checkin}
                onChange={(e) => handleChange('checkin', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:ring-[#01CEF8] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="rounded-md bg-[#01CEF8] px-6 py-2 font-medium text-white hover:bg-[#4E8FB1]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
