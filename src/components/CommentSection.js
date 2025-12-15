import { useState } from "react";
import "./CommentSection.css";

const CommentSection = ({
  comments,
  currentUser,
  onAdd,
  onDelete,
  onUpdate,
  inputRef,
}) => {
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text);
    setText("");
  };

  const startEdit = (id, currentContent) => {
    setEditingId(id);
    setEditText(currentContent);
  };

  const finishEdit = (id) => {
    if (!editText.trim()) return;
    onUpdate(id, editText);
    setEditingId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  // ★ [수정] 닉네임 표시 로직 강화
  // 서버가 user 객체 안에 줄 수도 있고, 그냥 nickname 필드로 줄 수도 있어서 다 체크함
  const getDisplayName = (comment) => {
    return (
      comment.user?.nickname || // 1순위: user 객체 안의 닉네임
      comment.nickname || // 2순위: 댓글 객체 바로 아래 닉네임
      comment.username || // 3순위: username 필드
      "익명" // 없으면 익명
    );
  };

  // ★ [수정] 내 댓글인지 확인하는 로직 강화 (ID 비교 우선)
  const isMyComment = (comment) => {
    if (!currentUser) return false;

    // 1. ID로 확실하게 비교 (가장 정확함)
    // comment.user_id 혹은 comment.user.id 와 내 id 비교
    const commentUserId = comment.user_id || comment.userId || comment.user?.id;
    if (commentUserId && currentUser.id) {
      return String(commentUserId) === String(currentUser.id);
    }

    // 2. ID가 없으면 닉네임으로 비교 (차선책)
    const authorName = getDisplayName(comment);
    return authorName === currentUser.nickname;
  };

  return (
    <div className="comment-section-wrapper">
      <hr className="divider" />

      <div className="comments-list">
        {comments.map((c, index) => (
          <div key={c.id || index} className="comment-item">
            <div className="comment-main">
              {/* 작성자 닉네임 표시 함수 사용 */}
              <span className="comment-username">{getDisplayName(c)}</span>

              {editingId === c.id ? (
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
                <span className="comment-text">
                  {c.content || c.text || c.body || ""}
                </span>
              )}
            </div>

            {!editingId && (
              <div className="comment-meta">
                <span className="comment-date">
                  {formatDate(c.created_at || c.date)}
                </span>

                {/* 수정된 권한 체크 함수 사용 */}
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

      <form className="comment-input-bar" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
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
