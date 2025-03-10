import React from 'react';  //Import thư viện React core
import ReactDOM from 'react-dom/client';  // Import ReactDOM để render vào DOM thật
import './index.css'; // Import file css chung
import { App } from './App';  // Import component App chính

//  Tạo root element, createRoot() là API của React 18 để tạo root cho ứng dụng
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement  // Tìm element có id là "root" trong file HTML
);

root.render(
    <App />
);