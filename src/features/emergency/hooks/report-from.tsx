import type {
  ReportRequestFrom,
  ReportResponseFrom,
  ReportResponseManny,
} from '@/features/emergency/interfaces/report.ts';
import ReportApi from '@/features/emergency/api/report.api.ts';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

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
  const [totalPage, setTotalPage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      const res = await findReportByStatusPag(
        'pending',
        initialPage,
        initialLimit
      );
      setReport(res);
    };
    fetchReport();
  }, [initialPage, initialLimit]);

  const createReport = async (data: ReportRequestFrom) => {
    setIsLoading(true);
    try {
      await ReportApi.postReport(data);
    } catch (error: unknown) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const findReportByStatusPag = async (
    status: string,
    page: string,
    limit: string
  ): Promise<ReportResponseFrom[]> => {
    setIsLoading(true);
    try {
      const res = await ReportApi.getReportByStatusPag(status, page, limit);
      const totalPage = Number(res.headers['x-total-page']) || 0;

      setTotalPage(totalPage);
      return res.data.report;
    } catch (error: unknown) {
      console.log(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
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
