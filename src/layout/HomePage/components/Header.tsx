import { Search, Leaf } from "lucide-react";
import { NavLink } from "react-router-dom";

export const Header = () => {
  const navItems = [
    { path: "/", label: "Trang chủ" },
    { path: "/tra-cuu-duoc-lieu", label: "Cây dược liệu" },
    { path: "/tin-tuc", label: "Tin tức" },
    { path: "/chuyen-gia", label: "Chuyên gia" },
    { path: "/lien-he", label: "Liên hệ" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-b from-green-700 to-green-600 text-white z-50 shadow-2xl">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Thảo Dược Việt</h1>
          </div>
          {/* 
          <nav className="hidden md:flex space-x-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg transition ${
                  isActive ? "bg-white text-green-700" : "text-white"
                } hover:bg-green-100 hover:text-green-700 no-underline`
              }
            >
              Trang chủ
            </NavLink>
            <NavLink
              to="/search-herb"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg transition ${
                  isActive ? "bg-white text-green-700" : "text-white"
                } hover:bg-green-100 hover:text-green-700 no-underline`
              }
            >
              Cây dược liệu
            </NavLink>
            <NavLink
              to="/tin-tuc"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg transition ${
                  isActive ? "bg-white text-green-700" : "text-white"
                } hover:bg-green-100 hover:text-green-700 no-underline`
              }
            >
              Tin tức
            </NavLink>
            <NavLink
              to="/chuyen-gia"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg transition ${
                  isActive ? "bg-white text-green-700" : "text-white"
                } hover:bg-green-100 hover:text-green-700 no-underline`
              }
            >
              Chuyên gia
            </NavLink>
            <NavLink
              to="/lien-he"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg transition ${
                  isActive ? "bg-white text-green-700" : "text-white"
                } hover:bg-green-100 hover:text-green-700 no-underline`
              }
            >
              Liên hệ
            </NavLink>
          </nav>
          */}

          {/*
          <nav className="hidden md:flex items-center space-x-2 rounded-xl p-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-medium transition duration-200 ${
                    isActive
                      ? "bg-white text-green-700 shadow-sm"
                      : "text-green-50 hover:bg-green-600 hover:text-white"
                  } no-underline flex items-center`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          */}

          <nav className="hidden md:flex items-center space-x-1 rounded-xl p-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md font-medium text-sm transition-all duration-200 border-b-2 ${
                    isActive
                      ? "border-white text-white bg-green-600/30"
                      : "border-transparent text-green-50 hover:bg-green-600/20 hover:text-white"
                  } no-underline flex items-center`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="bg-green-800 text-white rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-green-200"
              />
              <Search className="absolute left-3 top-2 h-5 w-5 text-green-200" />
            </div>
            <button className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg">
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
