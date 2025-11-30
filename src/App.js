import React, { useState } from "react";
import GroupListPage from "./pages/GroupListPage";
import CreateGroupPage from "./pages/CreateGroupPage";

function App() {
  // 현재 어떤 페이지를 보여줄지 결정하는 상태 (기본값: 'list')
  const [currentPage, setCurrentPage] = useState("list");

  // 그룹 만들기 페이지로 이동하는 함수
  const handleShowCreatePage = () => {
    setCurrentPage("create");
  };

  // ✅ 추가됨: 다시 목록 페이지로 돌아오는 함수
  const handleShowListPage = () => {
    setCurrentPage("list");
  };

  return (
    <div className="App">
      {/* currentPage가 'list'이면 목록 페이지를 보여줌 */}
      {currentPage === "list" && (
        <GroupListPage onMakeGroupClick={handleShowCreatePage} />
      )}

      {/* currentPage가 'create'이면 그룹 만들기 페이지를 보여줌 */}
      {currentPage === "create" && (
        // ✅ 수정됨: onCloseClick 이라는 이름으로 돌아오는 함수를 전달!
        <CreateGroupPage onCloseClick={handleShowListPage} />
      )}
    </div>
  );
}

export default App;
