import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GroupListPage.css";
import EmptyState from "../components/EmptyState";

const GroupListPage = () => {
  const navigate = useNavigate(); // ✅ 이동 함수 생성

  // 버튼 클릭 시 '/create' 주소로 이동하는 함수
  const handleMakeGroup = () => {
    navigate("/create");
  };

  return (
    <div className="container">
      <div className="header-actions">
        <button className="btn-black" onClick={handleMakeGroup}>
          그룹 만들기
        </button>
      </div>

      <div className="search-bar-wrapper">
        <div className="search-input-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="그룹명을 검색해 주세요"
          />
        </div>
        <select className="filter-select">
          <option value="likes">공감순</option>
          <option value="latest">최신순</option>
        </select>
      </div>

      {/* 데이터 없음 화면 (여기도 버튼이 있다면 클릭 시 handleMakeGroup 실행 필요) */}
      <EmptyState />
    </div>
  );
};

export default GroupListPage;
