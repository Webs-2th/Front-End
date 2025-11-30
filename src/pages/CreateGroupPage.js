import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ 이동 도구
import "../styles/CreateGroupPage.css";

const CreateGroupPage = () => {
  const navigate = useNavigate(); // ✅ 이동 함수 생성

  return (
    <div className="create-container">
      <div className="form-box">
        {/* X 버튼 클릭 시 홈('/')으로 이동 */}
        <button className="close-btn" onClick={() => navigate("/")}>
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
