import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postAPI, authAPI, commentAPI } from "../../api/api";
import CommentSection from "../../components/CommentSection";
import PostOptionMenu from "./PostOptionMenu";
import "./PostDetailPage.css";

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  const commentInputRef = useRef(null);

  // 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postRes, userRes] = await Promise.all([
          postAPI.getPostById(id),
          authAPI.getMe().catch(() => ({ data: null })),
        ]);
        setPost(postRes.data);
        setCurrentUser(userRes.data);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        alert("게시물을 불러올 수 없습니다.");
        navigate("/main");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, navigate]);

  // 이미지 URL 처리
  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("data:image")) return url;
    const path = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:4000${path}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  const toggleLike = () => {
    if (!post) return;
    const isLiked = !post.isLiked;
    setPost({
      ...post,
      isLiked: isLiked,
      likes: isLiked ? (post.likes || 0) + 1 : (post.likes || 0) - 1,
    });
  };

  // ============================================
  // ★ 댓글 기능 구현 (API 연동 + 화면 즉시 반영) ★
  // ============================================

  // 1. 댓글 작성 (수정됨: 리패칭 대신 상태 직접 업데이트)
  const handleAddComment = async (text) => {
    try {
      // 1. 서버에 전송하고 결과(생성된 댓글 정보)를 받음
      const response = await commentAPI.createComment(id, { content: text });

      // 2. 화면에 표시할 새 댓글 객체 생성
      // 서버가 준 데이터에 '작성자 정보(currentUser)'를 강제로 넣어야 바로 닉네임이 보임
      const newComment = {
        ...response.data,
        id: response.data?.id || Date.now(), // 혹시 ID 안오면 임시 ID
        content: text,
        user: currentUser, // ★ 중요: 이게 있어야 방금 쓴 댓글에 내 프사/닉네임이 뜸
        created_at: new Date().toISOString(),
      };

      // 3. 기존 댓글 목록 뒤에 붙이기
      setPost((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
      }));
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다.");
    }
  };

  // 2. 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      try {
        await commentAPI.deleteComment(commentId);

        // 화면에서 즉시 제거
        setPost((prev) => ({
          ...prev,
          comments: prev.comments.filter((c) => c.id !== commentId),
        }));
      } catch (error) {
        console.error("댓글 삭제 실패:", error);
        alert("댓글 삭제에 실패했습니다.");
      }
    }
  };

  // 3. 댓글 수정
  const handleUpdateComment = async (commentId, newText) => {
    try {
      await commentAPI.updateComment(commentId, { content: newText });

      // 화면에서 즉시 내용 변경
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.map((c) =>
          c.id === commentId ? { ...c, content: newText } : c
        ),
      }));
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      alert("댓글 수정에 실패했습니다.");
    }
  };

  // ============================================

  const handleEditPost = () => {
    navigate(`/posts/edit/${id}`);
    setShowOptions(false);
  };

  const handleDeletePost = async () => {
    if (window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      try {
        await postAPI.deletePost(id);
        alert("삭제되었습니다.");
        navigate("/main", { replace: true });
      } catch (error) {
        console.error("삭제 실패:", error);
        alert("실패했습니다.");
      }
    }
    setShowOptions(false);
  };

  const handleMoreClick = () => {
    if (currentUser?.nickname === post.user?.nickname) {
      setShowOptions(true);
    } else {
      alert("본인의 게시물만 수정/삭제할 수 있습니다.");
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (!post) return <div className="error">게시물이 존재하지 않습니다.</div>;

  return (
    <div className="post-detail-page">
      <header className="detail-header" style={{ position: "relative" }}>
        <button className="icon-btn back" onClick={() => navigate(-1)}></button>
        <span className="header-title">게시물</span>
        {currentUser?.nickname === post.user?.nickname && (
          <button className="icon-btn more" onClick={handleMoreClick}></button>
        )}
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
              post.user?.profile_image_url ||
              "https://cdn-icons-png.flaticon.com/512/847/847969.png"
            }
            alt="profile"
            className="profile-img"
          />
          <span className="username">{post.user?.nickname || "익명"}</span>
        </div>

        {post.images && post.images.length > 0 && (
          <div className="post-image-container">
            <img
              src={getImageUrl(post.images[0].url)}
              alt="detail"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300?text=No+Image";
              }}
            />
          </div>
        )}

        <div className="action-buttons">
          <button
            className={`icon-btn heart ${post.isLiked ? "liked" : ""}`}
            onClick={toggleLike}
          ></button>
          <button
            className="icon-btn comment"
            onClick={() => commentInputRef.current?.focus()}
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
            {post.body}
          </span>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="tags-section">
            {post.tags.map((tag, idx) => (
              <span key={idx} className="tag-item">
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}

        <div className="date-info">{formatDate(post.published_at)}</div>

        {/* 댓글 섹션에 기능 함수 전달 */}
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
