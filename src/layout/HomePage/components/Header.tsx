import "bootstrap/dist/css/bootstrap.min.css";

export const Header = () => {
    return (
        <div className="position-relative min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
          <img
            src={require("../../../images/bg/backgorund.jpg")}
            alt="Background with green leaves and mountains"
            className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover opacity-50"
          />
          
          <div className="position-relative text-center">
            <img
              src={require("../../../images/LogoImages/herb_logo.png")}
              alt="Logo with medicinal search text"
              className="mb-4"
              width={100}
              height={100}
            />
            
            <nav className="mb-4">
              <ul className="nav nav-pills justify-content-center">
                <li className="nav-item">
                  <a className="nav-link active" href="#">Trang chủ</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">Giới thiệu</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">Danh sách dược liệu</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">Tin tức</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">Video</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">Chuyên gia dược liệu</a>
                </li>
              </ul>
            </nav>
            
            <div className="input-group mb-3 w-50 mx-auto">
              <input type="text" className="form-control" placeholder="Tên dược liệu cần tìm" />
              <button className="btn btn-success" type="button">
                <i className="fas fa-search"></i> TRA CỨU
              </button>
            </div>
            
            <p className="text-success mb-2">
              Từ khóa được tìm kiếm nhiều: Giảo cổ lam, Sâm cau, Hà thủ ô, Đông trùng hạ thảo
            </p>
            <p className="text-success">
              Tra cứu khoa học – Thông tin đầy đủ, phong phú – Được tư vấn bởi các chuyên gia hàng đầu
            </p>
          </div>
        </div>
    );
}