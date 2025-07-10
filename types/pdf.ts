export interface PDFViewerProps {
  pdfUrl: string;
  maxPreviewPages?: number;
  isPaid?: boolean;
  className?: string;
}

export interface PDFPageInfo {
  pageNumber: number;
  isRendered: boolean;
}

export interface PDFLoadResult {
  numPages: number;
  allowedPages: number;
}