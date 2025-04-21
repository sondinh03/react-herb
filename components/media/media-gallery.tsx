"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MediaUpload } from "./media-upload"
import { MediaViewer } from "./media-viewer"
import type { MediaResponse } from "@/app/types/media"
import { X, Plus, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaGalleryProps {
  selectedMediaIds?: number[]
  onMediaSelect?: (mediaIds: number[]) => void
  maxItems?: number
  className?: string
  title?: string
}

// This is a mock function - in a real application, you would fetch this from your API
async function fetchMediaList(): Promise<MediaResponse[]> {
  // Mock data for demonstration
  return [
    {
      id: 1,
      fileName: "sample1.jpg",
      filePath: "/media/2023_4/sample1.jpg",
      fileType: 1, // IMAGE
      fileSize: 1024 * 100, // 100KB
      altText: "Sample image 1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      url: "/placeholder.svg?height=200&width=200&text=Sample+1",
    },
    {
      id: 2,
      fileName: "sample2.jpg",
      filePath: "/media/2023_4/sample2.jpg",
      fileType: 1, // IMAGE
      fileSize: 1024 * 150, // 150KB
      altText: "Sample image 2",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      url: "/placeholder.svg?height=200&width=200&text=Sample+2",
    },
    // Add more mock items as needed
  ]
}

export function MediaGallery({
  selectedMediaIds = [],
  onMediaSelect,
  maxItems = 10,
  className,
  title = "Thư viện media",
}: MediaGalleryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mediaList, setMediaList] = useState<MediaResponse[]>([])
  const [selected, setSelected] = useState<number[]>(selectedMediaIds)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadMediaList()
    }
  }, [isOpen])

  useEffect(() => {
    setSelected(selectedMediaIds)
  }, [selectedMediaIds])

  const loadMediaList = async () => {
    setIsLoading(true)
    try {
      const media = await fetchMediaList()
      setMediaList(media)
    } catch (error) {
      console.error("Error loading media list:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMediaUploadSuccess = (media: MediaResponse) => {
    setMediaList((prev) => [media, ...prev])
  }

  const toggleMediaSelection = (mediaId: number) => {
    setSelected((prev) => {
      if (prev.includes(mediaId)) {
        return prev.filter((id) => id !== mediaId)
      } else {
        if (prev.length >= maxItems) {
          return prev
        }
        return [...prev, mediaId]
      }
    })
  }

  const handleSave = () => {
    if (onMediaSelect) {
      onMediaSelect(selected)
    }
    setIsOpen(false)
  }

  const removeSelectedMedia = (mediaId: number) => {
    setSelected((prev) => prev.filter((id) => id !== mediaId))
    if (onMediaSelect) {
      onMediaSelect(selected.filter((id) => id !== mediaId))
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{title}</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {selected.map((mediaId) => (
            <div key={mediaId} className="relative group aspect-square border rounded-md overflow-hidden">
              <MediaViewer mediaId={mediaId} className="w-full h-full object-cover" showLoader={true} />
              <button
                type="button"
                onClick={() => removeSelectedMedia(mediaId)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4 text-red-500" />
              </button>
            </div>
          ))}

          {selected.length < maxItems && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-full w-full border-dashed flex flex-col items-center justify-center gap-2 aspect-square"
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-sm">Thêm media</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-[90vw]">
                <DialogHeader>
                  <DialogTitle>Thư viện media</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1 border-r pr-4">
                    <h3 className="font-medium mb-4">Tải lên media mới</h3>
                    <MediaUpload onUploadSuccess={handleMediaUploadSuccess} buttonText="Tải lên" />
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="font-medium mb-4">Chọn từ thư viện</h3>

                    {isLoading ? (
                      <div className="flex items-center justify-center h-40">
                        <p>Đang tải...</p>
                      </div>
                    ) : mediaList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 border rounded-md p-4">
                        <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">Chưa có media nào</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto p-1">
                        {mediaList.map((media) => (
                          <div
                            key={media.id}
                            onClick={() => toggleMediaSelection(media.id)}
                            className={cn(
                              "relative aspect-square border rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-all",
                              selected.includes(media.id) && "ring-2 ring-primary ring-offset-2",
                            )}
                          >
                            <MediaViewer mediaId={media.id} className="w-full h-full object-cover" showLoader={false} />
                            {selected.includes(media.id) && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
                                  ✓
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between mt-4">
                      <p className="text-sm text-gray-500">
                        Đã chọn {selected.length}/{maxItems} media
                      </p>
                      <Button onClick={handleSave}>Lưu lựa chọn</Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  )
}
