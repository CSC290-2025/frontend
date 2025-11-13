import { useEffect, useMemo, useState } from 'react';
import { getReports, type Report } from '../api/reports.api';

type ReportType = 'summary' | 'trends' | string | undefined;

export function useReportsByCategory(params: {
  role: string;
  type: ReportType;
  category?: string;
}) {
  const { role, type, category } = params;
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const reportsByCategory = await getReports(role);

        const categoryKey = category?.toLowerCase();
        const categoryData = categoryKey
          ? reportsByCategory[categoryKey]
          : undefined;
        const categoryReports: Report[] = categoryData?.reports ?? [];

        const filteredByType = categoryReports.filter((report) => {
          if (type === 'summary') {
            return report.power_bi_report_type === 'summary';
          } else if (type === 'trends') {
            return report.power_bi_report_type === 'trends';
          }
          return true;
        });

        if (!isCancelled) {
          setReports(filteredByType);
        }
      } catch (err) {
        if (!isCancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load reports';
          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    if (role && type && category) {
      fetchReports();
    } else {
      setReports([]);
      setLoading(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [role, type, category]);

  return useMemo(
    () => ({ reports, loading, error }),
    [reports, loading, error]
  );
}
