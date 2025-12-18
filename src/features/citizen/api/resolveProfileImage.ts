const API_BASE = import.meta.env.VITE_API_URL ?? '';

export function resolveProfileImage(raw?: string | null) {
  if (!raw) return null;

  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;

  return `${API_BASE}${raw.startsWith('/') ? raw : `/${raw}`}`;
}
