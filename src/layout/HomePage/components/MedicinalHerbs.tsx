import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

type Herb = {
  id: String;
  name: string;
  image: string;
};

const herbs: Herb[] = [
  {
    id: '1',
    name: 'Cà gai leo',
    image:
      'https://storage.googleapis.com/a1aa/image/nY4XxtFpr2I0u0JWUwnxYqSSqLIipLZ88zIrSd5wH98.jpg',
  },
  {
    id: '2',
    name: 'Sâm cau',
    image:
      'https://storage.googleapis.com/a1aa/image/ui-P3j6-vvM4ywSUZGgK96f4niOdgEL-ljwVYkz-Eps.jpg',
  },
  {
    id: '3',
    name: 'Giảo cổ lam',
    image:
      'https://storage.googleapis.com/a1aa/image/ztGFvLMay5nyOhq40Ni_DzwRClbpe6--tjwDOhsEMPY.jpg',
  },
  {
    id: '4',
    name: 'Anh thảo',
    image:
      'https://storage.googleapis.com/a1aa/image/eYBH_J2cbu7_VbDlUaJNT9JsUlQUMRL41x_GCG9BUHY.jpg',
  },
  {
    id: '5',
    name: 'Sâm tố nữ',
    image:
      'https://storage.googleapis.com/a1aa/image/-Wm2WI5T4kBwcDEMQT4LmYrvO6a1zx8Fq-dltk3WHw4.jpg',
  },
  {
    id: '6',
    name: 'Tầm gửi gạo',
    image:
      'https://storage.googleapis.com/a1aa/image/A9si9WaVbbCoDDtYfWZ4S284fATch69wMSbev4vXNdY.jpg',
  },
  {
    id: '7',
    name: 'Khúng khéng',
    image:
      'https://storage.googleapis.com/a1aa/image/aGK8MWs6nxpySLg8K8j-rFF81Djy4SP6kLIcU2f0Wug.jpg',
  },
  {
    id: '8',
    name: 'Bách bệnh',
    image:
      'https://storage.googleapis.com/a1aa/image/d5i_XMmx9Z0XlQKzkNuibIPwY-zhaS4U0XgDfWbjrac.jpg',
  },
];

export const MedicinalHerbs = () => {
  return (
    <div className="container text-center py-4">
      <h1 className="text-success fw-bold">Dược liệu</h1>
      <p className="text-secondary">Được tìm kiếm nhiều</p>
      <hr className="w-25 mx-auto my-4" />
      <div className="row g-4">
        {herbs.map((herb) => (
          <div key={herb.name} className="col-6 col-sm-4 col-md-3">
            {/* <Link to={`/duoc-lieu/${herb.id}`} className="text-decoration-none"> */}
            <Link to="/#" className="text-decoration-none">
              <div className="herb-card shadow-sm rounded p-2">
                <img
                  src={herb.image}
                  alt={`Hình ảnh của ${herb.name}`}
                  className="img-fluid rounded herb-card__image"
                  loading="lazy"
                />
                <p className="text-success mt-2 herb-card__name">{herb.name}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
