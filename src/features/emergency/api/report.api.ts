import type { SuccessResponseInterface } from '@/features/emergency/interfaces/api.ts';
import type {
  ReportRequestFrom,
  ReportResponseFrom,
  ReportUpdateForm,
} from '@/features/emergency/interfaces/report.ts';
import { Delete, Get, Patch, Post } from '.';

export default class ReportApi {
  static async postReport(data: ReportRequestFrom) {
    const response: SuccessResponseInterface<ReportResponseFrom> = await Post(
      'emergency/reports',
      data
    );
    return response;
  }

  static async getReportByStatusPag(
    status: string,
    page: string,
    limit: string
  ) {
    const response = await Get(`emergency/reports/${status}`, {
      params: {
        _page: page,
        _limit: limit,
      },
      headers: {
        'X-Custom-Header': 'x-total-count',
        'Content-Type': 'application/json',
      },
    });
    return {
      data: response.data.data,
      headers: response.headers,
    };
  }

  static async patchReportById(id: string, data: ReportUpdateForm) {
    const response: SuccessResponseInterface<ReportUpdateForm> = await Patch(
      `/emergency/reports/${id}`,
      data
    );
    return response;
  }

  static async deleteReportById(id: string) {
    return await Delete(`emergency/reports/${id}`);
  }
}
