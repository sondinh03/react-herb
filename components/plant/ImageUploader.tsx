// components/plant/ImageUploader.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Plus } from "lucide-react";

interface ImageUploaderProps {
  images: string[];
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
}

export default function ImageUploader({ images, onAddImage, onRemoveImage }: ImageUploaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Hình ảnh cây dược liệu</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={onAddImage}
        >
          <Plus className="h-4 w-4" />
          Thêm ảnh
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
              <img
                src={image || "/placeholder.svg"}
                alt={`Ảnh ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemoveImage(index)}
            >
              <X className="h-4 w-4 text-red-500" />
            </button>
          </div>
        ))}

        <div
          className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-4 hover:bg-gray-50 cursor-pointer"
          onClick={onAddImage}
        >
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 text-center">Tải lên hình ảnh</p>
        </div>
      </div>
    </div>
  );
}