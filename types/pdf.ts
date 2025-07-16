export interface PDFViewerProps {
  pdfUrl: string;
  maxPreviewPages?: number;
  isPaid?: boolean;
  className?: string;
  onPurchaseClick?: () => void;
  onLoad?: (result: PDFLoadResult) => void;
}

export interface PDFPageInfo {
  pageNumber: number;
  isRendered: boolean;
}

export interface PDFLoadResult {
  numPages: number;
  allowedPages: number;
}

export interface PDFError {
  code: string;
  message: string;
  details?: any;
}

export interface PDFLoadProgress {
  loaded: number;
  total: number;
  percentage: number;
}