import type { SuccessResponseInterface } from '@/features/emergency/interfaces/api.ts';
import type {
  ReportRequestFrom,
  ReportResponseFrom,
} from '@/features/emergency/interfaces/report.ts';
import { get, post } from '.';

export default class ReportApi {
  static async postReport(data: ReportRequestFrom) {
    const response: SuccessResponseInterface<ReportResponseFrom> = await post(
      '/reports',
      data
    );
    return response;
  }

  static async getReportByStatusPag(
    status: string,
    page: string,
    limit: string
  ) {
    const response = await get(`/reports/${status}`, {
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
}
