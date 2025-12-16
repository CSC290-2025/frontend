// src/App.tsx
import { useEffect, useState } from 'react';
import { ShimmerButton } from '@/components/ui/shimmer-button'; //pnpm dlx shadcn@latest add @magicui/shimmer-button
import { AuroraText } from '@/components/ui/aurora-text';
import { getBaseAPIURL } from '@/lib/apiClient.ts'; //pnpm dlx shadcn@latest add @magicui/aurora-text

// type
type LocalImg = { file: File; url: string };
type DetectResponse = {
  ok: boolean;
  has_issue?: boolean;
  confidence?: number;
  types?: string[];
  reasons?: string[];
  category?: 'harm' | 'health' | 'trash' | 'traffic' | 'other';
  marker?: {
    id: string;
    lat: number;
    lng: number;
    description?: string | null;
  } | null;
  message?: string;
};
const API_PATH = getBaseAPIURL + '/api/detect-harm';

// component
export default function DetectHarm() {
  const [img, setImg] = useState<LocalImg | null>(null);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [loading, setLoad] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [res, setRes] = useState<DetectResponse | null>(null);

  useEffect(
    () => () => {
      if (img) URL.revokeObjectURL(img.url);
    },
    [img]
  );

  // choose img and preview
  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      alert('Please select an image file');
      e.target.value = '';
      return;
    }
    if (img) URL.revokeObjectURL(img.url);
    setRes(null);
    setError(null);
    setImg({ file: f, url: URL.createObjectURL(f) });
  };

  //get current position
  const useCurrentLocation = async () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    try {
      const pos = await new Promise<GeolocationPosition>((ok, no) =>
        navigator.geolocation.getCurrentPosition(ok, no, {
          enableHighAccuracy: true,
          timeout: 8000,
        })
      );
      setLat(String(pos.coords.latitude));
      setLng(String(pos.coords.longitude));
    } catch (e: any) {
      alert('Cannot get location: ' + (e?.message ?? e));
    }
  };

  // send img and location
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!img) return alert('Please choose an image');

    setLoad(true);
    setError(null);
    setRes(null);
    try {
      const fd = new FormData();
      fd.append('image', img.file);
      if (lat.trim() && lng.trim()) {
        fd.append('lat', lat.trim());
        fd.append('lng', lng.trim());
      }

      const r = await fetch(API_PATH, { method: 'POST', body: fd });
      const data = (await r.json()) as DetectResponse;
      if (!r.ok || !data.ok)
        throw new Error(data.message || `Request failed: ${r.status}`);
      setRes(data);
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally {
      setLoad(false);
    }
  };

  // clear all
  const clearAll = () => {
    if (img) URL.revokeObjectURL(img.url);
    setImg(null);
    setLat('');
    setLng('');
    setRes(null);
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="w-full text-center text-xl font-semibold tracking-tight">
          <AuroraText>Detect issue</AuroraText>
        </h1>

        {/* from */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* select img */}
          <label className="block">
            <span className="text-sm font-medium">Select image</span>
            <input
              type="file"
              accept="image/*"
              onChange={pickFile}
              className="mt-2 w-full cursor-pointer rounded-lg border px-3 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-black file:px-3 file:py-2 file:text-white"
            />
          </label>

          {/* preview box */}
          {img && (
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="h-56 w-56 overflow-hidden rounded-xl border bg-gray-100">
                  <img
                    src={img.url}
                    alt={img.file.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <p className="text-center text-xs text-gray-500">
                {img.file.name} Â· {(img.file.size / 500 / 500).toFixed(2)} MB
              </p>
            </div>
          )}

          {/* location and type location */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Location (lat, lng)</span>
              <button
                type="button"
                onClick={useCurrentLocation}
                className="rounded-md bg-gray-900 px-2 py-1 text-xs text-white hover:bg-gray-800"
              >
                Use current location
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="lat"
                placeholder="enter latitude"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                inputMode="decimal"
                className="rounded-lg border px-3 py-2 text-sm"
              />
              <input
                name="lng"
                placeholder="enter longitude"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                inputMode="decimal"
                className="rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* button */}
          <div className="flex justify-center gap-3">
            {/* <button
            {/* <button
              type="submit"
              className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
              disabled={loading || !img}
            >
              {loading ? 'Detecting...' : 'Detect Harm'}
            </button> */}

            <ShimmerButton>
              {' '}
              {loading ? 'Detecting...' : 'Detect issue'}{' '}
            </ShimmerButton>

            <button
              type="button"
              onClick={clearAll}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-60"
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </form>

        {error && <div className="text-sm text-red-600">{error}</div>}

        {res && (
          <div className="space-y-1 rounded-xl border bg-gray-50 p-3 text-sm">
            <div>
              <b>has_issue:</b> {res.has_issue ? 'YES' : 'No'}
            </div>
            {typeof res.confidence === 'number' && (
              <div>
                <b>Confidence:</b> {(res.confidence * 100).toFixed(1)}%
              </div>
            )}
            {!!res.types?.length && (
              <div>
                <b>Types:</b> {res.types.join(', ')}
              </div>
            )}
            {res.category && (
              <div>
                <b>Category:</b> {res.category}
              </div>
            )}
            {!!res.reasons?.length && (
              <div>
                <b>Reasons:</b>
                <ul className="ml-5 list-disc">
                  {res.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {res?.marker && (
              <div>
                <b>Marker:</b> lat {res.marker.lat}, lng {res.marker.lng}
              </div>
            )}
          </div>
        )}

        {!img && !res && (
          <p className="text-center text-sm text-gray-500">No image selected</p>
        )}
      </div>
    </div>
  );
}
