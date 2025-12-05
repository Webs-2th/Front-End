import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import GroupListPage from "./pages/GroupListPage";
import CreateGroupPage from "./pages/CreateGroupPage";

function App() {
  // 전체 그룹 목록을 관리하는 State (초기값은 빈 배열)
  const [groups, setGroups] = useState([]);

  // 새로운 그룹을 목록에 추가하는 함수
  const handleAddGroup = (newGroup) => {
    setGroups([...groups, newGroup]); // 기존 목록에 새 그룹 추가
  };

  return (
    <div className="App">
      <Routes>
        {/* 목록 페이지에 groups 데이터를 전달 */}
        <Route path="/" element={<GroupListPage groups={groups} />} />

        {/* 만들기 페이지에 추가 함수(handleAddGroup)를 전달 */}
        <Route
          path="/create"
          element={<CreateGroupPage onAddGroup={handleAddGroup} />}
        />
      </Routes>
    </div>
  );
}

export default App;
