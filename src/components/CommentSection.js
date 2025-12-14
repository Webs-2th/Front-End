import { useState } from "react"; // useRef는 이제 안 씀 (부모 거 쓸 거라)
import "./CommentSection.css";

// props에 inputRef 추가됨
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

  const startEdit = (id, currentText) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const finishEdit = (id) => {
    onUpdate(id, editText);
    setEditingId(null);
  };

  return (
    <div className="comment-section-wrapper">
      <hr className="divider" />

      <div className="comments-list">
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <span className="comment-username">{c.username}</span>

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
              </div>
            ) : (
              <span className="comment-text">{c.text}</span>
            )}

            {c.username === currentUser.username && !editingId && (
              <div className="comment-actions">
                <button onClick={() => startEdit(c.id, c.text)}>수정</button>
                <button onClick={() => onDelete(c.id)} className="delete">
                  삭제
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <form className="comment-input-bar" onSubmit={handleSubmit}>
        <input
          ref={inputRef} /* ★ 여기에 부모에게 받은 ref 연결! */
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
