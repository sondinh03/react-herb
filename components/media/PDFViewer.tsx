"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocumentProxy } from "pdfjs-dist";
import { PDFViewerProps } from "@/types/pdf";
import { toast } from "@/hooks/use-toast";
import { PaymentDialog } from "@/components/PaymentDialog";
import { fetchApi } from "@/lib/api-client";

// Cấu hình worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "/duoclieu/pdf.worker.mjs";

interface PurchaseInfo {
  documentId: string;
  documentName: string;
  price: number;
  currency: string;
  researchId: string; 
}

interface EnhancedPDFViewerProps extends PDFViewerProps {
  purchaseInfo?: PurchaseInfo;
  onPurchaseSuccess?: (documentId: string) => void;
  onPurchaseError?: (error: string) => void;
  isFree?: boolean; // Thêm prop để xác định tài liệu miễn phí
}

const PDFViewer: React.FC<EnhancedPDFViewerProps> = ({
  pdfUrl,
  maxPreviewPages = 2,
  isPaid = false,
  className = "",
  purchaseInfo,
  onPurchaseSuccess,
  onPurchaseError,
  isFree = false, // Mặc định không miễn phí
}) => {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Xác định có thể xem toàn bộ tài liệu không
  const canViewFull = isFree || isPaid;

  useEffect(() => {
    loadPDF();
  }, [pdfUrl]);

  const loadPDF = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setLoadProgress(0);

      if (!pdfUrl) {
        throw new Error("Không có URL PDF hợp lệ");
      }

      // Kiểm tra response trước khi tải
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Lỗi tải PDF: ${response.statusText}`);
      }
      if (!response.headers.get("content-type")?.includes("application/pdf")) {
        throw new Error("Tệp không phải định dạng PDF");
      }

      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        cMapUrl: "/cmaps/",
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

      // Render pages dựa trên trạng thái có thể xem toàn bộ
      const pagesToRender = canViewFull
        ? loadedPdf.numPages
        : Math.min(maxPreviewPages, loadedPdf.numPages);
      canvasRefs.current = new Array(pagesToRender).fill(null);

      for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
        await renderPage(loadedPdf, pageNum);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi không xác định";
      setError("Không thể tải PDF: " + errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async (
    pdf: PDFDocumentProxy,
    pageNum: number
  ): Promise<void> => {
    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRefs.current[pageNum - 1];

      if (!canvas || !canvas.getContext) return;

      const context = canvas.getContext("2d");
      const viewport = page.getViewport({ scale: 1.5 });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
    } catch (err) {
      console.error("Lỗi render trang", pageNum, err);
    }
  };

  const handlePurchase = async () => {
    const researchId = 6;
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast({
        title: "Chưa đăng nhập",
        description: "Bạn hãy đăng nhập để sử dụng chức năng này.",
        variant: "default",
      });

      return;
    }

    if (!purchaseInfo || isProcessingPayment) return;

    setIsProcessingPayment(true);

    try {
      // Gọi API thanh toán thực tế - sử dụng PUT với researchId trong URL
      const response = await fetchApi(
        `/api/research/purchase/${researchId}`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },

        }
      );

      if (!response.ok) {
        throw new Error("Thanh toán thất bại");
      }

      const result = await response.json();

      if (result.success) {
        setShowPaymentDialog(false);

        if (onPurchaseSuccess) {
          onPurchaseSuccess(purchaseInfo.documentId);
        }

        toast({
          title: "Thanh toán thành công",
          description: "Bạn có thể xem và tải xuống toàn bộ tài liệu.",
          variant: "default",
        });

        // Reload PDF để hiển thị toàn bộ trang
        await loadPDF();
      } else {
        throw new Error(result.message || "Thanh toán thất bại");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Lỗi thanh toán không xác định";

      if (onPurchaseError) {
        onPurchaseError(errorMessage);
      }

      toast({
        title: "Lỗi thanh toán",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };



  // Render loading state
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
        <div className="text-sm text-gray-600 mt-1">
          {Math.round(loadProgress)}%
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  const displayPages = canViewFull
    ? numPages
    : Math.min(maxPreviewPages, numPages);

  // Xác định text hiển thị cho status
  const getStatusText = () => {
    if (isFree) return `Tài liệu miễn phí - ${displayPages}/${numPages} trang`;
    if (isPaid) return `Tài liệu đã mua - ${displayPages}/${numPages} trang`;
    return `Xem trước ${displayPages}/${numPages} trang`;
  };

  // Xác định màu badge preview
  const getPreviewBadgeColor = () => {
    if (isFree) return "bg-green-400 text-green-900";
    if (isPaid) return "bg-blue-400 text-blue-900";
    return "bg-yellow-400 text-yellow-900";
  };

  // Xác định text badge preview
  const getPreviewBadgeText = () => {
    if (isFree) return "FREE";
    if (isPaid) return "PURCHASED";
    return "PREVIEW";
  };

  return (
    <div className={`pdf-viewer ${className}`}>
      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        purchaseInfo={
          purchaseInfo || {
            documentName: "Tài liệu PDF",
            price: 50000,
            currency: "VND",
            researchId: "6", // Thêm default value
          }
        }
        onConfirm={handlePurchase}
        isProcessing={isProcessingPayment}
      />

      <div className="mb-4 p-4 bg-gray-100 rounded">
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>

      <div className="pdf-pages space-y-4">
        {Array.from({ length: displayPages }, (_, index) => (
          <div key={index} className="page-container relative">
            <canvas
              ref={(el) => (canvasRefs.current[index] = el)}
              className="border shadow-md max-w-full mx-auto block"
            />

            {/* Badge hiển thị trạng thái */}
            <div
              className={`absolute top-4 right-4 px-2 py-1 rounded text-xs font-bold opacity-75 ${getPreviewBadgeColor()}`}
            >
              {getPreviewBadgeText()}
            </div>

            {/* Hiển thị call-to-action cho tài liệu trả phí chưa mua */}
            {!canViewFull && index === displayPages - 1 && (
              <div className="mt-4 p-4 bg-yellow-100 text-center rounded border border-yellow-300">
                <p className="text-yellow-800 font-medium mb-2">
                  Đây là bản xem trước. Mua tài liệu để xem toàn bộ {numPages}{" "}
                  trang.
                </p>
                <div className="space-y-2">
                  <div className="text-lg font-bold text-yellow-900">
                    {purchaseInfo?.price?.toLocaleString() || "50,000"}{" "}
                    {purchaseInfo?.currency || "VND"}
                  </div>
                  <button
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setShowPaymentDialog(true)}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? "Đang xử lý..." : "Mua ngay"}
                  </button>
                </div>
              </div>
            )}

            {/* Hiển thị thông báo cho tài liệu miễn phí */}
            {isFree && index === displayPages - 1 && (
              <div className="mt-4 p-4 bg-green-100 text-center rounded border border-green-300">
                <p className="text-green-800 font-medium">
                  🎉 Tài liệu miễn phí - Bạn có thể xem và tải xuống toàn bộ{" "}
                  {numPages} trang!
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFViewer;
