import type { SuccessResponseInterface } from '@/features/emergency/interfaces/api.ts';
import type {
  ReportRequestFrom,
  ReportResponseFrom,
} from '@/features/emergency/interfaces/report.ts';
import { post } from '.';

export default class ReportApi {
  static async postReport(data: ReportRequestFrom) {
    const response: SuccessResponseInterface<ReportResponseFrom> = await post(
      'reports',
      data
    );
    return response;
  }
}
