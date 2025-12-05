import React, { useState, useRef } from "react"; // ✅ useRef 추가
import { useNavigate } from "react-router-dom";
import "../styles/CreateGroupPage.css";

const CreateGroupPage = ({ onAddGroup }) => {
  const navigate = useNavigate();

  // ✅ 숨겨진 진짜 파일 입력창을 제어하기 위한 Ref
  const fileInputRef = useRef(null);

  // 입력값 상태
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [fileName, setFileName] = useState(""); // ✅ 파일명 표시용 상태

  // ✅ "파일 선택" 버튼을 눌렀을 때 실행되는 함수
  const handleFileButtonClick = () => {
    // 숨겨져 있는 진짜 파일 입력창(input type="file")을 프로그램적으로 클릭!
    fileInputRef.current.click();
  };

  // ✅ 실제로 파일이 선택되었을 때 실행되는 함수
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // 선택된 첫 번째 파일
    if (file) {
      setFileName(file.name); // 파일명을 상태에 저장 (화면에 보여주기 위해)
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newGroup = {
      id: Date.now(),
      name: groupName,
      description: groupDesc,
      imageUrl: fileName, // (나중에 이미지를 실제로 보여주려면 로직 추가 필요)
      date: new Date().toLocaleDateString(),
      isPublic: true,
      likeCount: 0,
      postCount: 0,
    };

    onAddGroup(newGroup);
    navigate("/");
  };

  return (
    <div className="create-container">
      <div className="form-box">
        <button className="close-btn" onClick={() => navigate("/")}>
          ×
        </button>
        <h2 className="form-title">그룹 만들기</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">그룹명</label>
            <input
              type="text"
              className="input-field"
              placeholder="그룹명을 입력해 주세요"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">대표 이미지</label>
            <div className="file-upload-wrapper">
              <input
                type="text"
                className="file-name-input"
                placeholder="파일을 선택해 주세요"
                value={fileName} // ✅ 선택된 파일명이 여기에 표시됨
                readOnly
              />

              {/* ✅ 버튼을 누르면 handleFileButtonClick 실행 */}
              <button
                type="button"
                className="file-upload-btn"
                onClick={handleFileButtonClick}
              >
                파일 선택
              </button>

              {/* ✅ [핵심] 실제 파일 입력창은 숨겨둡니다 (display: none) */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">그룹 소개</label>
            <textarea
              className="input-field"
              rows="4"
              placeholder="그룹을 소개해 주세요"
              style={{ resize: "none" }}
              value={groupDesc}
              onChange={(e) => setGroupDesc(e.target.value)}
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
