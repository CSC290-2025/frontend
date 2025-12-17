import React, { useCallback, useEffect, useState } from 'react';
import type { StatusEvent } from '@/features/traffic-management/types/useTrafficSSE.ts';

type Notification = {
  id: string;
  message: string;
  receivedAt: number;
  variant?: 'info' | 'warning' | 'success' | 'error';
  lightId: number;
  count: number;
};

const AUTO_DISMISS_MS = 6000;

export default function TrafficNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const push = useCallback((n: Omit<Notification, 'count'>) => {
    setTotalCount((prev) => {
      const newCount = prev + 1;
      const notificationWithCount = { ...n, count: newCount };
      setNotifications((prevNotifs) =>
        [notificationWithCount, ...prevNotifs].slice(0, 6)
      );
      return newCount;
    });

    // auto dismiss
    window.setTimeout(() => {
      setNotifications((prev) => prev.filter((p) => p.id !== n.id));
    }, AUTO_DISMISS_MS);
  }, []);

  const handleEvent = useCallback(
    (evt: StatusEvent) => {
      if (evt.type !== 'status_change') return;

      let msg = '';
      let variant: Notification['variant'] = 'info';

      if (evt.newStatus === 1) {
        msg = `Traffic light reported as broken`;
        variant = 'error';
      } else if (evt.newStatus === 2) {
        msg = `Traffic light requires maintenance`;
        variant = 'warning';
      } else if (evt.newStatus === 0) {
        msg = `Traffic light back online`;
        variant = 'success';
      } else {
        msg = `Traffic light status changed`;
      }

      push({
        id: `${evt.id}-${evt.timestamp}`,
        message: msg,
        receivedAt: Date.now(),
        variant,
        lightId: evt.id,
      });
    },
    [push]
  );

  // Listen for programmatic notification requests dispatched from the page
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const ce = e as CustomEvent;
        const evt = ce.detail as StatusEvent;
        if (!evt || evt.type !== 'status_change') return;

        let msg = '';
        let variant: Notification['variant'] = 'info';

        if (evt.newStatus === 1) {
          msg = `Traffic light reported as broken`;
          variant = 'error';
        } else if (evt.newStatus === 2) {
          msg = `Traffic light requires maintenance`;
          variant = 'warning';
        } else if (evt.newStatus === 0) {
          msg = `Traffic light back online`;
          variant = 'success';
        } else {
          msg = `Traffic light status changed`;
        }

        push({
          id: `${evt.id}-${evt.timestamp}`,
          message: msg,
          receivedAt: Date.now(),
          variant,
          lightId: evt.id,
        });
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('traffic-notification', handler as EventListener);
    return () =>
      window.removeEventListener(
        'traffic-notification',
        handler as EventListener
      );
  }, [push]);

  const getIcon = (variant: Notification['variant']) => {
    switch (variant) {
      case 'error':
        return (
          <svg
            className="h-5 w-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg
            className="h-5 w-5 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case 'success':
        return (
          <svg
            className="h-5 w-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="h-5 w-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const getStyles = (variant: Notification['variant']) => {
    switch (variant) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-900',
          badge: 'bg-red-100 text-red-800',
          shadow: 'shadow-red-100',
          progressBar: 'bg-red-500',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-900',
          badge: 'bg-amber-100 text-amber-800',
          shadow: 'shadow-amber-100',
          progressBar: 'bg-amber-500',
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-900',
          badge: 'bg-green-100 text-green-800',
          shadow: 'shadow-green-100',
          progressBar: 'bg-green-500',
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          badge: 'bg-blue-100 text-blue-800',
          shadow: 'shadow-blue-100',
          progressBar: 'bg-blue-500',
        };
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-3 p-4">
      <div
        aria-live="polite"
        aria-atomic="false"
        className="flex flex-col gap-3"
      >
        {notifications.map((n) => {
          const styles = getStyles(n.variant);
          return (
            <div
              key={n.id}
              className={`pointer-events-auto transform animate-[slideIn_0.3s_ease-out] rounded-lg border-2 ${styles.border} ${styles.bg} p-4 shadow-lg ${styles.shadow} transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">{getIcon(n.variant)}</div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles.badge}`}
                    >
                      #{n.count}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles.badge}`}
                    >
                      ID: {n.lightId}
                    </span>
                  </div>

                  <p className={`text-sm font-medium ${styles.text} mb-1`}>
                    {n.message}
                  </p>

                  <p className="text-xs text-gray-500">
                    {new Date(n.receivedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </p>
                </div>

                <button
                  onClick={() => dismissNotification(n.id)}
                  className="flex-shrink-0 rounded-md p-1 transition-colors hover:bg-gray-200/50"
                  aria-label="Dismiss notification"
                >
                  <svg
                    className="h-4 w-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Progress bar for auto-dismiss */}
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full ${styles.progressBar}`}
                  style={{
                    animation: `shrink ${AUTO_DISMISS_MS}ms linear forwards`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
