import React from 'react';
import { User } from 'lucide-react';

interface Props {
  emergencyContact: string;
  onContactChange: (val: string) => void;
  onAdminLoginRequest: () => void;
}

const UserProfilePage: React.FC<Props> = ({
  emergencyContact,
  onContactChange,
  onAdminLoginRequest,
}) => (
  <div className="space-y-6">
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-bold text-gray-900">Address</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="Street"
        />
        <input
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="City"
        />
        <input
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="Province/State"
        />
        <input
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="Postal code"
        />
      </div>
      <button className="mt-4 rounded-lg bg-[#01CCFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0091B5]">
        Save address
      </button>
    </section>

    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-bold text-gray-900">Emergency Contact</h2>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
          <User className="h-4 w-4 text-gray-500" />
          <input
            className="flex-1 border-0 text-sm text-gray-800 focus:outline-none"
            placeholder="Name • Phone"
            value={emergencyContact}
            onChange={(e) => onContactChange(e.target.value)}
          />
        </div>
        <button className="rounded-lg bg-[#01CCFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0091B5]">
          Save contact
        </button>
      </div>
    </section>

    <section className="rounded-2xl border border-dashed border-[#01CCFF]/30 bg-white p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Healthcare Staff Access
          </h2>
          <p className="text-sm text-gray-600">
            Sign in with staff credentials to manage hospitals and teams.
          </p>
        </div>
        <button
          onClick={onAdminLoginRequest}
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-[#0091B5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#007fa0] sm:mt-0"
        >
          Login as Healthcare Staff
        </button>
      </div>
    </section>
  </div>
);

export default UserProfilePage;
