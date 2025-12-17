import { useQuery } from '@tanstack/react-query';
import {
  fetchWeatherHourly,
  type WeatherHourlyResponse,
} from '../api/weather.api';

export const useWeatherHourly = (locationId: number) =>
  useQuery<WeatherHourlyResponse>({
    queryKey: ['weather', 'hourly', locationId],
    queryFn: () => fetchWeatherHourly(locationId),
    enabled: Number.isFinite(locationId),
    staleTime: 5 * 60 * 1000,
    // transform API result: align 5 hourly entries to UTC+7 hours,
    // start at current UTC+7 hour and pick matching API items (display API time)
    select: (data) => {
      const src = data.hourly_forecast ?? [];

      const UTC_OFFSET_HOURS = 7; // use UTC+7
      const MS_HOUR = 60 * 60 * 1000;
      const OFFSET_MS = UTC_OFFSET_HOURS * MS_HOUR;

      // now in UTC ms and corresponding UTC+7 "wall clock" date
      const nowUtcMs = Date.now();
      const nowLocalMs = nowUtcMs + OFFSET_MS;
      const nowLocal = new Date(nowLocalMs);

      // start at the current local UTC+7 hour (round down to top of hour)
      const startLocal = new Date(nowLocal.getTime());
      startLocal.setUTCMinutes(0, 0, 0);
      // use startLocal as the base local time (UTC+7 wall clock)
      const startYear = startLocal.getUTCFullYear();
      const startMonth = startLocal.getUTCMonth();
      const startDate = startLocal.getUTCDate();
      const startHour = startLocal.getUTCHours();

      // convert a UTC+7 local Y/M/D/H to UTC ms instant
      const localUtc7ToUtcMs = (
        y: number,
        m: number,
        d: number,
        h: number,
        min = 0
      ) => Date.UTC(y, m, d, h - UTC_OFFSET_HOURS, min);

      // parse an API item into a UTC ms instant; treat "HH:mm" as UTC+7 on provided reference date
      const parseItemToUtcMs = (
        item: any,
        refY: number,
        refM: number,
        refD: number
      ): number | null => {
        if (!item) return null;
        const t = item.time;
        if (!t) return null;

        // try full/ISO parse first
        const iso = Date.parse(t);
        if (!isNaN(iso)) return iso;

        // try "HH:mm" or "H:mm"
        const m = String(t).match(/^(\d{1,2}):(\d{2})$/);
        if (m) {
          const hh = parseInt(m[1], 10);
          const mm = parseInt(m[2], 10);
          return localUtc7ToUtcMs(refY, refM, refD, hh, mm);
        }

        return null;
      };

      const formatApiTimeToLocalHHmm = (
        itemTime: string,
        refY: number,
        refM: number,
        refD: number
      ): string => {
        if (!itemTime) return '';
        // ISO-like -> parse then shift to UTC+7 for display
        if (/^\d{4}-\d{2}-\d{2}T/.test(itemTime)) {
          const parsed = Date.parse(itemTime);
          if (!isNaN(parsed)) {
            const local = new Date(parsed + OFFSET_MS);
            return local.toISOString().substring(11, 16);
          }
        }
        // plain "HH:mm" -> show as-is
        if (/^\d{1,2}:\d{2}$/.test(itemTime)) {
          return itemTime;
        }
        // fallback: try parse as Date then shift
        const parsed = Date.parse(itemTime);
        if (!isNaN(parsed)) {
          const local = new Date(parsed + OFFSET_MS);
          return local.toISOString().substring(11, 16);
        }
        return itemTime;
      };

      // normalize uses the computed hour label (HH:00) as display time
      const normalize = (item: any, computedLabel: string) => ({
        time: computedLabel,
        temperature: item?.temperature ?? item?.temp ?? 0,
        condition: item?.condition ?? '',
        precipitation_chance: item?.precipitation_chance ?? item?.pop ?? null,
        _raw: item ?? null,
      });

      // build 5 target UTC+7 hour windows and pick matching items
      // Build targets by taking the startLocal and adding i hours — avoids double shifting
      const targets = Array.from({ length: 5 }).map((_, i) => {
        const localTarget = new Date(startLocal.getTime() + i * MS_HOUR); // local (UTC+7) wall clock
        const y = localTarget.getUTCFullYear();
        const mth = localTarget.getUTCMonth();
        const dt = localTarget.getUTCDate();
        const hh = localTarget.getUTCHours();
        // utcMs for that local wall-clock hour:
        const utcMs = localTarget.getTime() - OFFSET_MS;
        return { y, m: mth, d: dt, h: hh, utcMs, localTarget };
      });

      const formatted = targets.map((t) => {
        // use the localTarget hour as label to ensure hourly increments (e.g. "08:00")
        const computedLabel = `${String(t.localTarget.getUTCHours()).padStart(2, '0')}:00`;

        // 1) exact match by same UTC+7 Y/M/D/H
        let found = src.find((s: any) => {
          const parsedUtc = parseItemToUtcMs(s, t.y, t.m, t.d);
          if (parsedUtc === null) return false;
          const parsedLocal = new Date(parsedUtc + OFFSET_MS);
          return (
            parsedLocal.getUTCFullYear() === t.y &&
            parsedLocal.getUTCMonth() === t.m &&
            parsedLocal.getUTCDate() === t.d &&
            parsedLocal.getUTCHours() === t.h
          );
        });

        // 2) first item whose instant >= target UTC ms
        if (!found) {
          found = src.find((s: any) => {
            const parsedUtc = parseItemToUtcMs(s, t.y, t.m, t.d);
            return parsedUtc !== null && parsedUtc >= t.utcMs;
          });
        }

        // 3) nearest by absolute difference
        if (!found && src.length > 0) {
          let nearest: any = null;
          let bestDiff = Infinity;
          for (const s of src) {
            const parsedUtc = parseItemToUtcMs(s, t.y, t.m, t.d);
            if (parsedUtc === null) continue;
            const diff = Math.abs(parsedUtc - t.utcMs);
            if (diff < bestDiff) {
              bestDiff = diff;
              nearest = s;
            }
          }
          if (nearest) found = nearest;
        }

        // 4) fallback empty item: use computed label
        if (!found) return normalize(null, computedLabel);
        // when found, still show the computed hour label (e.g. "08:00")
        return normalize(found, computedLabel);
      });

      return { ...data, hourly_forecast: formatted };
    },
  });
