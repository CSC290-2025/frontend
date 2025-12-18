const API_BASE = import.meta.env.VITE_API_URL ?? '';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token'); // ถ้าใช้ bearer token
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function httpGet<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...authHeaders(),
    },
    credentials: 'include', // ✅ สำหรับ cookie session
  });

  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  if (!res.ok) throw new Error(text || `Request failed: ${res.status}`);
  if (!contentType.includes('application/json')) {
    throw new Error(
      `Expected JSON but got "${contentType}". url=${url}, body=${text.slice(0, 80)}`
    );
  }

  return JSON.parse(text) as T;
}
