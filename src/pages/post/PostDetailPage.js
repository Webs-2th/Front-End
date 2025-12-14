import { useEffect, useState, useRef } from "react"; // useRef 추가
import { useParams, useNavigate } from "react-router-dom";
import CommentSection from "../../components/CommentSection";
import "./PostDetailPage.css";

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  // ★ 입력창 제어용 ref 생성
  const commentInputRef = useRef(null);

  const currentUser = {
    username: "um_chwoo",
  };

  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem("posts")) || [];
    const targetPost = savedPosts.find((p) => p.id.toString() === id);
    setPost(targetPost);
  }, [id]);

  const updatePostData = (newPostData) => {
    const savedPosts = JSON.parse(localStorage.getItem("posts")) || [];
    const updatedPosts = savedPosts.map((p) =>
      p.id === newPostData.id ? newPostData : p
    );
    localStorage.setItem("posts", JSON.stringify(updatedPosts));
    setPost(newPostData);
  };

  const toggleLike = () => {
    if (!post) return;
    const isLiked = !post.isLiked;
    updatePostData({
      ...post,
      isLiked: isLiked,
      likes: isLiked ? (post.likes || 0) + 1 : (post.likes || 0) - 1,
    });
  };

  // ★ 댓글 아이콘 누르면 실행될 함수
  const handleFocusInput = () => {
    commentInputRef.current?.focus();
  };

  // --- 댓글 관련 로직 ---
  const handleAddComment = (text) => {
    const newComment = {
      id: Date.now(),
      username: currentUser.username,
      text: text,
      date: new Date().toISOString().split("T")[0],
    };
    updatePostData({
      ...post,
      comments: [...(post.comments || []), newComment],
    });
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm("삭제하시겠습니까?")) {
      const filtered = (post.comments || []).filter((c) => c.id !== commentId);
      updatePostData({ ...post, comments: filtered });
    }
  };

  const handleUpdateComment = (commentId, newText) => {
    const updated = (post.comments || []).map((c) =>
      c.id === commentId ? { ...c, text: newText } : c
    );
    updatePostData({ ...post, comments: updated });
  };

  if (!post) return <div className="loading">로딩 중...</div>;

  return (
    <div className="post-detail-page">
      <header className="detail-header">
        <button className="icon-btn back" onClick={() => navigate(-1)}></button>
        <span className="header-title">게시물</span>
        <button className="icon-btn more"></button>
      </header>

      <div className="detail-content">
        <div className="user-info">
          <img
            src={
              post.author?.profileImg ||
              "https://cdn-icons-png.flaticon.com/512/847/847969.png"
            }
            alt="profile"
            className="profile-img"
          />
          <span className="username">{post.author?.username || "익명"}</span>
        </div>

        {post.image && (
          <div className="post-image-container">
            <img src={post.image} alt="detail" />
          </div>
        )}

        <div className="action-buttons">
          <button
            className={`icon-btn heart ${post.isLiked ? "liked" : ""}`}
            onClick={toggleLike}
          ></button>
          {/* ★ onClick 추가: 누르면 입력창 포커스 */}
          <button
            className="icon-btn comment"
            onClick={handleFocusInput}
          ></button>
        </div>

        <div className="likes-info">
          <span className="likes-count">좋아요 {post.likes || 0}개</span>
          <span className="comments-count">
            댓글 {(post.comments || []).length}개
          </span>
        </div>

        <div className="caption-section">
          <span className="username">{post.author?.username}</span>
          <span className="caption-text">{post.content}</span>
        </div>

        <div className="date-info">{post.date}</div>

        {/* ★ inputRef 전달 */}
        <CommentSection
          comments={post.comments || []}
          currentUser={currentUser}
          onAdd={handleAddComment}
          onDelete={handleDeleteComment}
          onUpdate={handleUpdateComment}
          inputRef={commentInputRef}
        />
      </div>
    </div>
  );
};

export default PostDetailPage;
