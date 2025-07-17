"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseInfo: {
    documentName: string;
    price: number;
    currency: string;
  };
  onConfirm: () => Promise<void>;
}

export function PaymentDialog({
  open,
  onOpenChange,
  purchaseInfo,
  onConfirm,
}: PaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      await onConfirm();
    } finally {
      setIsProcessing(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận thanh toán</DialogTitle>
          <DialogDescription>
            Bạn đang mua tài liệu `{purchaseInfo.documentName}`` với giá{" "}
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(purchaseInfo.price)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Hủy
          </Button>
          <Button onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Thanh toán"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}