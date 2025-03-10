import "bootstrap/dist/css/bootstrap.min.css";

type Herb = {
    name: string;
    image: string;
  };
  
const herbs: Herb[] = [
    { name: "Danh lục cây thuốc", image: "https://storage.googleapis.com/a1aa/image/mdw_wFeKzU4lBAy3eWE93A_1netTSEH01ccnDtSOxp4.jpg" },
    { name: "Tra cứu dược liệu", image: "https://storage.googleapis.com/a1aa/image/27KH51OD6Vx_kqzVazZ5kwMS9l1wPg9_5OPkRsgRXT8.jpg" },
    { name: "Tra cứu theo bệnh", image: "https://storage.googleapis.com/a1aa/image/EfjgZc_rTuv5TjpZRBc14y6jfDgT-RgpLLFI2eWIZ-o.jpg" },
    { name: "Tra cứu bài thuốc", image: "https://storage.googleapis.com/a1aa/image/edH7NOnl_V-SKbDwQnkwSMRBr7qunGjcfjwaDCMMtvA.jpg" }
  ];

export const MedicinalHerbs = () => {
    return (
        <div className="container text-center py-4">
          <h1 className="text-success fw-bold">DƯỢC LIỆU</h1>
          <p className="text-secondary">Được tìm kiếm nhiều</p>
          <hr className="w-25 mx-auto my-4" />
          <div className="row g-4">
            {herbs.map((herb, index) => (
              <div key={index} className="col-6 col-sm-4 col-md-3">
                <img src={herb.image} alt={herb.name} className="img-fluid rounded" />
                <p className="text-success mt-2">{herb.name}</p>
              </div>
            ))}
          </div>
        </div>
    );
}