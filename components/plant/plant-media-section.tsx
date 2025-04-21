"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MediaGallery } from "@/components/media/media-gallery"
import { MediaViewer } from "@/components/media/media-viewer"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlantMediaSectionProps {
  selectedMediaIds: number[]
  onChange: (mediaIds: number[]) => void
  className?: string
}

export function PlantMediaSection({ selectedMediaIds = [], onChange, className }: PlantMediaSectionProps) {
  const [reordering, setReordering] = useState(false)

  const handleMediaSelect = (mediaIds: number[]) => {
    onChange(mediaIds)
  }

  const moveMedia = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === selectedMediaIds.length - 1)) {
      return
    }

    const newOrder = [...selectedMediaIds]
    const targetIndex =
      direction === "up"
        ? index - 1
        : (index + 1
    
    // Swap positions
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]])

    onChange(newOrder)
  }

  const removeMedia = (index: number) => {
    const newMediaIds = [...selectedMediaIds]
    newMediaIds.splice(index, 1)
    onChange(newMediaIds)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Hình ảnh & Tài liệu</CardTitle>
            <CardDescription>Thêm hình ảnh và tài liệu liên quan đến cây dược liệu</CardDescription>
          </div>
          {selectedMediaIds.length > 1 && (
            <Button variant="outline" size="sm" onClick={() => setReordering(!reordering)}>
              {reordering ? "Xong" : "Sắp xếp lại"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedMediaIds.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {selectedMediaIds.map((mediaId, index) => (
              <div key={mediaId} className="relative group aspect-square border rounded-md overflow-hidden">
                <MediaViewer mediaId={mediaId} className="w-full h-full object-cover" />

                <div
                  className={cn(
                    "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center",
                    reordering && "opacity-100",
                  )}
                >
                  {reordering ? (
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-white"
                        onClick={() => moveMedia(index, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-white"
                        onClick={() => moveMedia(index, "down")}
                        disabled={index === selectedMediaIds.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-white text-red-500"
                      onClick={() => removeMedia(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {index === 0 && (
                  <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1">Ảnh chính</div>
                )}
              </div>
            ))}
          </div>
        )}

        <MediaGallery
          selectedMediaIds={selectedMediaIds}
          onMediaSelect={handleMediaSelect}
          maxItems={10}
          title="Hình ảnh cây dược liệu"
        />
      </CardContent>
    </Card>
  )
}
