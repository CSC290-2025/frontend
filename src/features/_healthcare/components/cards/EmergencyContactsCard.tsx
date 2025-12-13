import React from 'react';

interface EmergencyContactsCardProps {
  primaryContact: string;
  secondaryContact: string;
  onPrimaryChange: (value: string) => void;
  onSecondaryChange: (value: string) => void;
  totalContacts?: number;
  error?: string;
}

export const EmergencyContactsCard: React.FC<EmergencyContactsCardProps> = ({
  primaryContact,
  secondaryContact,
  onPrimaryChange,
  onSecondaryChange,
  totalContacts,
  error,
}) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-lg font-bold text-gray-900">SOS Emergency</h2>
        <p className="text-sm text-gray-600">
          Emergency contact Management{' '}
          {typeof totalContacts === 'number' ? `(${totalContacts} linked)` : ''}
        </p>
      </div>
      {error && (
        <span className="text-sm font-semibold text-red-500">{error}</span>
      )}
    </div>
    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <label className="flex flex-1 flex-col text-sm">
        <span className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Primary Contact
        </span>
        <input
          value={primaryContact}
          onChange={(event) => onPrimaryChange(event.target.value)}
          placeholder="XXXX"
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 focus:outline-none"
        />
      </label>
      <label className="flex flex-1 flex-col text-sm">
        <span className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Secondary Contact
        </span>
        <input
          value={secondaryContact}
          onChange={(event) => onSecondaryChange(event.target.value)}
          placeholder="ZZZZZZ"
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 focus:outline-none"
        />
      </label>
      <div className="flex items-end">
        <button className="w-full rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 sm:w-auto">
          Update Contacts
        </button>
      </div>
    </div>
  </section>
);
