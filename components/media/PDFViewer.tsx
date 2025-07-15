"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocumentProxy } from "pdfjs-dist";
import { PDFViewerProps } from "@/types/pdf";
import { toast } from "@/hooks/use-toast";
import { handleWait } from "../header";

// Cấu hình worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "/duoclieu/pdf.worker.mjs";

interface PurchaseInfo {
  documentId: string;
  documentName: string;
  price: number;
  currency: string;
}

interface EnhancedPDFViewerProps extends PDFViewerProps {
  purchaseInfo?: PurchaseInfo;
  onPurchaseSuccess?: (documentId: string) => void;
  onPurchaseError?: (error: string) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  maxPreviewPages = 2,
  isPaid = false,
  className = "",
}) => {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState<number>(0);

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
                  onClick={() => handleWait()}
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

// const PDFViewer: React.FC<EnhancedPDFViewerProps> = ({
//   pdfUrl,
//   maxPreviewPages = 2,
//   isPaid = false,
//   className = "",
//   purchaseInfo,
//   onPurchaseSuccess,
//   onPurchaseError,
// }) => {
//   const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
//   const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
//   const [numPages, setNumPages] = useState<number>(0);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [loadProgress, setLoadProgress] = useState<number>(0);
//   const [purchasing, setPurchasing] = useState<boolean>(false);
//   const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

//   useEffect(() => {
//     loadPDF();
//   }, [pdfUrl]);

//   const loadPDF = async (): Promise<void> => {
//     try {
//       setLoading(true);
//       setError(null);
//       setLoadProgress(0);

//       if (!pdfUrl) {
//         throw new Error("Không có URL PDF hợp lệ");
//       }

//       // Kiểm tra response trước khi tải
//       const response = await fetch(pdfUrl);
//       if (!response.ok) {
//         throw new Error(`Lỗi tải PDF: ${response.statusText}`);
//       }
//       if (!response.headers.get("content-type")?.includes("application/pdf")) {
//         throw new Error("Tệp không phải định dạng PDF");
//       }

//       const loadingTask = pdfjsLib.getDocument({
//         url: pdfUrl,
//         cMapUrl: "/cmaps/",
//         cMapPacked: true,
//       });

//       loadingTask.onProgress = (progress) => {
//         if (progress.total > 0) {
//           setLoadProgress((progress.loaded / progress.total) * 100);
//         }
//       };

//       const loadedPdf = await loadingTask.promise;
//       setPdf(loadedPdf);
//       setNumPages(loadedPdf.numPages);

//       const pagesToRender = isPaid
//         ? loadedPdf.numPages
//         : Math.min(maxPreviewPages, loadedPdf.numPages);
//       canvasRefs.current = new Array(pagesToRender).fill(null);

//       for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
//         await renderPage(loadedPdf, pageNum);
//       }
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error ? err.message : "Lỗi không xác định";
//       setError("Không thể tải PDF: " + errorMessage);
//       toast({
//         title: "Lỗi",
//         description: errorMessage,
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderPage = async (
//     pdf: PDFDocumentProxy,
//     pageNum: number
//   ): Promise<void> => {
//     try {
//       const page = await pdf.getPage(pageNum);
//       const canvas = canvasRefs.current[pageNum - 1];

//       if (!canvas || !canvas.getContext) return;

//       const context = canvas.getContext("2d");
//       const viewport = page.getViewport({ scale: 1.5 });

//       canvas.height = viewport.height;
//       canvas.width = viewport.width;

//       await page.render({ canvasContext: context, viewport }).promise;
//     } catch (err) {
//       console.error("Lỗi render trang", pageNum, err);
//     }
//   };

//   // Hàm xử lý thanh toán
//   const handlePurchase = async (paymentMethod: 'momo' | 'vnpay' | 'banking' | 'wallet') => {
//     // if (!purchaseInfo) {
//     //   toast({
//     //     title: 'Lỗi',
//     //     description: 'Thông tin thanh toán không hợp lệ',
//     //     variant: 'destructive',
//     //   });
//     //   return;
//     // }

//     setPurchasing(true);
    
//     // Tạm thời mô phỏng thanh toán thành công
//     setTimeout(async () => {
//       // Thanh toán thành công
//       toast({
//         title: 'Thành công!',
//         description: 'Thanh toán thành công. Đang tải toàn bộ tài liệu...',
//         variant: 'default',
//       });
      
//       setShowPaymentModal(false);
//       onPurchaseSuccess?.(purchaseInfo?.documentId || '');
      
//       // Reload PDF với quyền truy cập đầy đủ
//       await loadPDF();
//       setPurchasing(false);
//     }, 1500); // Mô phỏng thời gian xử lý thanh toán

//     // try {
//     //   // Gọi API thanh toán
//     //   const response = await fetch('/api/purchase-document', {
//     //     method: 'POST',
//     //     headers: {
//     //       'Content-Type': 'application/json',
//     //     },
//     //     body: JSON.stringify({
//     //       documentId: purchaseInfo.documentId,
//     //       paymentMethod,
//     //       amount: purchaseInfo.price,
//     //       currency: purchaseInfo.currency,
//     //     }),
//     //   });

//     //   const result = await response.json();

//     //   if (response.ok) {
//     //     // Thanh toán thành công
//     //     toast({
//     //       title: 'Thành công!',
//     //       description: 'Thanh toán thành công. Đang tải toàn bộ tài liệu...',
//     //       variant: 'default',
//     //     });
        
//     //     setShowPaymentModal(false);
//     //     onPurchaseSuccess?.(purchaseInfo.documentId);
        
//     //     // Reload PDF với quyền truy cập đầy đủ
//     //     await loadPDF();
//     //   } else {
//     //     throw new Error(result.message || 'Thanh toán thất bại');
//     //   }
//     // } catch (err) {
//     //   const errorMessage = err instanceof Error ? err.message : 'Lỗi thanh toán';
//     //   toast({
//     //     title: 'Lỗi thanh toán',
//     //     description: errorMessage,
//     //     variant: 'destructive',
//     //   });
//     //   onPurchaseError?.(errorMessage);
//     // } finally {
//     //   setPurchasing(false);
//     // }
//   };

//   // Component Modal thanh toán
//   const PaymentModal = () => (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold">Mua tài liệu</h3>
//           <button
//             onClick={() => setShowPaymentModal(false)}
//             className="text-gray-500 hover:text-gray-700"
//             disabled={purchasing}
//           >
//             ✕
//           </button>
//         </div>

//         {purchaseInfo && (
//           <div className="mb-6">
//             <h4 className="font-medium mb-2">{purchaseInfo.documentName}</h4>
//             <p className="text-2xl font-bold text-blue-600">
//               {purchaseInfo.price.toLocaleString()} {purchaseInfo.currency}
//             </p>
//             <p className="text-sm text-gray-600 mt-1">
//               {numPages} trang • Truy cập vĩnh viễn
//             </p>
//           </div>
//         )}

//         <div className="space-y-3">
//           <h5 className="font-medium text-sm text-gray-700">
//             Chọn phương thức thanh toán:
//           </h5>

//           <button
//             onClick={() => handlePurchase("momo")}
//             disabled={purchasing}
//             className="w-full flex items-center justify-center gap-3 p-3 border border-pink-300 rounded-lg hover:bg-pink-50 transition-colors disabled:opacity-50"
//           >
//             <div className="w-8 h-8 bg-pink-500 rounded flex items-center justify-center text-white font-bold">
//               M
//             </div>
//             <span>Ví MoMo</span>
//           </button>

//           <button
//             onClick={() => handlePurchase("vnpay")}
//             disabled={purchasing}
//             className="w-full flex items-center justify-center gap-3 p-3 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
//           >
//             <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold">
//               V
//             </div>
//             <span>VNPay</span>
//           </button>

//           <button
//             onClick={() => handlePurchase("banking")}
//             disabled={purchasing}
//             className="w-full flex items-center justify-center gap-3 p-3 border border-green-300 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
//           >
//             <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white font-bold">
//               🏦
//             </div>
//             <span>Chuyển khoản ngân hàng</span>
//           </button>

//           <button
//             onClick={() => handlePurchase("wallet")}
//             disabled={purchasing}
//             className="w-full flex items-center justify-center gap-3 p-3 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
//           >
//             <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold">
//               💳
//             </div>
//             <span>Ví điện tử</span>
//           </button>
//         </div>

//         {purchasing && (
//           <div className="mt-4 text-center">
//             <div className="inline-flex items-center gap-2">
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
//               <span className="text-sm text-gray-600">
//                 Đang xử lý thanh toán...
//               </span>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="text-center p-4">
//         <div className="mb-2">Đang tải PDF...</div>
//         <div className="w-full bg-gray-200 rounded-full h-2.5">
//           <div
//             className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
//             style={{ width: `${loadProgress}%` }}
//           ></div>
//         </div>
//         <div className="text-sm text-gray-600 mt-1">
//           {Math.round(loadProgress)}%
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return <div className="text-red-500 text-center p-4">{error}</div>;
//   }

//   const displayPages = isPaid ? numPages : Math.min(maxPreviewPages, numPages);

//   return (
//     <>
//       <div className={`pdf-viewer ${className}`}>
//         <div className="mb-4 p-4 bg-gray-100 rounded">
//           <span className="text-sm font-medium">
//             {isPaid
//               ? `Trang ${displayPages}/${numPages}`
//               : `Xem trước ${displayPages}/${numPages} trang`}
//           </span>
//         </div>
//         <div className="pdf-pages space-y-4">
//           {Array.from({ length: displayPages }, (_, index) => (
//             <div key={index} className="page-container relative">
//               <canvas
//                 ref={(el) => (canvasRefs.current[index] = el)}
//                 className="border shadow-md max-w-full mx-auto block"
//               />
//               {!isPaid && (
//                 <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold opacity-75">
//                   PREVIEW
//                 </div>
//               )}
//               {!isPaid && index === displayPages - 1 && (
//                 <div className="mt-4 p-4 bg-yellow-100 text-center rounded border border-yellow-300">
//                   <p className="text-yellow-800 font-medium">
//                     Đây là bản xem trước. Mua tài liệu để xem toàn bộ {numPages}{" "}
//                     trang.
//                   </p>
//                   {purchaseInfo && (
//                     <div className="mt-2">
//                       <div className="text-lg font-bold text-blue-600 mb-2">
//                         {purchaseInfo.price.toLocaleString()}{" "}
//                         {purchaseInfo.currency}
//                       </div>
//                       <button
//                         className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
//                         onClick={() => setShowPaymentModal(true)}
//                         disabled={purchasing}
//                       >
//                         {purchasing ? "Đang xử lý..." : "Mua ngay"}
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {showPaymentModal && <PaymentModal />}
//     </>
//   );
// };

// export default PDFViewer;
