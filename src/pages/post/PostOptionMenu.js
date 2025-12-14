import React from "react";
import "./PostOptionMenu.css";

const PostOptionMenu = ({ onEdit, onDelete, onClose }) => {
  return (
    <>
      {/* 1. 배경을 누르면 메뉴가 닫히도록 하는 투명 막 */}
      <div className="menu-backdrop" onClick={onClose} />

      {/* 2. 실제 메뉴 박스 */}
      <div className="menu-dropdown">
        <button className="menu-btn" onClick={onEdit}>
          수정
        </button>
        <button className="menu-btn delete" onClick={onDelete}>
          삭제
        </button>
        <button className="menu-btn cancel" onClick={onClose}>
          취소
        </button>
      </div>
    </>
  );
};

export default PostOptionMenu;
