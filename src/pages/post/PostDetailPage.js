import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postAPI, authAPI, commentAPI } from "../../api/api";
import CommentSection from "../../components/CommentSection";
import PostOptionMenu from "./PostOptionMenu";
import "./PostDetailPage.css";

// -----------------------------------------------------------
// [헬퍼 함수] 태그 데이터 안전 변환 (문자열 -> 배열)
// -----------------------------------------------------------
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

// -----------------------------------------------------------
// [헬퍼 함수] 로컬 스토리지에서 좋아요 목록 관리
// -----------------------------------------------------------
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
  const { id } = useParams(); // URL에서 게시물 ID 추출
  const navigate = useNavigate();

  // -----------------------------------------------------------
  // 1. 상태(State) 관리
  // -----------------------------------------------------------
  const [post, setPost] = useState(null); // 게시물 상세 데이터
  const [currentUser, setCurrentUser] = useState(null); // 현재 로그인한 유저
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [showOptions, setShowOptions] = useState(false); // 더보기(... 버튼) 메뉴 표시 여부

  // 댓글 아이콘 클릭 시 댓글 입력창으로 포커스를 이동시키기 위한 Ref
  const commentInputRef = useRef(null);

  // -----------------------------------------------------------
  // 2. 데이터 로딩 (게시물 상세 + 댓글 목록 + 내 정보)
  // -----------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 3가지 API를 동시에 호출하여 속도 최적화 (Promise.allSettled)
        const [postRes, commentsRes, userRes] = await Promise.allSettled([
          postAPI.getPostById(id),
          commentAPI.getComments(id),
          authAPI.getMe(),
        ]);

        // [내 정보 설정]
        let fetchedUser = null;
        if (userRes.status === "fulfilled" && userRes.value.data) {
          fetchedUser = userRes.value.data;
          setCurrentUser(fetchedUser);
        }

        // [좋아요 상태 확인] 로컬 스토리지와 대조
        const currentUserId = fetchedUser ? fetchedUser.id : null;
        const likedPostIds = getLikedPostIds(currentUserId);

        // [게시물 데이터 설정]
        if (postRes.status === "fulfilled") {
          const rawPost = postRes.value.data;
          // 내가 이 글에 좋아요를 눌렀었는지 확인
          const amILiked = likedPostIds.some(
            (pid) => String(pid) === String(id)
          );

          const fetchedPost = {
            ...rawPost,
            isLiked: amILiked,
          };

          // [댓글 데이터 설정]
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
        navigate("/main"); // 실패 시 메인으로 이동
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, navigate]);

  // [유틸] 이미지 경로 보정
  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("data:image")) return url;
    const path = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:4000${path}`;
  };

  // [유틸] 프로필 이미지 우선순위 처리 (내 글이면 내 최신 정보 사용)
  const getProfileImage = (postObj) => {
    const authorId = postObj.user_id || postObj.userId;

    // 1. 작성자가 '나'인 경우 (내 최신 프로필)
    if (currentUser && String(currentUser.id) === String(authorId)) {
      if (currentUser.profile_image_url) {
        return getImageUrl(currentUser.profile_image_url);
      }
      if (currentUser.profileImageUrl) {
        return getImageUrl(currentUser.profileImageUrl);
      }
    }
    // 2. 작성자가 '남'인 경우 (게시글 정보에 있는 프로필)
    if (postObj.user) {
      if (postObj.user.profile_image_url) {
        return getImageUrl(postObj.user.profile_image_url);
      }
      if (postObj.user.profileImageUrl) {
        return getImageUrl(postObj.user.profileImageUrl);
      }
    }
    // 3. Flatten된 구조 확인
    if (postObj.profile_image_url)
      return getImageUrl(postObj.profile_image_url);
    if (postObj.profileImageUrl) return getImageUrl(postObj.profileImageUrl);

    // 4. 기본 이미지
    return "https://cdn-icons-png.flaticon.com/512/847/847969.png";
  };

  // [유틸] 닉네임 표시 로직
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

  // -----------------------------------------------------------
  // 3. 좋아요 토글 핸들러
  // -----------------------------------------------------------
  const toggleLike = async () => {
    if (!post) return;
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      // 서버 요청
      const response = await postAPI.togglePostLike(post.id);
      const { liked, likesCount } = response.data;

      // 화면 즉시 갱신
      setPost((prev) => ({
        ...prev,
        isLiked: liked,
        likes_count: likesCount,
        likesCount: likesCount,
      }));

      // 로컬 스토리지 업데이트 (새로고침 대비)
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

  // -----------------------------------------------------------
  // 4. 댓글 관련 핸들러 (추가, 삭제, 수정)
  // -----------------------------------------------------------
  const handleAddComment = async (text) => {
    if (!currentUser) {
      alert("로그인 후 댓글을 작성할 수 있습니다.");
      return;
    }

    try {
      const response = await commentAPI.createComment(id, { content: text });
      // 낙관적 업데이트(Optimistic Update)를 위한 새 댓글 객체 생성
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

  // -----------------------------------------------------------
  // 5. 게시물 수정/삭제 핸들러
  // -----------------------------------------------------------
  const handleEditPost = () => {
    navigate(`/posts/edit/${id}`); // 수정 페이지로 이동
    setShowOptions(false);
  };

  const handleDeletePost = async () => {
    if (window.confirm("정말로 삭제하시겠습니까?")) {
      try {
        await postAPI.deletePost(id);
        navigate("/main", { replace: true }); // 삭제 후 메인으로 이동
      } catch {
        alert("삭제 실패");
      }
    }
    setShowOptions(false);
  };

  // 더보기 버튼(...) 클릭 시 권한 확인 (내 글인지)
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
      {/* 헤더: 뒤로 가기, 제목, 더보기 버튼 */}
      <header className="detail-header">
        <button className="icon-btn back" onClick={() => navigate(-1)} />
        <span className="header-title">게시물</span>
        {/* 내 글일 때만 더보기(...) 버튼 표시 */}
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

      {/* 컨텐츠 영역 */}
      <div className="detail-content">
        {/* 작성자 정보 */}
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

        {/* 게시물 이미지 */}
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

        {/* 좋아요/댓글 아이콘 */}
        <div className="action-buttons">
          <button
            className={`icon-btn heart ${isLikedState ? "liked" : ""}`}
            onClick={toggleLike}
          />
          {/* 댓글 아이콘 클릭 시 입력창 포커스 */}
          <button
            className="icon-btn comment"
            onClick={() => commentInputRef.current?.focus()}
          />
        </div>

        {/* 좋아요 수, 댓글 수 */}
        <div className="likes-info">
          <span className="likes-count">좋아요 {likeCount}개</span>
          <span className="comments-count">댓글 {commentCount}개</span>
        </div>

        {/* 본문 내용 */}
        <div className="caption-section">{post.body}</div>

        {/* 태그 목록 */}
        {getSafeTags(post.tags).length > 0 && (
          <div className="tags-section">
            {getSafeTags(post.tags).map((tag, idx) => (
              <span key={idx} className="tag-item">
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}

        {/* 작성일 */}
        <div className="date-info">{formatDate(post.published_at)}</div>

        {/* 댓글 섹션 컴포넌트 */}
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
