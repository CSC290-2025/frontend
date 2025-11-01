import type {
  ReportRequestFrom,
  ReportResponseFrom,
} from '@/features/emergency/interfaces/report.ts';
import ReportApi from '@/features/emergency/api/report.api.ts';
import { createContext, type ReactNode, useContext, useState } from 'react';

type ReportFromState = {
  report: ReportResponseFrom[];
  createReport: (data: ReportRequestFrom) => void;
  isLoading: boolean;
};

const ReportFromContext = createContext<ReportFromState | null>(null);

export function ReportFromProvider({ children }: { children: ReactNode }) {
  const [report, setReport] = useState<ReportResponseFrom[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createReport = async (data: ReportRequestFrom) => {
    setIsLoading(true);
    try {
      const res = await ReportApi.postReport(data);
      setReport((prev) => [...prev, res.data]);
    } catch (error: any) {
      console.error(error.error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ReportFromContext.Provider
      value={{
        report,
        isLoading,
        createReport,
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
