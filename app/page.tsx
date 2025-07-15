"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Award,
  BookOpen,
  Heart,
  Leaf,
  Microscope,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH;

  // Auto-slide for hero section
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsLoading(true);
      // Simulate search navigation
      setTimeout(() => {
        setIsLoading(false);
        console.log(`Searching for: ${searchQuery}`);
      }, 1000);
    }
  };

  const heroSlides = [
    {
      title: "Cây Dược Liệu Việt Nam",
      subtitle: "Kho tàng y học cổ truyền dân tộc",
      description:
        "Khám phá hệ thống quản lý thông tin cây dược liệu, bài viết nghiên cứu và chuyên gia hàng đầu",
    },
    {
      title: "Nghiên Cứu Khoa Học",
      subtitle: "Ứng dụng công nghệ hiện đại",
      description:
        "Tìm hiểu các nghiên cứu mới nhất về dược liệu và ứng dụng trong y học hiện đại",
    },
    {
      title: "Chuyên Gia Hàng Đầu",
      subtitle: "Kiến thức từ các chuyên gia",
      description:
        "Kết nối với các chuyên gia và nhà nghiên cứu hàng đầu về dược liệu Việt Nam",
    },
  ];

  const featuredPlants = [
    {
      id: 1,
      name: "Ginseng Việt Nam",
      scientific: "Panax vietnamensis",
      uses: "Tăng cường miễn dịch",
      image: "🌿",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Đương quy",
      scientific: "Angelica sinensis",
      uses: "Bổ máu, điều kinh",
      image: "🌾",
      rating: 4.7,
    },
    {
      id: 3,
      name: "Cam thảo",
      scientific: "Glycyrrhiza glabra",
      uses: "Giải độc, chống viêm",
      image: "🌱",
      rating: 4.9,
    },
    {
      id: 4,
      name: "Nhân sâm",
      scientific: "Panax ginseng",
      uses: "Bồi bổ sức khỏe",
      image: "🌿",
      rating: 4.8,
    },
    {
      id: 5,
      name: "Bạch truật",
      scientific: "Atractylodes macrocephala",
      uses: "Tăng cường tiêu hóa",
      image: "🌾",
      rating: 4.6,
    },
    {
      id: 6,
      name: "Hoàng kỳ",
      scientific: "Astragalus membranaceus",
      uses: "Tăng cường miễn dịch",
      image: "🌱",
      rating: 4.7,
    },
  ];

  const statistics = [
    { value: "2,500+", label: "Cây dược liệu", icon: Leaf },
    { value: "1,200+", label: "Bài viết", icon: BookOpen },
    { value: "300+", label: "Nghiên cứu", icon: Microscope },
    { value: "150+", label: "Chuyên gia", icon: Users },
  ];

  const categories = [
    {
      title: "Cây Dược Liệu",
      description: "Thông tin chi tiết về các loại cây dược liệu Việt Nam",
      icon: Leaf,
      href: "/plants",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      count: "2,500+",
    },
    {
      title: "Bài Viết",
      description: "Các bài viết về cây dược liệu và công dụng",
      icon: BookOpen,
      href: "/articles",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      count: "1,200+",
    },
    {
      title: "Nghiên Cứu",
      description: "Đề tài nghiên cứu khoa học về dược liệu",
      icon: Microscope,
      href: "/research",
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50",
      count: "300+",
    },
    {
      title: "Chuyên Gia",
      description: "Thông tin về các chuyên gia dược liệu",
      icon: Users,
      href: "/experts",
      color: "from-orange-500 to-amber-600",
      bgColor: "bg-orange-50",
      count: "150+",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `url(${basePath}/images/herbal-bg.jpg)` }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/50 to-transparent"></div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <Sparkles className="h-4 w-4 text-yellow-300 mr-2" />
                <span className="text-white/90 text-sm font-medium">
                  Kho tàng dược liệu Việt Nam
                </span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {heroSlides[currentSlide].title}
              </h1>
              <p className="text-xl lg:text-2xl text-green-100 mb-4 font-medium">
                {heroSlides[currentSlide].subtitle}
              </p>
              <p className="text-lg text-green-200 mb-12 max-w-3xl mx-auto leading-relaxed">
                {heroSlides[currentSlide].description}
              </p>
            </div>

            <div className="flex justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                Khám phá cây dược liệu
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Slide indicators */}
            <div className="flex justify-center mt-12 space-x-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {statistics.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4 group-hover:bg-green-200 transition-colors">
                  <stat.icon className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tìm kiếm cây dược liệu
            </h2>
            <p className="text-gray-600 text-lg">
              Khám phá kho tàng dược liệu với công cụ tìm kiếm thông minh
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Nhập tên cây dược liệu, công dụng hoặc bệnh cần điều trị..."
                className="pl-12 pr-32 py-6 text-lg border-2 border-green-200 focus:border-green-500 rounded-2xl shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(e);
                  }
                }}
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl"
              >
                {isLoading ? "Đang tìm..." : "Tìm kiếm"}
              </Button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {["Ginseng", "Đương quy", "Cam thảo", "Nhân sâm", "Bạch truật"].map(
              (keyword) => (
                <button
                  key={keyword}
                  onClick={() => setSearchQuery(keyword)}
                  className="px-4 py-2 bg-white text-green-700 rounded-full hover:bg-green-100 transition-colors border border-green-200 text-sm font-medium"
                >
                  {keyword}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Danh mục chính
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Khám phá các danh mục phong phú về cây dược liệu Việt Nam
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden"
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 mx-auto bg-gradient-to-r ${category.color} shadow-lg`}
                  >
                    <category.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {category.title}
                  </CardTitle>
                  <div className="text-2xl font-bold text-green-600">
                    {category.count}
                  </div>
                </CardHeader>
                <CardContent className="text-center pb-6">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {category.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    className="w-full group-hover:bg-green-600 group-hover:text-white transition-all duration-300"
                    variant="outline"
                  >
                    Xem danh sách
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Plants Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 mb-4">
              <Award className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Được đánh giá cao</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cây dược liệu nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những loài cây dược liệu được nghiên cứu và ứng dụng nhiều nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPlants.map((plant) => (
              <Card
                key={plant.id}
                className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-100 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl">{plant.image}</div>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium">
                        {plant.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                    {plant.name}
                  </CardTitle>
                  <CardDescription className="text-sm italic text-gray-500">
                    {plant.scientific}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-center mb-3">
                    <Heart className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm text-gray-600">{plant.uses}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-all duration-300"
                  >
                    Xem chi tiết
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Xem tất cả cây dược liệu
              <TrendingUp className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn chúng tôi?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hệ thống quản lý thông tin cây dược liệu toàn diện và đáng tin cậy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6 group-hover:bg-blue-200 transition-colors">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Thông tin chính xác
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Dữ liệu được kiểm duyệt bởi các chuyên gia hàng đầu về dược liệu
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6 group-hover:bg-green-200 transition-colors">
                <Microscope className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Nghiên cứu khoa học
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Cập nhật liên tục các nghiên cứu mới nhất về dược liệu
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-6 group-hover:bg-purple-200 transition-colors">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Cộng đồng chuyên gia
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Kết nối với mạng lưới chuyên gia và nhà nghiên cứu
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
