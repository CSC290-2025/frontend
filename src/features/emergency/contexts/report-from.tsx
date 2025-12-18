import type {
  ReportRequestFrom,
  ReportResponseFrom,
} from '@/features/emergency/types/report.ts';
import ReportApi from '@/features/emergency/api/report.api.ts';
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useLocation } from 'react-router';
import { apiClient } from '@/lib/apiClient.ts';

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
  ) => Promise<void>;
  isLoading: boolean;
  totalPage: number;
  setStatus: Dispatch<SetStateAction<'pending' | 'resolved' | 'verified'>>;
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
  const [status, setStatus] = useState<'pending' | 'verified' | 'resolved'>(
    'pending'
  );

  const { pathname } = useLocation();

  const findReportByStatusPag = async (
    status: string,
    page: string,
    limit: string
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await ReportApi.getReportByStatusPag(status, page, limit);
      const totalCount = Number(res.headers['x-total-count']) || 1;

      setTotalPage(totalCount);
      setReport(res.data.report);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const createReport = async (data: ReportRequestFrom): Promise<void> => {
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
    // if (pathname !== '/activity' || pathname !== '/admindashboard') return;
    setReport([]);
    findReportByStatusPag(status, initialPage, initialLimit);
  }, [pathname, initialPage, initialLimit, status]);

  return (
    <ReportFromContext.Provider
      value={{
        report,
        isLoading,
        totalPage,
        createReport,
        findReportByStatusPag,
        setStatus,
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
