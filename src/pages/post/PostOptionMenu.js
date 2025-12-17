import React from "react";
import "./PostOptionMenu.css";

// 게시물 수정/삭제 옵션 메뉴 컴포넌트
const PostOptionMenu = ({ onEdit, onDelete, onClose }) => {
  return (
    <>
      {/* 배경 클릭 시 메뉴 닫기 */}
      <div className="menu-backdrop" onClick={onClose} />

      {/* 옵션 메뉴 영역 */}
      <div className="menu-dropdown">
        {/* 게시물 수정 */}
        <button className="menu-btn" onClick={onEdit}>
          수정
        </button>

        {/* 게시물 삭제 */}
        <button className="menu-btn delete" onClick={onDelete}>
          삭제
        </button>

        {/* 메뉴 닫기 */}
        <button className="menu-btn cancel" onClick={onClose}>
          취소
        </button>
      </div>
    </>
  );
};

export default PostOptionMenu;
