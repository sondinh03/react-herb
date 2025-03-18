import 'bootstrap/dist/css/bootstrap.min.css';

interface Expert {
  name: string;
  title: string;
  image: string;
}

const experts: Expert[] = [
  {
    name: 'TTND. GS. TS. NGUYỄN VĂN MÙI',
    title: 'Nguyên PGĐ Kiêm chủ nhiệm bộ môn truyền nhiễm bệnh viện Quân y 103',
    image:
      'https://storage.googleapis.com/a1aa/image/s7eDzbpPq2l_wkf7XyPi0BC09Te_VuvuIkwN3m-v_60.jpg',
  },
  {
    name: 'PGS. TS. NGUYỄN DUY THUẦN',
    title:
      'PGĐ Học viện Y dược học cổ truyền VN - Viện Trưởng Viện nghiên cứu Y Dược Tuệ Tĩnh',
    image:
      'https://storage.googleapis.com/a1aa/image/7heBfkxUnwl6erA8DuzSWLeYyUv-rN6_qSgEBpg7Pds.jpg',
  },
  {
    name: 'PGS. TS. NGUYỄN THƯỢNG DONG',
    title: 'Viện trưởng viện Dược liệu Trung ương',
    image:
      'https://storage.googleapis.com/a1aa/image/KIfQHSbvhc1c7on_nWu6NnhrzWcds26btd8mym8xq_o.jpg',
  },
  {
    name: 'TS. NGÔ ĐỨC PHƯƠNG',
    title: 'Viện trưởng viện Khoa học Thuốc nam Trung ương',
    image:
      'https://storage.googleapis.com/a1aa/image/hLcpT6TJ3qTUdiq4-rIYhwQpFd5AetX9A_NGPfC4NFY.jpg',
  },
];

const ExpertCard: React.FC<Expert> = ({ name, title, image }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 text-center max-w-sm mx-auto flex flex-col h-full">
    <img
      src={image}
      alt={`Portrait of ${name}`}
      className="w-32 h-32 mx-auto rounded-full border-4 border-green-500"
    />
    <h2 className="text-green-800 font-bold mt-4">{name}</h2>
    <p className="text-gray-700 mt-2">{title}</p>
    <div className="mt-auto">
      <button className="mt-4 px-4 py-2 border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white">
        XEM THÊM
      </button>
    </div>
  </div>
);

export const ExpertCorner = () => {
  return (
    <div className="bg-green-100 min-h-screen">
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-green-800">Góc chuyên gia</h1>
        <hr className="w-25 mx-auto my-4" />
      </div>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {experts.map((expert) => (
            <ExpertCard key={expert.name} {...expert} />
          ))}
        </div>
      </div>
    </div>
  );
};
