import type {
  ReportRequestFrom,
  ReportResponseFrom,
} from '@/features/emergency/interfaces/report.ts';
import ReportApi from '@/features/emergency/api/report.api.ts';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useLocation } from 'react-router';

type ReportFromProviderProps = {
  children: ReactNode;
  initialPage: string;
  initialLimit: string;
};

type ReportFromState = {
  report: ReportResponseFrom[];
  createReport: (data: ReportRequestFrom) => Promise<void>;
  findReportByStatusPag: (
    status: string,
    page: string,
    limit: string
  ) => Promise<ReportResponseFrom[]>;
  isLoading: boolean;
  totalPage: number;
};

const ReportFromContext = createContext<ReportFromState | null>(null);

export function ReportFromProvider({
  children,
  initialPage,
  initialLimit,
}: ReportFromProviderProps) {
  const [report, setReport] = useState<ReportResponseFrom[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const { pathname } = useLocation();

  const findReportByStatusPag = async (
    status: string,
    page: string,
    limit: string
  ): Promise<ReportResponseFrom[]> => {
    setIsLoading(true);

    try {
      const res = await ReportApi.getReportByStatusPag(status, page, limit);
      const total = Number(res.headers['x-total-count']) || 1;

      setTotalPage(total);
      return res.data.report;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createReport = async (data: ReportRequestFrom) => {
    setIsLoading(true);
    try {
      await ReportApi.postReport(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (pathname !== '/activity') return;

    const fetchReport = async () => {
      const res = await findReportByStatusPag(
        'pending',
        initialPage,
        initialLimit
      );
      setReport(res);
    };

    fetchReport();
  }, [pathname, initialPage, initialLimit]);

  return (
    <ReportFromContext.Provider
      value={{
        report,
        isLoading,
        totalPage,
        createReport,
        findReportByStatusPag,
      }}
    >
      {children}
    </ReportFromContext.Provider>
  );
}

export const useReportFrom = () => {
  const context = useContext(ReportFromContext);

  if (!context) {
    throw new Error('useReportFrom must be used within the ReportProvider');
  }
  return context;
};
