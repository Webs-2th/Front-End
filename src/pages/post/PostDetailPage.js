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

const getLikedPostIds = (userId) => {
  if (!userId) return [];
  try {
    return JSON.parse(localStorage.getItem(`likedPosts_${userId}`)) || [];
  } catch {
    return [];
  }
};

const setLikedPostIds = (userId, ids) => {
  if (!userId) return;
  localStorage.setItem(`likedPosts_${userId}`, JSON.stringify(ids));
};

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  const commentInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [postRes, commentsRes, userRes] = await Promise.allSettled([
          postAPI.getPostById(id),
          commentAPI.getComments(id),
          authAPI.getMe(),
        ]);

        let fetchedUser = null;
        if (userRes.status === "fulfilled" && userRes.value.data) {
          fetchedUser = userRes.value.data;
          setCurrentUser(fetchedUser);
        }

        const currentUserId = fetchedUser ? fetchedUser.id : null;
        const likedPostIds = getLikedPostIds(currentUserId);

        if (postRes.status === "fulfilled") {
          const rawPost = postRes.value.data;
          const amILiked = likedPostIds.some(
            (pid) => String(pid) === String(id)
          );

          const fetchedPost = {
            ...rawPost,
            isLiked: amILiked,
          };

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
          throw new Error("게시물 로딩 실패");
        }
      } catch (error) {
        console.error(error);
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

  // ★ [핵심 수정] 프로필 이미지 찾는 로직 강화
  const getProfileImage = (postObj) => {
    const authorId = postObj.user_id || postObj.userId;

    // 1. 내 글인 경우
    if (currentUser && String(currentUser.id) === String(authorId)) {
      if (currentUser.profile_image_url)
        return getImageUrl(currentUser.profile_image_url);
      if (currentUser.profileImageUrl)
        return getImageUrl(currentUser.profileImageUrl);
    }

    // 2. 남의 글인 경우 (user 객체 확인)
    if (postObj.user) {
      if (postObj.user.profile_image_url)
        return getImageUrl(postObj.user.profile_image_url);
      if (postObj.user.profileImageUrl)
        return getImageUrl(postObj.user.profileImageUrl);
      if (postObj.user.profileUrl) return getImageUrl(postObj.user.profileUrl);
    }

    // 3. 평평한 구조 확인
    if (postObj.profile_image_url)
      return getImageUrl(postObj.profile_image_url);
    if (postObj.profileImageUrl) return getImageUrl(postObj.profileImageUrl);

    // 4. 기본 이미지
    return "https://cdn-icons-png.flaticon.com/512/847/847969.png";
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

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
        likes_count: likesCount,
        likesCount: likesCount,
      }));

      let likedIds = getLikedPostIds(currentUser.id);
      if (liked) {
        if (!likedIds.some((pid) => String(pid) === String(post.id))) {
          likedIds.push(post.id);
        }
      } else {
        likedIds = likedIds.filter((pid) => String(pid) !== String(post.id));
      }
      setLikedPostIds(currentUser.id, likedIds);
    } catch (error) {
      console.error(error);
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
      console.error(error);
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
        console.error(error);
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
      console.error(error);
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
      } catch {
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

  const isLikedState = !!post.isLiked;
  const likeCount = post.likes_count ?? post.likesCount ?? post.likes ?? 0;
  const commentCount =
    post.comment_count ??
    post.commentCount ??
    (post.comments ? post.comments.length : 0) ??
    0;

  return (
    <div className="post-detail-page">
      <header className="detail-header">
        <button className="icon-btn back" onClick={() => navigate("/main")} />
        <span className="header-title">게시물</span>
        {((currentUser?.id &&
          post.user_id &&
          String(currentUser.id) === String(post.user_id)) ||
          post.user?.nickname === currentUser?.nickname) && (
          <button className="icon-btn more" onClick={handleMoreClick} />
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
            onError={(e) => {
              e.target.src =
                "https://cdn-icons-png.flaticon.com/512/847/847969.png";
            }}
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
            className={`icon-btn heart ${isLikedState ? "liked" : ""}`}
            onClick={toggleLike}
          />
          <button
            className="icon-btn comment"
            onClick={() => commentInputRef.current?.focus()}
          />
        </div>

        <div className="likes-info">
          <span className="likes-count">좋아요 {likeCount}개</span>
          <span className="comments-count">댓글 {commentCount}개</span>
        </div>

        <div className="caption-section">{post.body}</div>

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
