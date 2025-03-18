import { Link } from 'react-router-dom';

export const HeroSection = () => {
  /*
    return (
      <section className="bg-gradient-to-r from-green-700 to-green-500 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-4xl font-bold mb-4">Khám phá kho tàng dược liệu Việt Nam</h2>
              <p className="text-xl mb-6">Hệ thống quản lý toàn diện về cây dược liệu, bài viết chuyên ngành và mạng lưới chuyên gia hàng đầu.</p>
              <div className="flex space-x-4">
                <button className="bg-white text-green-700 hover:bg-green-100 px-6 py-3 rounded-lg font-medium">
                  Tìm hiểu thêm
                </button>
                <button className="bg-transparent border-2 border-white hover:bg-white hover:text-green-700 px-6 py-3 rounded-lg font-medium">
                  Liên hệ ngay
                </button>
              </div>
            </div>
            <div className="md:w-1/2">
              <img src={require("../../../images/bg/backgorund.jpg")} alt="Dược liệu Việt Nam" className="rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>
    );
  */

  return (
    <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={require('../../../images/bg/backgorund.jpg')}
          alt="Dược liệu Việt Nam"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-25"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
        <div className="W:full mb-8 md:mb-0">
          <h2 className="text-4xl font-bold mb-4">
            Khám phá kho tàng dược liệu Việt Nam
          </h2>
          <p className="text-xl mb-6">
            Hệ thống quản lý toàn diện về cây dược liệu, bài viết chuyên ngành
            và mạng lưới chuyên gia hàng đầu.
          </p>

          {/* 
          <div className="flex justify-center items-center space-x-4">
            <button className="bg-white text-green-700 hover:bg-green-100 px-6 py-3 rounded-lg font-medium">
              Tra cứu dược liệu
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-white hover:text-green-700 px-6 py-3 rounded-lg font-medium">
              Liên hệ chuyên gia
            </button>
          </div>
          */}

          <div className="flex justify-center items-center space-x-4">
            <Link
              to="/tra-cuu-duoc-lieu" // Thay đổi đường dẫn theo nhu cầu
              className="bg-white text-green-700 px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:bg-green-50 hover:scale-105 active:scale-95 active:bg-green-100 text-decoration-none"
            >
              Tra cứu dược liệu
            </Link>

            <Link
              to="/lien-he-chuyen-gia" // Thay đổi đường dẫn theo nhu cầu
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-white hover:text-green-700 hover:shadow-md hover:scale-105 active:scale-95 active:bg-green-50 text-decoration-none"
            >
              Liên hệ chuyên gia
            </Link>
          </div>
        </div>
        {/* <div className="flex flex-col md:flex-row items-center"> */}

        <div className="md:w-1/2">
          {/* You can add additional content or images here if needed */}
        </div>
        {/* </div> */}
      </div>
    </section>
  );
};
