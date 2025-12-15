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

  return (
    <div className="comment-section-wrapper">
      <hr className="divider" />

      <div className="comments-list">
        {comments.map((c, index) => (
          // key에 index를 넣어주는 게 안전함 (id가 중복되거나 없을 때 대비)
          <div key={c.id || index} className="comment-item">
            <div className="comment-main">
              {/* 작성자 닉네임 안전하게 표시 */}
              <span className="comment-username">
                {c.user?.nickname || c.username || "익명"}
              </span>

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
                // ★ 여기가 핵심: content, text, body 중 뭐라도 있으면 보여줌
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

                {/* 내 댓글인지 확인 (닉네임 비교) */}
                {(c.user?.nickname === currentUser?.nickname ||
                  c.username === currentUser?.nickname) && (
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
