import React, { useEffect, useState } from 'react';
import {
  createWeatherRating,
  fetchUserWeatherRating,
  type WeatherRatingRecord,
} from '../api/weather.api';

type DayRatingProps = {
  // Public location id expected by backend (maps to address_id server-side)
  locationId?: number;
  // Authenticated user id (required by backend)
  userId?: number;
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
  userId,
  onSubmitted,
}: Readonly<DayRatingProps>) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedRecord, setSavedRecord] = useState<WeatherRatingRecord | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);

  // pressed states for click-and-hold animations
  const [pressedCompact, setPressedCompact] = useState(false);
  const [pressedEmoji, setPressedEmoji] = useState<number | null>(null);
  const [pressedSubmit, setPressedSubmit] = useState(false);

  const openModal = () => {
    setSelected(savedRecord ? Number(savedRecord.rating) : null);
    setError(null);
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  useEffect(() => {
    let active = true;
    if (!locationId || !userId) {
      setSavedRecord(null);
      setSelected(null);
      return () => {
        active = false;
      };
    }

    const loadExisting = async () => {
      setLoadingExisting(true);
      setError(null);
      try {
        const existing = await fetchUserWeatherRating({
          location_id: locationId,
        });
        if (!active) return;
        setSavedRecord(existing);
        setSelected(existing ? Number(existing.rating) : null);
      } catch (err: any) {
        if (!active) return;
        console.error('DayRating fetch error', err);
        setError(err?.message ?? 'Unable to load your rating');
        setSavedRecord(null);
      } finally {
        if (active) setLoadingExisting(false);
      }
    };

    loadExisting();

    return () => {
      active = false;
    };
  }, [locationId, userId]);

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
    if (!userId) {
      setError('Please sign in to submit a rating.');
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
        <div
          className={`rounded-lg border bg-white p-3 shadow-sm transition-transform duration-150 select-none ${
            pressedCompact
              ? 'scale-[0.97] shadow-md'
              : 'hover:scale-[1.02] hover:shadow-md'
          }`}
          onMouseDown={() => setPressedCompact(true)}
          onMouseUp={() => setPressedCompact(false)}
          onMouseLeave={() => setPressedCompact(false)}
          onTouchStart={() => setPressedCompact(true)}
          onTouchEnd={() => setPressedCompact(false)}
        >
          <div className="text-xs text-gray-500">Overall Weather Today</div>
          {loadingExisting ? (
            <div className="mt-2 text-sm text-gray-500">
              Loading your rating...
            </div>
          ) : current ? (
            <div className="mt-1 space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-white ${current.color}`}
                >
                  {current.emoji}
                </div>
                <div className="text-sm font-semibold">{current.label} !</div>
              </div>
              <button
                onClick={openModal}
                className="text-xs font-medium text-blue-600 underline"
              >
                Update rating
              </button>
            </div>
          ) : (
            <button
              onClick={openModal}
              onMouseDown={() => setPressedCompact(true)}
              onMouseUp={() => setPressedCompact(false)}
              onMouseLeave={() => setPressedCompact(false)}
              onTouchStart={() => setPressedCompact(true)}
              onTouchEnd={() => setPressedCompact(false)}
              className="mt-2 flex items-center gap-2 rounded px-3 py-1 text-sm font-medium text-gray-700 transition-transform duration-100"
            >
              <span className="transform">
                {pressedCompact ? 'Tap to rate' : 'Tap to rate'}
              </span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border transition-transform duration-100 ${
                  pressedCompact ? 'scale-[0.92] bg-gray-100' : ''
                }`}
              >
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
                  onMouseDown={() => setPressedEmoji(e.value)}
                  onMouseUp={() => setPressedEmoji(null)}
                  onMouseLeave={() => setPressedEmoji(null)}
                  onTouchStart={() => setPressedEmoji(e.value)}
                  onTouchEnd={() => setPressedEmoji(null)}
                  type="button"
                  className={`flex w-full flex-col items-center gap-2 rounded-lg border-transparent bg-transparent p-3 text-center transition-transform duration-100 ${selected === e.value ? 'bg-blue-50 ring-2 ring-blue-400' : ''} ${pressedEmoji === e.value ? 'scale-[0.95]' : 'hover:scale-[1.03]'}`}
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
                onMouseDown={() => setPressedSubmit(true)}
                onMouseUp={() => setPressedSubmit(false)}
                onMouseLeave={() => setPressedSubmit(false)}
                onTouchStart={() => setPressedSubmit(true)}
                onTouchEnd={() => setPressedSubmit(false)}
                disabled={submitting}
                className={`rounded bg-blue-400 px-6 py-2 text-white transition-transform duration-100 disabled:opacity-60 ${
                  pressedSubmit
                    ? 'scale-[0.97] shadow-md'
                    : 'hover:scale-[1.02]'
                }`}
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
