"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarIcon,
  UserIcon,
  BuildingIcon,
  BookOpenIcon,
  EyeIcon,
  X,
  ArrowLeftIcon,
  DownloadIcon,
} from "lucide-react";
import { Research } from "@/app/types/research";
import { fetchApi } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import { ResolvedPos } from "@tiptap/pm/model";
import { BackButton } from "@/components/BackButton";
import dynamic from "next/dynamic";
import { handleWait } from "@/components/header";

const PDFViewer = dynamic(() => import("@/components/media/PDFViewer"), {
  ssr: false, // Tắt SSR để tránh lỗi DOMMatrix
});

const purchaseInfo = {
  documentId: "doc123",
  documentName: "Tài liệu học tập",
  price: 50000,
  currency: "VND",
};

export default function ResearchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const researchId = resolvedParams.id;

  const [research, setResearch] = useState<Research | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch research detail
  const fetchResearchDetail = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchApi<Research>(`/api/research/${researchId}`);
      if (result.success && result.data) {
        setResearch(result.data);
        // Chỉ set isPaid = true nếu có thông tin thanh toán từ API
        // (đây chỉ là mock, sau này sẽ kiểm tra từ API)
        setIsPaid(result.data.isPurchased || false);
      } else {
        setError(result.message || "Không thể tải thông tin nghiên cứu");
      }
    } catch (error: any) {
      setError(error.message || "Đã xảy ra lỗi khi tải dữ liệu");
      toast({
        title: "Lỗi",
        description:
          error.message || "Đã xảy ra lỗi khi tải dữ liệu nghiên cứu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseSuccess = (documentId: string) => {
    // Mock - sau này sẽ gọi API để xác nhận thanh toán
    setIsPaid(true);
    toast({
      title: "Thành công",
      description: "Bạn đã mua tài liệu thành công!",
      variant: "default",
    });
  };

  const handlePurchaseError = (error: string) => {
    toast({
      title: "Lỗi thanh toán",
      description: error,
      variant: "destructive",
    });
  };

  // Handle PDF preview
  const handlePreviewPDF = async () => {
    if (!research?.mediaUrl) return;

    setIsPreviewLoading(true);
    try {
      setShowPDFPreview(true);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể tải bản xem trước PDF",
        variant: "destructive",
      });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Handle close PDF preview
  const handleClosePDFPreview = () => {
    setShowPDFPreview(false);
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (!isPaid) {
      toast({
        title: "Không thể tải xuống",
        description: "Vui lòng mua tài liệu để tải xuống toàn bộ PDF.",
        variant: "destructive",
      });
      return;
    }
    if (research?.mediaUrl || research?.mediaId) {
      try {
        const id = research.mediaId;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_PATH}/api/media/${id}/download`
        );

        if (!response.ok) {
          throw new Error(`Lỗi tải xuống: ${response.statusText}`);
        }
        if (
          !response.headers.get("content-type")?.includes("application/pdf")
        ) {
          throw new Error("Tệp không phải định dạng PDF");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        const contentDisposition = response.headers.get("content-disposition");
        let fileName = research.title || "document";

        if (contentDisposition && contentDisposition.includes("filename=")) {
          fileName = contentDisposition.split("filename=")[1].replace(/"/g, "");
        }
        link.download = `${fileName}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (error: any) {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tải xuống PDF",
          variant: "destructive",
        });
      }
    }
  };

  // Get status badge
  const getStatusBadge = (status: number) => {
    const statusMap = {
      1: { label: "Bản nháp", variant: "secondary" as const },
      2: { label: "Chờ duyệt", variant: "default" as const },
      3: { label: "Đã xuất bản", variant: "default" as const },
      4: { label: "Lưu trữ", variant: "outline" as const },
      5: { label: "Từ chối", variant: "destructive" as const },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap];
    return (
      <Badge variant={statusInfo?.variant || "secondary"}>
        {statusInfo?.label || "Không xác định"}
      </Badge>
    );
  };

  useEffect(() => {
    fetchResearchDetail();
  }, [researchId]);

  useEffect(() => {
    if (research && research.downloadPrice === 0) {
      setIsPaid(true);
    } else {
      setIsPaid(false);
    }
  }, [research]);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-4 bg-gray-200 rounded w-full"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !research) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Không thể tải nghiên cứu
          </h2>
          <p className="text-gray-600">
            {error || "Nghiên cứu không tồn tại hoặc đã bị xóa"}
          </p>
          <BackButton href="research" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BackButton href="/research" />

          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {research.title}
            </h1>

            {research.abstract && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {research.abstract}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {research.authors && (
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="font-medium text-gray-900">
                    {research.authors}
                  </span>
                </div>
              )}
              {research.institution && (
                <div className="flex items-center gap-2">
                  <BuildingIcon className="h-4 w-4" />
                  <span>{research.institution}</span>
                </div>
              )}
              {research.publishedYear && (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{research.publishedYear}</span>
                </div>
              )}
              {research.journal && (
                <div className="flex items-center gap-2">
                  <BookOpenIcon className="h-4 w-4" />
                  <span>{research.journal}</span>
                </div>
              )}
              {research.views && (
                <div className="flex items-center gap-2">
                  <EyeIcon className="h-4 w-4" />
                  <span>{research.views.toLocaleString()} lượt xem</span>
                </div>
              )}
            </div>

            {research.mediaUrl && (
              <div className="flex items-center gap-3">
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviewPDF}
                  disabled={isPreviewLoading}
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  {isPreviewLoading ? "Đang tải..." : "Xem trước PDF"}
                </Button> */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  disabled={!isPaid}
                  className={
                    isPaid
                      ? "hover:bg-gray-100"
                      : "opacity-50 cursor-not-allowed"
                  }
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Tải xuống PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3">
            <Card className="mb-8">
              <CardContent className="p-6">
                <div
                  className="prose prose-lg prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-blue-600"
                  dangerouslySetInnerHTML={{ __html: research.content }}
                />
              </CardContent>
            </Card>

            {/* Chỉ hiện PDF Preview khi showPDFPreview = true */}
            {showPDFPreview && research?.mediaUrl && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      {isPaid ? "Tài liệu đã mua" : "Xem trước PDF"}
                    </h2>
                  </div>
                  <PDFViewer
                    pdfUrl={`${baseUrl}${research.mediaUrl}`}
                    maxPreviewPages={research.previewPages || 2}
                    isPaid={isPaid}
                    purchaseInfo={{
                      documentId: research.id.toString(),
                      documentName: research.title,
                      price: research.downloadPrice || 50000,
                      currency: "VND",
                    }}
                    onPurchaseSuccess={handlePurchaseSuccess}
                    onPurchaseError={handlePurchaseError}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
