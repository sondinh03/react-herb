const articles = [
    {
      title: "Cách dùng trà Giảo Cổ Lam để bảo vệ sức khỏe",
      image: "https://storage.googleapis.com/a1aa/image/H0pw50YttfM5Y2M9v5XWr5ixOSJNEedT2yUzVWG4g7o.jpg",
      description: "Trà giảo cổ lam Tuệ Linh là dòng sản phẩm được bào chế 100% từ cây giảo cổ lam vùng núi ...",
      link: "#"
    },
    {
      title: "Giảo cổ lam có tốt cho gan không?",
      image: "https://storage.googleapis.com/a1aa/image/3Pky4c8U77eMAxOvrr1Ydw5PRMPEOTza2sHqY2vhdbw.jpg",
      description: "Giảo cổ lam được biết đến là một loại thảo dược quý được sử dụng rộng rãi trong y học cổ ...",
      link: "#"
    },
    {
      title: "Cây tóp mỡ lá to – đặc điểm, công dụng chữa bệnh",
      image: "https://storage.googleapis.com/a1aa/image/9baOYM-7BLymeR2Ywj6HLr5AYKX5YcNde9daXqZhayI.jpg",
      description: "Cây tóp mỡ lá to là một loại thực vật thuộc họ Đậu (Fabaceae), có tên khoa học là ...",
      link: "#"
    },
    {
      title: "Rau cần đại có đặc điểm gì, có ăn được không?",
      image: "https://storage.googleapis.com/a1aa/image/P7FGjiWNruuhvNH15l7LQEtzcCDFE7vV-ureyVbFO00.jpg",
      description: "Rau cần đại, một loại cây mọc hoang ở ven sông, ao hồ hay những vùng đất ẩm, có vẻ ngoài ...",
      link: "#"
    }
];

export const NewsSection = () => {
    return (
        <div className="py-4 text-center">
          <h2 className="text-success fw-bold">Bản tin dược liệu</h2>
          <hr className="w-25 mx-auto my-4" />
          <div className="d-flex justify-content-center flex-wrap gap-4">
            {articles.map((article, index) => (
              <div key={index} className="card" style={{ width: "18rem" }}>
                <img src={article.image} alt={article.title} className="card-img-top" />
                <div className="card-body">
                  <h5 className="card-title text-success">{article.title}</h5>
                  <p className="card-text">{article.description} <a href={article.link} className="text-success">Đọc thêm</a></p>
                </div>
              </div>
            ))}
          </div>
        </div>
    );
};