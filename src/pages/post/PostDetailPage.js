import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postAPI, authAPI, commentAPI } from "../../api/api";
import CommentSection from "../../components/CommentSection";
import PostOptionMenu from "./PostOptionMenu";
import "./PostDetailPage.css";

// 태그 문자열/배열 처리 헬퍼 함수
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

  // 1. 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [postRes, commentsRes, userRes] = await Promise.allSettled([
          postAPI.getPostById(id),
          commentAPI.getComments(id),
          authAPI.getMe(),
        ]);

        // 1-1. 게시글 데이터
        if (postRes.status === "fulfilled") {
          const fetchedPost = postRes.value.data;

          // 1-2. 댓글 데이터
          let fetchedComments = [];
          if (commentsRes.status === "fulfilled") {
            fetchedComments =
              commentsRes.value.data.items ||
              (Array.isArray(commentsRes.value.data)
                ? commentsRes.value.data
                : []) ||
              [];
          }

          fetchedPost.comments = fetchedComments;
          setPost(fetchedPost);
        } else {
          throw new Error("게시물을 불러오지 못했습니다.");
        }

        // 1-3. 내 정보
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

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("data:image")) return url;
    const path = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:4000${path}`;
  };

  const getDisplayName = (postObj) => {
    if (!postObj) return "익명";
    if (postObj.user && postObj.user.nickname) return postObj.user.nickname;
    if (postObj.nickname) return postObj.nickname;
    const authorId = postObj.user_id || postObj.userId;
    if (
      currentUser &&
      authorId &&
      String(currentUser.id) === String(authorId)
    ) {
      return currentUser.nickname || "나";
    }
    return "익명 사용자";
  };

  const getProfileImage = (postObj) => {
    if (!postObj)
      return "https://cdn-icons-png.flaticon.com/512/847/847969.png";
    if (postObj.user && postObj.user.profile_image_url) {
      return getImageUrl(postObj.user.profile_image_url);
    }
    const authorId = postObj.user_id || postObj.userId;
    if (currentUser && String(currentUser.id) === String(authorId)) {
      return getImageUrl(currentUser.profile_image_url);
    }
    return "https://cdn-icons-png.flaticon.com/512/847/847969.png";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  // 좋아요 토글 기능
  const toggleLike = async () => {
    if (!post) return;
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await postAPI.togglePostLike(post.id);
      const { liked, likesCount } = response.data;

      setPost((prev) => ({
        ...prev,
        isLiked: liked,
        liked: liked,
        is_liked: liked,
        likes_count: likesCount,
        likesCount: likesCount,
      }));
    } catch (error) {
      console.error("좋아요 실패:", error);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  const handleAddComment = async (text) => {
    if (!currentUser) {
      alert("로그인 후 댓글을 작성할 수 있습니다.");
      return;
    }
    try {
      const response = await commentAPI.createComment(id, { content: text });
      const newComment = {
        ...response.data,
        id: response.data?.id || Date.now(),
        content: text,
        user: currentUser,
        user_id: currentUser.id,
        created_at: new Date().toISOString(),
      };

      setPost((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
        comment_count: (prev.comment_count || 0) + 1,
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
          comment_count: Math.max(0, (prev.comment_count || 0) - 1),
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
      (currentUser?.id &&
        post.user?.id &&
        String(currentUser.id) === String(post.user.id)) ||
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

  const isLiked = post.isLiked || post.liked || post.is_liked || false;
  const likeCount = post.likes_count ?? post.likesCount ?? post.likes ?? 0;
  const commentCount =
    post.comment_count ??
    post.commentCount ??
    (post.comments ? post.comments.length : 0) ??
    0;

  return (
    <div className="post-detail-page">
      <header className="detail-header">
        {/* ★ 수정됨: 뒤로가기 버튼 클릭 시 무조건 /main 으로 이동 */}
        <button
          className="icon-btn back"
          onClick={() => navigate("/main")}
        ></button>
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
            src={getProfileImage(post)}
            alt="profile"
            className="profile-img"
          />
          <span className="username">{getDisplayName(post)}</span>
        </div>

        {post.images && post.images.length > 0 && (
          <div className="post-image-container">
            <img
              src={getImageUrl(post.images[0].url)}
              alt="detail"
              onError={(e) => {
                e.target.src = "https://placehold.co/300x300?text=No+Image";
              }}
            />
          </div>
        )}

        <div className="action-buttons">
          <button
            className={`icon-btn heart ${isLiked ? "liked" : ""}`}
            onClick={toggleLike}
          ></button>
          <button
            className="icon-btn comment"
            onClick={() => commentInputRef.current?.focus()}
          ></button>
        </div>

        <div className="likes-info">
          <span className="likes-count">좋아요 {likeCount}개</span>
          <span className="comments-count">댓글 {commentCount}개</span>
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
