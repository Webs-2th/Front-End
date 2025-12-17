import React from "react";
import "./PostOptionMenu.css";

const PostOptionMenu = ({ onEdit, onDelete, onClose }) => {
  return (
    <>
      <div className="menu-backdrop" onClick={onClose} />

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
