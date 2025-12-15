import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postAPI, authAPI, commentAPI } from "../../api/api";
import CommentSection from "../../components/CommentSection";
import PostOptionMenu from "./PostOptionMenu";
import "./PostDetailPage.css";

const getSafeTags = (tags) => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");
  }
  return [];
};

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  const commentInputRef = useRef(null);

  // 1. 데이터 불러오기 (게시글 + 내 정보 + 댓글 목록)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [postRes, commentsRes, userRes] = await Promise.allSettled([
          postAPI.getPostById(id),
          commentAPI.getComments(id),
          authAPI.getMe(),
        ]);

        if (postRes.status === "fulfilled") {
          const fetchedPost = postRes.value.data;

          if (commentsRes.status === "fulfilled") {
            const fetchedComments =
              commentsRes.value.data.items || commentsRes.value.data || [];
            fetchedPost.comments = fetchedComments;
            console.log("불러온 댓글:", fetchedComments);
          } else {
            fetchedPost.comments = [];
          }

          setPost(fetchedPost);
        } else {
          throw new Error("게시물을 불러오지 못했습니다.");
        }

        if (userRes.status === "fulfilled" && userRes.value.data) {
          setCurrentUser(userRes.value.data);
        }
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

  // ★ [핵심 수정] 사용자 이름 표시 로직 강화
  const getDisplayName = (user, authorId) => {
    // 1순위: user 객체가 존재할 경우, 최대한 이름을 찾아 반환 (다른 사용자 닉네임 표시)
    if (user) {
      return (
        user.nickname ||
        user.username ||
        user.name ||
        (user.email ? user.email.split("@")[0] : "익명 사용자")
      );
    }

    // 2순위: user 객체는 없으나, ID를 통해 현재 로그인한 '나'의 글임을 확인
    if (currentUser && authorId) {
      if (String(currentUser.id) === String(authorId)) {
        return currentUser.nickname || currentUser.username || "나";
      }
    }

    return "익명 사용자";
  };

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

  // 댓글 작성 (화면 즉시 반영)
  const handleAddComment = async (text) => {
    try {
      const response = await commentAPI.createComment(id, { content: text });
      const newComment = {
        ...response.data,
        id: response.data?.id || Date.now(),
        content: text,
        user: currentUser,
        created_at: new Date().toISOString(),
      };
      setPost((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
      }));
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      try {
        await commentAPI.deleteComment(commentId);
        setPost((prev) => ({
          ...prev,
          comments: prev.comments.filter((c) => c.id !== commentId),
        }));
      } catch (error) {
        console.error("댓글 삭제 실패:", error);
      }
    }
  };

  const handleUpdateComment = async (commentId, newText) => {
    try {
      await commentAPI.updateComment(commentId, { content: newText });
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.map((c) =>
          c.id === commentId ? { ...c, content: newText } : c
        ),
      }));
    } catch (error) {
      console.error("댓글 수정 실패:", error);
    }
  };

  const handleEditPost = () => {
    navigate(`/posts/edit/${id}`);
    setShowOptions(false);
  };

  const handleDeletePost = async () => {
    if (window.confirm("정말로 삭제하시겠습니까?")) {
      try {
        await postAPI.deletePost(id);
        navigate("/main", { replace: true });
      } catch (error) {
        alert("삭제 실패");
      }
    }
    setShowOptions(false);
  };

  const handleMoreClick = () => {
    const isMyPost =
      (currentUser?.id && post.user?.id && currentUser.id === post.user.id) ||
      currentUser?.nickname === post.user?.nickname ||
      (post.user_id &&
        currentUser?.id &&
        String(post.user_id) === String(currentUser.id));

    if (isMyPost) {
      setShowOptions(true);
    } else {
      alert("권한이 없습니다.");
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (!post) return <div className="error">게시물이 존재하지 않습니다.</div>;

  return (
    <div className="post-detail-page">
      <header className="detail-header">
        <button className="icon-btn back" onClick={() => navigate(-1)}></button>
        <span className="header-title">게시물</span>

        {((currentUser?.id &&
          post.user_id &&
          String(currentUser.id) === String(post.user_id)) ||
          post.user?.nickname === currentUser?.nickname) && (
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
              currentUser?.profile_image_url ||
              "https://cdn-icons-png.flaticon.com/512/847/847969.png"
            }
            alt="profile"
            className="profile-img"
          />
          <span className="username">
            {getDisplayName(post.user, post.user_id || post.userId)}
          </span>
        </div>

        {post.images && post.images.length > 0 && (
          <div className="post-image-container">
            <img
              src={getImageUrl(post.images[0].url)}
              alt="detail"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300";
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

        {getSafeTags(post.tags).length > 0 && (
          <div className="tags-section">
            {getSafeTags(post.tags).map((tag, idx) => (
              <span key={idx} className="tag-item">
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}

        <div className="date-info">{formatDate(post.published_at)}</div>

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
