"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocumentProxy } from "pdfjs-dist";
import { PDFViewerProps } from "@/types/pdf";
import { toast } from "@/hooks/use-toast";
import { PaymentDialog } from "@/components/PaymentDialog";

// Cấu hình worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "/duoclieu/pdf.worker.mjs";

interface PurchaseInfo {
  documentId: string;
  documentName: string;
  price: number;
  currency: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  maxPreviewPages = 2,
  isPaid = false,
  className = "",
  purchaseInfo,
  onPurchaseSuccess,
  onPurchaseError,
}) => {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    loadPDF();
  }, [pdfUrl]);

  const loadPDF = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setLoadProgress(0);

      if (!pdfUrl) {
        throw new Error('Không có URL PDF hợp lệ');
      }

      // Kiểm tra response trước khi tải
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Lỗi tải PDF: ${response.statusText}`);
      }
      if (!response.headers.get('content-type')?.includes('application/pdf')) {
        throw new Error('Tệp không phải định dạng PDF');
      }

      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        cMapUrl: '/cmaps/',
        cMapPacked: true,
      });

      loadingTask.onProgress = (progress) => {
        if (progress.total > 0) {
          setLoadProgress((progress.loaded / progress.total) * 100);
        }
      };

      const loadedPdf = await loadingTask.promise;
      setPdf(loadedPdf);
      setNumPages(loadedPdf.numPages);

      const pagesToRender = isPaid ? loadedPdf.numPages : Math.min(maxPreviewPages, loadedPdf.numPages);
      canvasRefs.current = new Array(pagesToRender).fill(null);

      for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
        await renderPage(loadedPdf, pageNum);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError('Không thể tải PDF: ' + errorMessage);
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async (pdf: PDFDocumentProxy, pageNum: number): Promise<void> => {
    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRefs.current[pageNum - 1];

      if (!canvas || !canvas.getContext) return;

      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale: 1.5 });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
    } catch (err) {
      console.error('Lỗi render trang', pageNum, err);
    }
  };

  const handlePurchase = async () => {
    if (!purchaseInfo) return;
    
    try {
      // Mock payment process - replace with real API call later
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onPurchaseSuccess) {
        onPurchaseSuccess(purchaseInfo.documentId);
      }

      toast({
        title: 'Thành công',
        description: 'Thanh toán thành công! Bạn có thể xem toàn bộ tài liệu.',
        variant: 'default',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi thanh toán không xác định';
      
      if (onPurchaseError) {
        onPurchaseError(errorMessage);
      }
      
      toast({
        title: 'Lỗi thanh toán',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="mb-2">Đang tải PDF...</div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${loadProgress}%` }}
          ></div>
        </div>
        <div className="text-sm text-gray-600 mt-1">{Math.round(loadProgress)}%</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  const displayPages = isPaid ? numPages : Math.min(maxPreviewPages, numPages);

  return (
    <div className={`pdf-viewer ${className}`}>
      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        purchaseInfo={purchaseInfo || {
          documentName: "Tài liệu PDF",
          price: 50000,
          currency: "VND",
        }}
        onConfirm={handlePurchase}
      />
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <span className="text-sm font-medium">
          {isPaid ? `Trang ${displayPages}/${numPages}` : `Xem trước ${displayPages}/${numPages} trang`}
        </span>
      </div>
      <div className="pdf-pages space-y-4">
        {Array.from({ length: displayPages }, (_, index) => (
          <div key={index} className="page-container relative">
            <canvas
              ref={(el) => (canvasRefs.current[index] = el)}
              className="border shadow-md max-w-full mx-auto block"
            />
            {!isPaid && (
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold opacity-75">
                PREVIEW
              </div>
            )}
            {!isPaid && index === displayPages - 1 && (
              <div className="mt-4 p-4 bg-yellow-100 text-center rounded border border-yellow-300">
                <p className="text-yellow-800 font-medium">
                  Đây là bản xem trước. Mua tài liệu để xem toàn bộ {numPages} trang.
                </p>
                <button
                  className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                  onClick={() => setShowPaymentDialog(true)}
                >
                  Mua ngay
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFViewer;