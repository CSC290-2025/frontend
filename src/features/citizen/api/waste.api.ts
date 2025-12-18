import { apiClient } from '@/lib/apiClient';

export type ApiSuccess<T> = {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
};

export type DailyByType = {
  waste_type: string;
  total_weight: number;
  log_id: number;
};

export type DailyStat = {
  date: string;
  total_weight_kg: number;
  by_type: DailyByType[];
};

export type MonthlyByType = {
  waste_type: string;
  total_weight: number;
  entry_count: number;
};

export type MonthlyStat = {
  month: number;
  year: number;
  total_weight_kg: number;
  by_type: MonthlyByType[];
};

export type WasteTypeItem = {
  id?: number;
  waste_type?: string;
  name?: string;
};

export type LogWasteBody = {
  waste_type: string;
  weight_kg: number;
  note?: string;
  occurred_at?: string;
};

function normalizeStats<T>(stats: T | T[] | undefined | null): T[] {
  if (!stats) return [];
  return Array.isArray(stats) ? stats : [stats];
}

const TOKEN_KEY = 'accessToken';

function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function fetchWasteTypes(): Promise<WasteTypeItem[]> {
  const response = await apiClient.get<
    ApiSuccess<{ waste_types?: WasteTypeItem[] } | WasteTypeItem[]>
  >('/waste-types', { headers: authHeaders() });

  const payload = response.data;
  const data: any = payload.data;

  if (Array.isArray(data)) return data;
  return data?.waste_types ?? [];
}

export async function postWasteLog(body: LogWasteBody) {
  const response = await apiClient.post<ApiSuccess<{ id?: number }>>(
    '/waste/log',
    body,
    { headers: authHeaders() }
  );
  return response.data;
}

export async function fetchMonthlyWasteStats(): Promise<MonthlyStat | null> {
  const response = await apiClient.get<ApiSuccess<{ stats?: MonthlyStat }>>(
    '/waste/stats',
    { headers: authHeaders() }
  );
  return response.data.data?.stats ?? null;
}

export async function fetchDailyWasteStats(): Promise<DailyStat[]> {
  const response = await apiClient.get<
    ApiSuccess<{ stats?: DailyStat | DailyStat[] }>
  >('/waste/stats/daily', { headers: authHeaders() });

  return normalizeStats(response.data.data?.stats);
}
