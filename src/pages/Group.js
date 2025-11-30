import React from "react";
import "../styles/GroupListPage.css"; // 스타일 import
import EmptyState from "../components/EmptyState"; // 컴포넌트 import

const GroupListPage = () => {
  return (
    <div className="container">
      {/* 상단: 그룹 만들기 버튼 */}
      <div className="header-actions">
        <button className="btn-black">그룹 만들기</button>
      </div>

      {/* 검색 및 필터 바 */}
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

      {/* 메인 콘텐츠: 데이터가 없을 때 표시 */}
      <EmptyState />
    </div>
  );
};

export default GroupListPage;
