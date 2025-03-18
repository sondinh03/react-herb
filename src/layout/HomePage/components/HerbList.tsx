type SearchType = {
    name: string;
    image: string;
  };
  
const herbs: SearchType[] = [
    { name: "Danh lục cây thuốc", image: "https://storage.googleapis.com/a1aa/image/mdw_wFeKzU4lBAy3eWE93A_1netTSEH01ccnDtSOxp4.jpg" },
    { name: "Tra cứu dược liệu", image: "https://storage.googleapis.com/a1aa/image/27KH51OD6Vx_kqzVazZ5kwMS9l1wPg9_5OPkRsgRXT8.jpg" },
    { name: "Tra cứu theo bệnh", image: "https://storage.googleapis.com/a1aa/image/EfjgZc_rTuv5TjpZRBc14y6jfDgT-RgpLLFI2eWIZ-o.jpg" },
    { name: "Tra cứu bài thuốc", image: "https://storage.googleapis.com/a1aa/image/edH7NOnl_V-SKbDwQnkwSMRBr7qunGjcfjwaDCMMtvA.jpg" }
  ];

export const HerbList = () => {
  return (
    <div className="bg-success bg-opacity-10 py-4 text-center">
      <h2 className="text-success fw-bold">Bạn cần biết</h2>
      <hr className="w-25 mx-auto my-4" />
      <div className="d-flex justify-content-center flex-wrap gap-4">
        {herbs.map((herb, index) => (
          <div key={index} className="text-center">
            <img src={herb.image} alt={herb.name} className="rounded mb-2" width={200} height={150} />
            <p className="text-success">{herb.name}</p>
          </div>
        ))}
      </div>
    </div>
);
};