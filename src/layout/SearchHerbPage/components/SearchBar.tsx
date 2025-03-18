import { useState } from 'react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const SearchBar = ({searchTerm, setSearchTerm }: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="mb-6 flex flex-col sm:flex-row rounded-lg overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="relative flex-grow">
        <input
          type="text"
          placeholder="Nhập tên thuốc hoặc tên bệnh để tra cứu"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full px-4 py-3 text-gray-700 outline-none border rounded-tl-lg rounded-bl-lg ${
            isFocused ? 'border-black' : 'border-gray-300'
          } transition-all duration-200`}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Xóa nội dung tìm kiếm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={!searchTerm}
        className={`bg-green-700 text-white font-medium px-6 py-3 flex items-center justify-center transition-all duration-200 ${
          searchTerm ? 'hover:bg-green-800 active:bg-green-900' : 'opacity-50 cursor-not-allowed'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        TRA CỨU
      </button>
    </div>
  );
};
