import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GroupListPage.css';
import EmptyState from '../components/EmptyState';

const GroupListPage = ({ groups }) => {
  const navigate = useNavigate();

  // ✅ D-Day 계산 함수 (생성일로부터 며칠 지났는지)
  const calculateDDay = (startTime) => {
    const today = new Date();
    const startDate = new Date(startTime); // group.id(타임스탬프)를 날짜로 변환

    // 시/분/초는 무시하고 '날짜'만 비교하기 위해 0시 0분 0초로 초기화
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    // 차이 계산 (밀리초 단위)
    const timeDiff = today - startDate;
    // 일(Day) 단위로 변환 (1000밀리초 * 60초 * 60분 * 24시간)
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // 오늘이면 D+0, 아니면 D+날짜
    return `D+${daysDiff}`;
  };

  const handleMakeGroup = () => {
    navigate('/create');
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
          <input type="text" className="search-input" placeholder="그룹명을 검색해 주세요" />
        </div>
        <select className="filter-select">
          <option value="likes">공감순</option>
          <option value="latest">최신순</option>
        </select>
      </div>

      {groups.length > 0 ? (
        <div className="group-grid">
          {groups.map((group) => (
            <div key={group.id} className="group-card">
              <div className="card-image-placeholder">
                <span>IMAGE</span> 
              </div>
              
              <div className="card-content">
                <div className="card-meta">
                  {/* ▼▼▼ 여기를 수정했습니다! 실제 날짜 계산 ▼▼▼ */}
                  <span className="card-date">{calculateDDay(group.id)} | {group.date}</span>
                  <span className="card-public">{group.isPublic ? '공개' : '비공개'}</span>
                </div>
                
                <h3 className="card-title">{group.name}</h3>
                <p className="card-desc">{group.description}</p>
                
                <div className="card-stats">
                  <span>획득 배지 {group.badgeCount}</span>
                  <span>추억 {group.postCount}</span>
                  <span>공감 {group.likeCount}K</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
      
      {groups.length > 0 && (
         <div className="load-more-wrapper">
            <button className="btn-load-more">더보기</button>
         </div>
      )}
    </div>
  );
};

export default GroupListPage;