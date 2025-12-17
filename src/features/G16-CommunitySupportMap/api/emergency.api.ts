import { apiClient } from '@/lib/apiClient';
import ReportApi from '@/features/emergency/api/ReportApi';
import type { ReportResponseFrom } from '@/features/emergency/interfaces/report';

export const getVerifiedReports = async () => {
    try {
      const response = await ReportApi.getReportByStatusPag('verified', '1', '1000');
      const data = response.data as unknown as { report: ReportResponseFrom[] };
      
      return data.report || [];
    } catch (error) {
      console.error("Error fetching verified reports:", error);
      return [];
    }
  };