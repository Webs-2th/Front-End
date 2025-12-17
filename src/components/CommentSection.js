import { useState } from "react";
import "./CommentSection.css";

const CommentSection = ({
  comments, // 댓글 목록
  currentUser, // 현재 로그인 한 사용자 정보
  onAdd, // 댓글 추가
  onDelete, // 댓글 삭제
  onUpdate, // 댓글 수정
}) => {
  const [text, setText] = useState(""); // 댓글 입력창에 현재 입력되고 있는 댓글 내용을 저장
  const [editingId, setEditingId] = useState(null); // 현재 수정 중인 댓글의 id를 저장
  const [editText, setEditText] = useState(""); // 댓글 수정 시 input에 표시될 댓글 내용을 저장

  // 댓글 작성
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text);
    setText("");
  };

  // 댓글 수정 버튼
  const startEdit = (id, currentContent) => {
    setEditingId(id);
    setEditText(currentContent);
  };

  // 댓글 수정 완료 버튼 클릭 시 실행
  const finishEdit = (id) => {
    if (!editText.trim()) return;
    onUpdate(id, editText);
    setEditingId(null);
  };

  // 서버에서 받은 날짜 문자열을 YYYY-MM-DD 형식으로 변환
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  // 댓글 작성자의 이름
  const getDisplayName = (comment) => {
    return comment.user?.nickname || comment.nickname || comment.username;
  };

  // 댓글 판별
  const isMyComment = (comment) => {
    if (!currentUser) return false;

    const commentUserId = comment.user_id || comment.userId || comment.user?.id;
    // 댓글 작성자 id를 다양한 형태로 확인

    if (commentUserId && currentUser.id) {
      return String(commentUserId) === String(currentUser.id);
      // 작성자 id와 현재 사용자 id 비교
    }

    // id 비교가 불가능한 경우 작성자 이름으로 비교
    const authorName = getDisplayName(comment);
    return authorName === currentUser.nickname;
  };

  return (
    <div className="comment-section-wrapper">
      {/* 댓글 영역 구분선 */}
      <hr className="divider" />

      {/* 댓글 목록 출력 영역 */}
      <div className="comments-list">
        {comments.map((c, index) => (
          <div key={c.id || index} className="comment-item">
            <div className="comment-main">
              {/* 댓글 작성자 이름 표시 */}
              <span className="comment-username">{getDisplayName(c)}</span>

              {/* 수정 중인 댓글인지 여부에 따라 화면 변경 */}
              {editingId === c.id ? (
                // 댓글 수정 모드
                <div className="edit-mode">
                  <input
                    className="edit-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <button onClick={() => finishEdit(c.id)} className="save-btn">
                    완료
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="cancel-btn"
                  >
                    취소
                  </button>
                </div>
              ) : (
                // 일반 댓글 표시 모드
                <span className="comment-text">
                  {c.content || c.text || c.body || ""}
                </span>
              )}
            </div>

            {/* 수정 중이 아닐 때만 날짜와 액션 버튼 표시 */}
            {!editingId && (
              <div className="comment-meta">
                {/* 댓글 작성 날짜 */}
                <span className="comment-date">
                  {formatDate(c.created_at || c.date)}
                </span>

                {/* 내 댓글일 경우에만 수정/삭제 버튼 표시 */}
                {isMyComment(c) && (
                  <div className="comment-actions">
                    <button
                      onClick={() => startEdit(c.id, c.content || c.text)}
                    >
                      수정
                    </button>
                    <button onClick={() => onDelete(c.id)} className="delete">
                      삭제
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 댓글 입력 영역 */}
      <form className="comment-input-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="댓글 달기..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" disabled={!text.trim()}>
          게시
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
