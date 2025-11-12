import { apiClient } from '@/lib/apiClient';
import type {
  ReportsByCategory,
  ApiResponse,
  CreateReportData,
  UpdateReportData,
  Report,
} from '@/types/reports';

/**
 * Get reports by role
 * @param role - User role (citizen, official, admin)
 * @returns Reports organized by category
 */
export const getReports = async (role: string): Promise<ReportsByCategory> => {
  const response = await apiClient.get<
    ApiResponse<{ reports: ReportsByCategory }>
  >(`/reports?role=${role}`);
  return response.data.data?.reports || {};
};

/**
 * Create a new report
 * @param data - Report data
 * @returns Created report
 */
export const createReport = async (data: CreateReportData): Promise<Report> => {
  const response = await apiClient.post<ApiResponse<{ report: Report }>>(
    '/reports',
    data
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
  data: UpdateReportData
): Promise<Report> => {
  const response = await apiClient.put<ApiResponse<{ report: Report }>>(
    `/reports/${id}`,
    data
  );
  if (!response.data.data?.report) {
    throw new Error('Failed to update report');
  }
  return response.data.data.report;
};
