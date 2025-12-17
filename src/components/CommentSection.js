import { useState } from "react";
import "./CommentSection.css";

const CommentSection = ({
  comments,
  currentUser,
  onAdd,
  onDelete,
  onUpdate,
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

  const getDisplayName = (comment) => {
    return comment.user?.nickname || comment.nickname || comment.username;
  };

  const isMyComment = (comment) => {
    if (!currentUser) return false;

    const commentUserId = comment.user_id || comment.userId || comment.user?.id;
    if (commentUserId && currentUser.id) {
      return String(commentUserId) === String(currentUser.id);
    }

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
