import { FormEvent, useEffect, useState } from 'react';
import { Pagination } from './components/Pagination';
import { Header } from '../HomePage/components/Header';
import { SearchBar } from './components/SearchBar';
import { HerbCard } from './components/HerbCard';
import {
  PlantResponseDto,
  SearchDto,
  searchPlants,
} from '../../models/PlantService';

export const SearchHerbPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [plants, setPlants] = useState<PlantResponseDto[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(2);

  const fetchPlants = async (pageIndex = 1, pageSize = 2, keyword = '') => {
    setLoading(true);

    try {
      const searchDto: SearchDto = {
        pageIndex: pageIndex,
        pageSize: pageSize,
        keyword: keyword,
      };

      const response = await searchPlants(searchDto);

      if (response && response.data) {
        setPlants(response.data.content);
        setTotalElements(response.data.totalElements);
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants(pageIndex, pageSize, searchTerm);
  }, [pageIndex, pageSize]);

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    fetchPlants(1, pageSize, searchTerm); // Reset về trang 1 khi tìm kiếm mới
    setPageIndex(1);
  }

  // Hàm xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    setPageIndex(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const alphabetLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="max-w-6xl mx-auto font-sans p-4">
      <Header />
      <h1 className="text-2xl text-gray-700 mb-2">Tra cứu dược liệu</h1>

      <div className="text-sm text-gray-600 mb-6 pb-2 border-b border-gray-200">
        <a href="/" className="text-green-700 hover:underline">
          Trang chủ
        </a>{' '}
        &gt; <span>Tra cứu dược liệu</span>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
          <h2 className="text-xl text-green-700 font-medium mb-4">
            Tra cứu dược liệu
          </h2>

          {/* Truyền handleSearch và searchTerm vào SearchBar component */}

          <form onSubmit={handleSearch} className="mb-6 flex">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </form>

          <div className="flex flex-wrap mb-8">
            {alphabetLetters.map((letter) => (
              <a
                key={letter}
                href={`#${letter}`}
                onClick={(e) => {
                  e.preventDefault();
                  fetchPlants(0, pageSize, letter);
                  setPageIndex(0);
                }}
                className="w-8 h-8 mr-1 mb-1 bg-green-700 text-white flex items-center justify-center font-bold text-decoration-none"
              >
                {letter}
              </a>
            ))}
          </div>

          {/*
          <div className="grid grid-cols-4 gap-4 mb-8">
            {herbsData.map((herb) => (
              <div key={herb.id} className="text-center">
                <img
                  src={herb.imagePath}
                  alt={herb.name}
                  className="w-full h-40 object-cover border border-gray-200"
                />
                <div className="text-green-700 mt-2 font-medium">
                  {herb.name}
                </div>
              </div>
            ))}
          </div>
          */}
          <HerbCard plants={plants} loading={loading} />

          {/* Pagination component với tổng số trang và callback */}
          {totalElements > 0 && (
            <Pagination 
              currentPage={pageIndex}
              totalPages={Math.ceil(totalElements / pageSize)}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        <div className="col-span-1">
          <div className="mb-4 bg-green-700 bg-opacity-20 rounded overflow-hidden">
            <div className="h-20 flex items-center px-4 bg-green-700 bg-opacity-50">
              <h3 className="text-white font-medium">Tra cứu dược liệu</h3>
            </div>
          </div>

          <div className="mb-4 bg-green-700 bg-opacity-20 rounded overflow-hidden">
            <div className="h-20 flex items-center px-4 bg-green-700 bg-opacity-50">
              <h3 className="text-white font-medium">Danh lục cây thuốc</h3>
            </div>
          </div>

          <div className="mb-4 bg-green-700 bg-opacity-20 rounded overflow-hidden">
            <div className="h-20 flex items-center px-4 bg-green-700 bg-opacity-50">
              <h3 className="text-white font-medium">Tra cứu theo bệnh</h3>
            </div>
          </div>

          <div className="mb-4 bg-green-700 bg-opacity-20 rounded overflow-hidden">
            <div className="h-20 flex items-center px-4 bg-green-700 bg-opacity-50">
              <h3 className="text-white font-medium">Tra cứu bài thuốc</h3>
            </div>
          </div>

          <div className="bg-green-700 rounded overflow-hidden">
            <h3 className="text-white font-medium p-4">
              Dược liệu được quan tâm
            </h3>
            <div className="bg-white p-4 flex space-x-3">
              <img
                // src="/api/placeholder/80/80"
                alt="Anh thảo"
                className="w-20 h-20 object-cover"
              />
              <div>
                <h4 className="text-green-700 font-medium">Anh thảo</h4>
                <p className="text-sm text-gray-600">
                  Oenothera biennis L. (Hoa anh thảo) là một loài thực vật có...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-5 right-5">
        <button className="bg-blue-500 text-white rounded-full px-4 py-2 flex items-center">
          Chat messenger
          <span className="ml-2 w-6 h-6 rounded-full bg-white text-blue-500 flex items-center justify-center text-lg">
            ✉
          </span>
        </button>
      </div>
    </div>
  );
};
