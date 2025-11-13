import { useEffect, useMemo, useState } from 'react';
import { getReports, type Report } from '../api/reports.api';
import type { UserRole } from '@/types/reports';

export function useReportById(params: { role: UserRole; id?: string }) {
  const { role, id } = params;
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const reportsByCategory = await getReports(role);

        let foundReport: Report | null = null;
        for (const categoryName in reportsByCategory) {
          const categoryData = reportsByCategory[categoryName];
          const reportItem = categoryData.reports.find(
            (r) => r.report_id === parseInt(id || '0', 10)
          );
          if (reportItem) {
            foundReport = reportItem;
            break;
          }
        }

        if (!isCancelled) {
          if (!foundReport) {
            setError('Report not found');
            setReport(null);
          } else {
            setReport(foundReport);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load report';
          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    if (role && id) {
      fetchReport();
    } else {
      setReport(null);
      setLoading(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [role, id]);

  return useMemo(() => ({ report, loading, error }), [report, loading, error]);
}
