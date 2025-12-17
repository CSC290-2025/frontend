import React, { useEffect, useMemo, useState } from 'react';
import { Check, User } from 'lucide-react';

interface Props {
  emergencyContact: string;
  onContactChange: (val: string) => void;
  onAdminLoginRequest: () => void;
}

const STORAGE_KEY = 'healthcare_patient_profile';

const UserProfilePage: React.FC<Props> = ({
  emergencyContact,
  onContactChange,
  onAdminLoginRequest,
}) => {
  const [hasApplied, setHasApplied] = useState(false);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [dob, setDob] = useState('');
  const [bloodType, setBloodType] = useState('');

  const persistProfile = (payload: {
    patientId: number;
    dob: string;
    bloodType: string;
    emergencyContact: string;
  }) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as {
        patientId?: number;
        dob?: string;
        bloodType?: string;
        emergencyContact?: string;
      };
      if (parsed.patientId) {
        setHasApplied(true);
        setPatientId(parsed.patientId);
        setDob(parsed.dob ?? '');
        setBloodType(parsed.bloodType ?? '');
        if (parsed.emergencyContact) {
          onContactChange(parsed.emergencyContact);
        }
      }
    } catch {
      // ignore invalid cache
    }
  }, [onContactChange]);

  useEffect(() => {
    if (!hasApplied || patientId === null) return;
    persistProfile({
      patientId,
      dob,
      bloodType,
      emergencyContact,
    });
  }, [hasApplied, patientId, dob, bloodType, emergencyContact]);

  const patientLabel = useMemo(() => {
    if (!patientId) return 'Assigned after applying';
    return `Patient ID: ${patientId}`;
  }, [patientId]);

  const handleApply = () => {
    if (hasApplied) return;
    const generatedId =
      patientId ??
      Math.floor(100000 + Math.random() * 900000); /* simple unique-enough id */
    setPatientId(generatedId);
    setHasApplied(true);
    persistProfile({
      patientId: generatedId,
      dob,
      bloodType,
      emergencyContact,
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Patient enrolment
            </h2>
            <p className="text-sm text-gray-600">
              Apply once to get a permanent patient ID and manage your details.
            </p>
          </div>
          {!hasApplied ? (
            <button
              onClick={handleApply}
              className="rounded-lg bg-[#01CCFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0091B5]"
            >
              Apply as patient
            </button>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Check className="h-4 w-4" />
              Patient profile active
            </span>
          )}
        </div>

        {hasApplied && (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-gray-700">
              Patient ID
              <input
                className="mt-1 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800"
                value={patientLabel}
                disabled
                aria-readonly
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Blood type
              <select
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#01CCFF] focus:outline-none"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Date of birth
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#01CCFF] focus:outline-none"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Emergency contact
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
                <User className="h-4 w-4 text-gray-500" />
                <input
                  className="flex-1 border-0 text-sm text-gray-800 focus:outline-none"
                  placeholder="Name / Phone"
                  value={emergencyContact}
                  onChange={(e) => onContactChange(e.target.value)}
                />
              </div>
            </label>
          </div>
        )}
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
};

export default UserProfilePage;
