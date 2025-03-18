export const HeaderNav = () => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-green-800">Tra cứu dược liệu</h1>
      <div className="flex items-center text-sm text-gray-600 mt-2">
        <a href="/" className="text-green-700 hover:text-green-900">
          Trang chủ
        </a>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-700">Tra cứu dược liệu</span>
      </div>
    </div>
  );
};
