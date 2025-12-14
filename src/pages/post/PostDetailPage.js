import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CommentSection from "../../components/CommentSection";
import PostOptionMenu from "./PostOptionMenu";
import "./PostDetailPage.css";

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [showOptions, setShowOptions] = useState(false); // 메뉴 표시 여부

  const commentInputRef = useRef(null);

  // 현재 로그인한 사용자 (가정)
  const currentUser = {
    username: "um_chwoo",
  };

  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem("posts")) || [];
    const targetPost = savedPosts.find((p) => p.id.toString() === id);
    setPost(targetPost);
  }, [id]);

  // 데이터 업데이트 함수 (좋아요/댓글 등)
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

  const handleFocusInput = () => {
    commentInputRef.current?.focus();
  };

  // --- 댓글 관련 함수들 ---
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
    if (window.confirm("댓글을 삭제하시겠습니까?")) {
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

  // --- 게시물 수정/삭제 기능 ---

  // 1. 수정 버튼 클릭 시 -> 수정 페이지로 이동
  const handleEditPost = () => {
    navigate(`/posts/edit/${id}`);
    setShowOptions(false);
  };

  // 2. 삭제 버튼 클릭 시 -> 바로 삭제
  const handleDeletePost = () => {
    if (window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      const savedPosts = JSON.parse(localStorage.getItem("posts")) || [];
      const filteredPosts = savedPosts.filter((p) => p.id.toString() !== id);
      localStorage.setItem("posts", JSON.stringify(filteredPosts));

      alert("삭제되었습니다.");
      navigate("/main"); // 메인으로 이동
    }
    setShowOptions(false);
  };

  // 3. 더보기(...) 버튼 클릭
  const handleMoreClick = () => {
    // 내 글일 때만 메뉴 열기
    if (post.author?.username === currentUser.username) {
      setShowOptions(true);
    } else {
      alert("본인의 게시물만 수정/삭제할 수 있습니다.");
    }
  };

  if (!post) return <div className="loading">로딩 중...</div>;

  return (
    <div className="post-detail-page">
      {/* 중요: style={{ position: 'relative' }}를 추가했습니다.
        그래야 PostOptionMenu가 이 헤더를 기준으로 위치를 잡습니다.
      */}
      <header className="detail-header" style={{ position: "relative" }}>
        <button className="icon-btn back" onClick={() => navigate(-1)}></button>
        <span className="header-title">게시물</span>

        {/* 더보기 버튼 */}
        <button className="icon-btn more" onClick={handleMoreClick}></button>

        {/* 메뉴 컴포넌트를 헤더 안에 배치했습니다.
           showOptions가 true일 때만 ...버튼 아래에 나타납니다.
        */}
        {showOptions && (
          <PostOptionMenu
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            onClose={() => setShowOptions(false)}
          />
        )}
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
          <span className="caption-text" style={{ marginLeft: 0 }}>
            {post.content}
          </span>
        </div>

        {post.tags && (
          <div className="tags-section">
            {post.tags.split(" ").map((tag, idx) => (
              <span key={idx} className="tag-item">
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}

        <div className="date-info">{post.date}</div>

        <CommentSection
          comments={post.comments || []}
          currentUser={currentUser}
          onAdd={handleAddComment}
          onDelete={handleDeleteComment}
          onUpdate={handleUpdateComment}
          inputRef={commentInputRef}
        />
      </div>

      {/* 기존 하단 모달(Bottom Sheet) 코드는 삭제했습니다 */}
    </div>
  );
};

export default PostDetailPage;
