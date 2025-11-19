import { useQuery } from '@tanstack/react-query';
import { getReports, type Report } from '../api/reports.api';
import type { UserRole } from '@/types/reports';

export function useReportById(params: { role: UserRole; id?: string }) {
  const { role, id } = params;

  const { data, isLoading, error } = useQuery({
    queryKey: ['reports', role, id],
    queryFn: () => getReports(role),
    enabled: !!(role && id),
  });

  // Find report by ID across all categories
  const report: Report | null = (() => {
    if (!data || !id) return null;

    const reportId = parseInt(id, 10);
    for (const categoryName in data) {
      const categoryData = data[categoryName];
      const foundReport = categoryData.reports.find(
        (r) => r.report_id === reportId
      );
      if (foundReport) {
        return foundReport;
      }
    }
    return null;
  })();

  return {
    report,
    loading: isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to load report'
      : !report && !isLoading && id
        ? 'Report not found'
        : null,
  };
}
