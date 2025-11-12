export interface Report {
  report_id: number;
  title_string: string;
  description_string: string | null;
  category_id: number | null;
  power_bi_report_id_string: string | null;
  embedUrl?: string | null;
  dim_category?: {
    category_id: number;
    category_name: string;
    category_description: string | null;
  } | null;
}

export interface ReportsByCategory {
  [categoryName: string]: {
    categoryId: number;
    categoryName: string;
    categoryDescription: string | null;
    reports: Report[];
  };
}

export interface CreateReportData {
  title: string;
  description?: string | null;
  category: string;
  embedUrl?: string | null;
}

export interface UpdateReportData {
  title?: string;
  description?: string | null;
  category?: string;
  embedUrl?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    name: string;
    message: string;
    statusCode: number;
  };
  timestamp: string;
}
