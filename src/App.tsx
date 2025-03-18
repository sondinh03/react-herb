import React from "react";
import "./App.css";
import { HomePage } from "./layout/HomePage/HomePage";
import { SearchHerbPage } from "./layout/SearchHerbPage/SearchHerbPage";
import { Route, Routes } from "react-router-dom";

export const App = () => {
  return (
    <div className="flex-grow">
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/tra-cuu-duoc-lieu" element={<SearchHerbPage />} />
        {/* Route mặc định */}
        <Route path="/" element={<HomePage />} />
      </Routes>
    </div>
  );
};
