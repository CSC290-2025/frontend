import React, { useState } from 'react';
import {
  createWeatherRating,
  type WeatherRatingRecord,
} from '../api/weather.api';

type DayRatingProps = {
  // Public location id expected by backend (maps to address_id server-side)
  locationId?: number;
  // Optional callback fired with the saved weather rating record
  onSubmitted?: (record: WeatherRatingRecord) => void;
};

const EMOJIS = [
  { value: 1, label: 'Miserable', emoji: '😡', color: 'bg-red-600' },
  { value: 2, label: 'Bad', emoji: '😞', color: 'bg-orange-600' },
  { value: 3, label: 'Okay', emoji: '😐', color: 'bg-yellow-700' },
  { value: 4, label: 'Good', emoji: '🙂', color: 'bg-yellow-400' },
  { value: 5, label: 'Perfect', emoji: '😄', color: 'bg-green-500' },
];

export default function DayRating({
  locationId,
  onSubmitted,
}: Readonly<DayRatingProps>) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedRecord, setSavedRecord] = useState<WeatherRatingRecord | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const openModal = () => {
    setSelected(null);
    setError(null);
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  const handleOverlayKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      closeModal();
    }
  };

  const submitRating = async () => {
    if (!selected) {
      setError('Please select a rating.');
      return;
    }
    if (!locationId) {
      setError('locationId not provided.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const record = await createWeatherRating({
        location_id: locationId,
        rating: selected,
      });
      setSavedRecord(record);
      onSubmitted?.(record);
      setOpen(false);
    } catch (err: any) {
      console.error('DayRating submit error', err);
      setError(err?.message ?? 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const current = savedRecord
    ? EMOJIS.find((e) => e.value === Number(savedRecord.rating))
    : null;

  return (
    <>
      {/* compact card */}
      <div className="inline-flex items-center gap-3">
        <div className="rounded-lg border bg-white p-3 shadow-sm select-none">
          <div className="text-xs text-gray-500">Overall Weather Today</div>
          {current ? (
            <div className="mt-1 flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-white ${current.color}`}
              >
                {current.emoji}
              </div>
              <div className="text-sm font-semibold">{current.label} !</div>
            </div>
          ) : (
            <button
              onClick={openModal}
              className="mt-2 flex items-center gap-2 rounded px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 active:opacity-80"
            >
              <span>Tap to rate</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full border">
                ＋
              </span>
            </button>
          )}
        </div>
      </div>

      {/* modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close rating modal"
            onClick={closeModal}
            onKeyDown={handleOverlayKeyDown}
          />
          <div className="relative z-10 w-[92%] max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  How is the weather today?
                </h3>
                <p className="text-sm text-gray-500">
                  Pick the emoji that fits best
                </p>
              </div>
              <button className="ml-4 text-gray-400" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="mt-4 flex gap-3">
              {EMOJIS.map((e) => (
                <button
                  key={e.value}
                  onClick={() => setSelected(e.value)}
                  className={`flex w-full flex-col items-center gap-2 rounded-lg border p-3 text-center ${
                    selected === e.value ? 'ring-2 ring-blue-400' : ''
                  }`}
                  type="button"
                >
                  <div className="text-2xl">{e.emoji}</div>
                  <div className="text-xs text-gray-600">{e.label}</div>
                </button>
              ))}
            </div>

            {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

            <div className="mt-6 flex justify-center">
              <button
                onClick={submitRating}
                disabled={submitting}
                className="rounded bg-blue-400 px-6 py-2 text-white disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
