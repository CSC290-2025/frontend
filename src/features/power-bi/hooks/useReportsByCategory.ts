import { useQuery } from '@tanstack/react-query';
import { getReports, type Report } from '../api/reports.api';
import type { UserRole } from '@/types/reports';

type ReportType = 'summary' | 'trends' | string | undefined;

export function useReportsByCategory(params: {
  role: UserRole;
  type: ReportType;
  category?: string;
}) {
  const { role, type, category } = params;

  const { data, isLoading, error } = useQuery({
    queryKey: ['reports', role, type, category],
    queryFn: () => getReports(role),
    enabled: !!(role && type && category),
  });

  // Filter reports by category and type
  const reports: Report[] = (() => {
    if (!data || !category) return [];

    const categoryKey = category.toLowerCase();
    const categoryData = data[categoryKey];
    const categoryReports: Report[] = categoryData?.reports ?? [];

    return categoryReports.filter((report) => {
      if (type === 'summary') {
        return report.power_bi_report_type === 'summary';
      } else if (type === 'trends') {
        return report.power_bi_report_type === 'trends';
      }
      return true;
    });
  })();

  return {
    reports,
    loading: isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to load reports'
      : null,
  };
}
