import React from "react";
import "../styles/CreateGroupPage.css";

// onCloseClick: App.js에서 받아온 "목록으로 돌아가는 함수"
const CreateGroupPage = ({ onCloseClick }) => {
  return (
    <div className="create-container">
      <div className="form-box">
        {/* ▼▼▼ [중요] 닫기 버튼 코드가 여기 있어야 합니다! ▼▼▼ */}
        <button className="close-btn" onClick={onCloseClick}>
          ×
        </button>

        <h2 className="form-title">그룹 만들기</h2>

        <form>
          <div className="input-group">
            <label className="input-label">그룹명</label>
            <input
              type="text"
              className="input-field"
              placeholder="그룹명을 입력해 주세요"
            />
          </div>

          <div className="input-group">
            <label className="input-label">대표 이미지</label>
            <div className="file-upload-wrapper">
              <input
                type="text"
                className="file-name-input"
                placeholder="파일을 선택해 주세요"
                readOnly
              />
              <button type="button" className="file-upload-btn">
                파일 선택
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">그룹 소개</label>
            <textarea
              className="input-field"
              rows="4"
              placeholder="그룹을 소개해 주세요"
              style={{ resize: "none" }}
            ></textarea>
          </div>

          <div className="input-group">
            <label className="input-label">비밀번호 생성</label>
            <input
              type="password"
              className="input-field"
              placeholder="그룹 비밀번호를 생성해 주세요"
            />
          </div>

          <button type="submit" className="submit-btn">
            만들기
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupPage;
