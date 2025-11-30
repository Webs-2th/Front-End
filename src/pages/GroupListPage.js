import React from "react";
import "../styles/GroupListPage.css";
import EmptyState from "../components/EmptyState";

// App.js에서 전달한 onMakeGroupClick 함수를 받아옵니다
const GroupListPage = ({ onMakeGroupClick }) => {
  return (
    <div className="container">
      {/* 상단 헤더 영역 (버튼) */}
      <div className="header-actions">
        {/* 버튼 클릭 시 페이지 전환 함수 실행 */}
        <button className="btn-black" onClick={onMakeGroupClick}>
          그룹 만들기
        </button>
      </div>

      {/* 검색 및 필터 영역 */}
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

      {/* 데이터 없음 컴포넌트 */}
      <EmptyState />
    </div>
  );
};

export default GroupListPage;
