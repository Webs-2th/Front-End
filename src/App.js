import React from "react";
import { Routes, Route } from "react-router-dom";
import GroupListPage from "./pages/GroupListPage";
import CreateGroupPage from "./pages/CreateGroupPage";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* 주소가 "/" (기본)일 때 목록 페이지 보여줌 */}
        <Route path="/" element={<GroupListPage />} />

        {/* 주소가 "/create" 일 때 그룹 만들기 페이지 보여줌 */}
        <Route path="/create" element={<CreateGroupPage />} />
      </Routes>
    </div>
  );
}

export default App;
