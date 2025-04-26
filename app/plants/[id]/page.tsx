"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Share2,
  Printer,
  BookOpen,
  Leaf,
  FlaskRoundIcon as Flask,
  Map,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"
import { MediaViewer } from "@/components/media/media-viewer"
import { Plant } from "@/app/types/plant"

// Interface for media items
interface MediaItem {
  id: string
  url: string
  alt: string
}

export default function PlantDetailPage({ params }: { params: { id: string } }) {
  const plantId = params.id
  const [plant, setPlant] = useState<Plant | null>(null)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isPlantLoading, setIsPlantLoading] = useState(true)
  const [isMediaLoading, setIsMediaLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch plant details
  useEffect(() => {
    const fetchPlantDetails = async () => {
      console.log("Starting fetchPlantDetails")
      setIsPlantLoading(true)
      try {
        const response = await fetch(`/api/plants/${plantId}`)
        console.log("fetchPlantDetails response:", response.status)
        if (!response.ok) {
          throw new Error("Không thể lấy thông tin cây dược liệu")
        }
        const data = await response.json()
        setPlant(data.data)
      } catch (err: any) {
        console.error("fetchPlantDetails error:", err)
        setError(err.message)
        toast({
          title: "Lỗi",
          description: err.message,
          variant: "destructive",
        })
      } finally {
        setIsPlantLoading(false)
        console.log("fetchPlantDetails completed")
      }
    }

    fetchPlantDetails()
  }, [plantId])

  // Fetch media IDs
  useEffect(() => {
    const fetchMediaIds = async () => {
      if (!plantId) {
        setMediaItems([])
        setIsMediaLoading(false)
        return
      }

      console.log("Starting fetchMediaIds")
      try {
        setIsMediaLoading(true)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

        const response = await fetch(`/api/plants/${plantId}/media-ids`, {
          signal: controller.signal,
        })

        console.log("fetchMediaIds response:", response.status)
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Lỗi khi tải danh sách hình ảnh: ${response.status}`)
        }

        const result = await response.json()
        console.log("fetchMediaIds result:", result)

        if (result.success) {
          const mediaIds = result.data || []
          const items: MediaItem[] = mediaIds.map((id: string, index: number) => ({
            id,
            url: `/api/media/${id}`, // Adjust URL pattern if needed
            alt: `Hình ảnh ${plant?.name || "cây dược liệu"} ${index + 1}`,
          }))
          // Fallback to plant.images if mediaIds is empty and images exist
          if (items.length === 0 && plant?.images?.length) {
            const fallbackItems: MediaItem[] = plant.images.map((url, index) => ({
              id: `fallback-${index}`,
              url,
              alt: `Hình ảnh ${plant?.name || "cây dược liệu"} ${index + 1}`,
            }))
            setMediaItems(fallbackItems)
          } else {
            setMediaItems(items)
          }
        } else {
          throw new Error(result.message || "Không thể tải danh sách hình ảnh")
        }
      } catch (error: any) {
        console.error("fetchMediaIds error:", error)
        if (error.name !== "AbortError") {
          toast({
            title: "Lỗi",
            description: error.message || "Không thể tải danh sách hình ảnh",
            variant: "destructive",
          })
          // Fallback to plant.images on error if available
          if (plant?.images?.length) {
            const fallbackItems: MediaItem[] = plant.images.map((url, index) => ({
              id: `fallback-${index}`,
              url,
              alt: `Hình ảnh ${plant?.name || "cây dược liệu"} ${index + 1}`,
            }))
            setMediaItems(fallbackItems)
          }
        }
      } finally {
        setIsMediaLoading(false)
        console.log("fetchMediaIds completed")
      }
    }

    fetchMediaIds()
  }, [plantId, plant])

  if (isPlantLoading) {
    return <div className="text-center py-12">Đang tải...</div>
  }

  if (error || !plant) {
    return (
      <div className="text-center py-12 text-red-600">
        {error || "Không thể tải thông tin cây dược liệu"}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link href="/plants">
          <Button
            variant="ghost"
            className="flex items-center gap-2 pl-0 hover:pl-2 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {plant.name} ({plant.scientificName})
              </h1>
              <p className="mt-2 text-gray-600">{plant.family}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Chia sẻ</span>
              </Button>
              <Button variant="outline" size="icon">
                <Printer className="h-4 w-4" />
                <span className="sr-only">In</span>
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
                <span className="sr-only">Tải xuống</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Sửa
              </Button>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Xóa
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-1">
              {isMediaLoading ? (
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  Đang tải hình ảnh...
                </div>
              ) : mediaItems.length > 0 ? (
                <MediaViewer mediaItems={mediaItems} />
              ) : (
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  Không có hình ảnh nào.
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                    Thông tin chung
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Tên khoa học:</span>{" "}
                        {plant.scientificName}
                      </p>
                      <p>
                        <span className="font-medium">Họ:</span> {plant.family}
                      </p>
                      <p>
                        <span className="font-medium">Chi:</span> {plant.genus}
                      </p>
                      <p>
                        <span className="font-medium">Tên khác:</span>{" "}
                        {plant.otherNames}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Bộ phận dùng:</span>{" "}
                        {plant.partsUsed}
                      </p>
                      <p>
                        <span className="font-medium">Vùng phân bố:</span>{" "}
                        {plant.distribution}
                      </p>
                      <p>
                        <span className="font-medium">Độ cao:</span>{" "}
                        {plant.altitude}
                      </p>
                      <p>
                        <span className="font-medium">Mùa thu hoạch:</span>{" "}
                        {plant.harvestSeason}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <Leaf className="h-5 w-5 mr-2 text-green-600" />
                    Đặc điểm thực vật
                  </h2>
                  <p className="text-gray-700">{plant.botanicalCharacteristics}</p>
                  <p className="text-gray-700">
                    <strong>Thân:</strong> {plant.stem}
                  </p>
                  <p className="text-gray-700">
                    <strong>Lá:</strong> {plant.leaves}
                  </p>
                  <p className="text-gray-700">
                    <strong>Hoa:</strong> {plant.flowers}
                  </p>
                  <p className="text-gray-700">
                    <strong>Quả:</strong> {plant.fruits}
                  </p>
                  <p className="text-gray-700">
                    <strong>Rễ:</strong> {plant.roots}
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <Flask className="h-5 w-5 mr-2 text-green-600" />
                    Thành phần hóa học
                  </h2>
                  <p className="text-gray-700">{plant.chemicalComposition}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <Map className="h-5 w-5 mr-2 text-green-600" />
                    Phân bố và sinh thái
                  </h2>
                  <p className="text-gray-700">{plant.ecology}</p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="cong-dung" className="mt-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
              <TabsTrigger value="cong-dung">Công dụng</TabsTrigger>
              <TabsTrigger value="cach-dung">Cách dùng</TabsTrigger>
              <TabsTrigger value="nghien-cuu">Nghiên cứu</TabsTrigger>
              <TabsTrigger value="bai-viet">Bài viết liên quan</TabsTrigger>
            </TabsList>

            <TabsContent value="cong-dung" className="space-y-4">
              <h3 className="text-lg font-semibold">Công dụng y học</h3>
              <p className="text-gray-700">{plant.medicinalUses}</p>

              <h3 className="text-lg font-semibold mt-6">Chỉ định</h3>
              <p className="text-gray-700">{plant.indications}</p>

              <h3 className="text-lg font-semibold mt-6">Chống chỉ định</h3>
              <p className="text-gray-700">{plant.contraindications}</p>

              <h3 className="text-lg font-semibold mt-6">Tác dụng phụ</h3>
              <p className="text-gray-700">{plant.sideEffects}</p>
            </TabsContent>

            <TabsContent value="cach-dung" className="space-y-4">
              <h3 className="text-lg font-semibold">Liều dùng và cách dùng</h3>
              <p className="text-gray-700">{plant.dosage}</p>

              <h3 className="text-lg font-semibold mt-6">Bài thuốc dân gian</h3>
              <p className="text-gray-700">{plant.folkRemedies}</p>
            </TabsContent>

            <TabsContent value="nghien-cuu" className="space-y-4">
              <h3 className="text-lg font-semibold">Các nghiên cứu khoa học</h3>
              <p className="text-gray-700">
                Hiện chưa có nghiên cứu khoa học cụ thể được cung cấp trong dữ liệu. Vui lòng kiểm tra lại hoặc liên hệ
                quản trị viên.
              </p>
              <div className="mt-6 text-center">
                <Link href={`/research?plant=${plantId}`}>
                  <Button variant="outline">Xem thêm nghiên cứu</Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="bai-viet" className="space-y-4">
              <h3 className="text-lg font-semibold">Bài viết liên quan</h3>
              <p className="text-gray-700">
                Hiện chưa có bài viết liên quan được cung cấp trong dữ liệu. Vui lòng kiểm tra lại hoặc liên hệ quản trị
                viên.
              </p>
              <div className="mt-6 text-center">
                <Link href={`/articles?plant=${plantId}`}>
                  <Button variant="outline">Xem thêm bài viết</Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}