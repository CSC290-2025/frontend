import { useEffect, useRef } from 'react';

export type StatusEvent = {
  type: 'status_change';
  id: number;
  oldStatus: number | null;
  newStatus: number | null;
  timestamp: string;
};

type UseTrafficSSEOptions = {
  url?: string;
  withCredentials?: boolean;
  reconnect?: boolean;
  maxRetries?: number;
};

export function useTrafficSSE(
  onEvent: (evt: StatusEvent) => void,
  options: UseTrafficSSEOptions = {}
) {
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const envBase = (import.meta as any).env?.VITE_API_BASE || '';
    const normalizedBase = envBase.replace(/\/$/, '');
    let url: string;
    if (options.url) {
      url = options.url.startsWith('http')
        ? options.url
        : `${normalizedBase}${options.url.startsWith('/') ? '' : '/'}${options.url}`;
    } else {
      url = normalizedBase
        ? `${normalizedBase}/traffic-lights/stream`
        : '/traffic-lights/stream';
    }
    const maxRetries = options.maxRetries ?? 8;

    const connect = () => {
      try {
        const es = new EventSource(url, {
          withCredentials: !!options.withCredentials,
        });
        esRef.current = es;

        es.onopen = () => {
          retryRef.current = 0;
        };

        es.onmessage = (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data) as StatusEvent;
            onEvent(parsed);
          } catch (err) {
            // ignore malformed messages but surface to console
             
            console.error('SSE: failed to parse message', err);
          }
        };

        es.onerror = () => {
          // native EventSource will attempt to reconnect, but we implement
          // an optional backoff strategy by closing and reconnecting manually
          if (!options.reconnect) return;

          try {
            es.close();
          } catch (err) {
            // ignore
          }

          if (retryRef.current >= maxRetries) {
            // give up
            return;
          }

          const backoff = Math.min(30_000, 500 * 2 ** retryRef.current);
          retryRef.current += 1;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore setTimeout returns number in browsers
          timeoutRef.current = window.setTimeout(() => {
            connect();
          }, backoff);
        };
      } catch (err) {
        // console and retry
         
        console.error('SSE: connection failed', err);
        if (!options.reconnect) return;
      }
    };

    connect();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (esRef.current) {
        try {
          esRef.current.close();
        } catch (err) {
          // ignore
        }
        esRef.current = null;
      }
    };
  }, [
    onEvent,
    options.url,
    options.withCredentials,
    options.reconnect,
    options.maxRetries,
  ]);
}

export default useTrafficSSE;
