"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { uploadMedia } from "@/services/media-service"
import type { MediaResponse } from "@/app/types/media"
import { Upload, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaUploadProps {
  onUploadSuccess?: (media: MediaResponse) => void
  onUploadError?: (error: Error) => void
  allowedTypes?: string[]
  maxSize?: number // in MB
  className?: string
  buttonText?: string
  showPreview?: boolean
}

export function MediaUpload({
  onUploadSuccess,
  onUploadError,
  allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  maxSize = 5, // 5MB
  className = "",
  buttonText = "Tải lên",
  showPreview = true,
}: MediaUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [altText, setAltText] = useState("")
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]

    if (!selectedFile) {
      return
    }

    // Kiểm tra loại file
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Loại file không hợp lệ",
        description: `Chỉ chấp nhận các loại file: ${allowedTypes.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    // Kiểm tra kích thước file
    if (selectedFile.size > maxSize * 1024 * 1024) {
      toast({
        title: "File quá lớn",
        description: `Kích thước file tối đa là ${maxSize}MB`,
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)

    // Tạo preview cho hình ảnh
    if (showPreview && selectedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Chưa chọn file",
        description: "Vui lòng chọn file để upload",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Giả lập tiến trình upload
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      const response = await uploadMedia(file, altText)

      clearInterval(interval)
      setUploadProgress(100)

      if (response.success) {
        toast({
          title: "Upload thành công",
          description: "File đã được upload thành công",
        })

        if (onUploadSuccess) {
          onUploadSuccess(response.data)
        }

        // Reset form
        setFile(null)
        setAltText("")
        setPreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        throw new Error(response.message || "Upload thất bại")
      }
    } catch (error: any) {
      console.error("Error uploading media:", error)

      toast({
        title: "Upload thất bại",
        description: error.message || "Đã xảy ra lỗi khi upload file",
        variant: "destructive",
      })

      if (onUploadError) {
        onUploadError(error)
      }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="media">Chọn file</Label>
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            id="media"
            type="file"
            accept={allowedTypes.join(",")}
            onChange={handleFileChange}
            disabled={isUploading}
            className="flex-1"
          />
          {file && (
            <Button type="button" variant="outline" size="icon" onClick={handleRemoveFile} disabled={isUploading}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Loại file: {allowedTypes.join(", ")}. Kích thước tối đa: {maxSize}MB
        </p>
      </div>

      {showPreview && preview && (
        <div className="relative w-full max-w-sm">
          <img src={preview || "/placeholder.svg"} alt="Preview" className="rounded-md max-h-48 object-contain" />
        </div>
      )}

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="altText">Mô tả hình ảnh</Label>
        <Input
          id="altText"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Nhập mô tả cho hình ảnh"
          disabled={isUploading}
        />
      </div>

      {isUploading && (
        <div className="w-full max-w-sm">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">{uploadProgress}% hoàn thành</p>
        </div>
      )}

      <Button type="button" onClick={handleUpload} disabled={!file || isUploading} className="w-full max-w-sm">
        {isUploading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang upload...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {buttonText}
          </span>
        )}
      </Button>
    </div>
  )
}
