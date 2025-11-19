import { apiClient } from '@/lib/apiClient';
import type {
  ReportsByCategory,
  ApiResponse,
  CreateReportData,
  UpdateReportData,
  Report,
  UserRole,
} from '@/types/reports';

/**
 * Get reports by role
 * @param role - User role (citizens, admin)
 * @returns Reports organized by category
 */
export const getReports = async (
  role: UserRole
): Promise<ReportsByCategory> => {
  const response = await apiClient.get<
    ApiResponse<{ reports: ReportsByCategory }>
  >('/reports', {
    params: { role },
  });
  return response.data.data?.reports || {};
};

/**
 * Create a new report
 * @param data - Report data
 * @returns Created report
 */
export const createReport = async (
  data: CreateReportData,
  role: UserRole
): Promise<Report> => {
  if (role !== 'admin') {
    throw new Error('Admin role required to create reports');
  }
  const response = await apiClient.post<ApiResponse<{ report: Report }>>(
    '/reports',
    data,
    {
      params: { role },
    }
  );
  if (!response.data.data?.report) {
    throw new Error('Failed to create report');
  }
  return response.data.data.report;
};

/**
 * Update an existing report
 * @param id - Report ID
 * @param data - Updated report data
 * @returns Updated report
 */
export const updateReport = async (
  id: number,
  data: UpdateReportData,
  role: UserRole
): Promise<Report> => {
  if (role !== 'admin') {
    throw new Error('Admin role required to update reports');
  }
  const response = await apiClient.put<ApiResponse<{ report: Report }>>(
    `/reports/${id}`,
    data,
    {
      params: { role },
    }
  );
  if (!response.data.data?.report) {
    throw new Error('Failed to update report');
  }
  return response.data.data.report;
};

/**
 * Delete a report
 * @param id - Report ID
 */
export const deleteReport = async (
  id: number,
  role: UserRole
): Promise<void> => {
  if (role !== 'admin') {
    throw new Error('Admin role required to delete reports');
  }
  await apiClient.delete<ApiResponse<unknown>>(`/reports/${id}`, {
    params: { role },
  });
};
