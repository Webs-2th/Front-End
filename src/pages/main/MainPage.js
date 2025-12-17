import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postAPI, authAPI } from "../../api/api";
import "./MainPage.css";

// 태그 데이터를 배열로 안전하게 변환 (문자열이면 잘라서 배열로 만듦)
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

// 로컬 스토리지에서 유저별 좋아요 목록 가져오기
const getLikedPostIds = (userId) => {
  if (!userId) return [];
  try {
    return JSON.parse(localStorage.getItem(`likedPosts_${userId}`)) || [];
  } catch {
    return [];
  }
};

// 로컬 스토리지에 좋아요 목록 저장하기
const setLikedPostIds = (userId, ids) => {
  if (!userId) return;
  localStorage.setItem(`likedPosts_${userId}`, JSON.stringify(ids));
};

const MainPage = () => {
  const navigate = useNavigate();
  // 게시물 목록, 현재 로그인 유저, 로딩 상태 관리
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 페이지 접속 시 데이터 로딩 (게시물 + 내 정보)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // API 병렬 요청 (속도 최적화)
        const [postsRes, userRes] = await Promise.allSettled([
          postAPI.getPosts(),
          authAPI.getMe(),
        ]);

        // 내 정보 저장
        let fetchedUser = null;
        if (userRes.status === "fulfilled" && userRes.value.data) {
          fetchedUser = userRes.value.data;
          setCurrentUser(fetchedUser);
        }

        // 좋아요 상태 확인을 위한 ID 준비
        const currentUserId = fetchedUser ? fetchedUser.id : null;
        const likedPostIds = getLikedPostIds(currentUserId);

        // 게시물 데이터 가공 (삭제된 글 제외, 좋아요 여부 표시)
        if (postsRes.status === "fulfilled") {
          const items = postsRes.value.data.items || postsRes.value.data || [];

          const validPosts = items
            .filter((post) => !post.deleted_at)
            .map((post) => ({
              ...post,
              isLiked: likedPostIds.some(
                (pid) => String(pid) === String(post.id)
              ),
            }));

          setPosts(validPosts);
          console.log("불러온 게시물:", validPosts);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 이미지 경로 보정 (상대 경로는 로컬 서버 주소 붙이기)
  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("data:image")) return url;
    const path = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:4000${path}`;
  };

  // 프로필 이미지 결정 로직 (내 글이면 내 최신 프사, 아니면 작성자 프사)
  const getProfileImage = (post) => {
    const authorId = post.user_id || post.userId;

    // 1. 내 글인 경우
    if (currentUser && String(currentUser.id) === String(authorId)) {
      if (currentUser.profile_image_url)
        return getImageUrl(currentUser.profile_image_url);
      if (currentUser.profileImageUrl)
        return getImageUrl(currentUser.profileImageUrl);
    }

    // 2. 남의 글인 경우 (다양한 변수명 체크)
    if (post.user) {
      if (post.user.profile_image_url)
        return getImageUrl(post.user.profile_image_url);
      if (post.user.profileImageUrl)
        return getImageUrl(post.user.profileImageUrl);
      if (post.user.profileUrl) return getImageUrl(post.user.profileUrl);
    }

    // 3. Flatten된 구조 체크
    if (post.profile_image_url) return getImageUrl(post.profile_image_url);
    if (post.profileImageUrl) return getImageUrl(post.profileImageUrl);

    // 4. 없으면 기본 이미지
    return "https://cdn-icons-png.flaticon.com/512/847/847969.png";
  };

  // 닉네임 표시 로직
  const getDisplayName = (post) => {
    if (post.user && post.user.nickname) return post.user.nickname;
    if (post.nickname) return post.nickname;

    const authorId = post.user_id || post.userId;
    if (
      currentUser &&
      authorId &&
      String(currentUser.id) === String(authorId)
    ) {
      return currentUser.nickname || currentUser.username || "나";
    }
    return "익명 사용자";
  };

  // 좋아요 버튼 클릭 핸들러
  const toggleLike = async (id) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      // 서버 요청
      const response = await postAPI.togglePostLike(id);
      const { liked, likesCount } = response.data;

      // 화면 상태 즉시 업데이트
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === id
            ? {
                ...post,
                isLiked: liked,
                likes_count: likesCount,
                likesCount: likesCount,
              }
            : post
        )
      );

      // 로컬 스토리지 동기화
      let likedIds = getLikedPostIds(currentUser.id);
      if (liked) {
        if (!likedIds.some((pid) => String(pid) === String(id))) {
          likedIds.push(id);
        }
      } else {
        likedIds = likedIds.filter((postId) => String(postId) !== String(id));
      }
      setLikedPostIds(currentUser.id, likedIds);
    } catch (error) {
      console.error(error);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  // 상세 페이지 이동
  const goToDetail = (id) => {
    navigate(`/posts/${id}`);
  };

  // 날짜 포맷 변환 (YYYY-MM-DD)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="main-page loading">로딩 중...</div>;
  }

  return (
    <div className="main-page">
      {/* 게시물이 없을 때 메시지 */}
      {posts.length === 0 && (
        <div className="empty-message">
          게시물이 없습니다. 첫 글을 작성해보세요!
        </div>
      )}

      {/* 게시물 목록 렌더링 */}
      {posts.map((post) => {
        const isLikedState = !!post.isLiked;
        const likeCount =
          post.likes_count ?? post.likesCount ?? post.likes ?? 0;
        const commentCount = post.comment_count ?? post.commentCount ?? 0;

        return (
          <div className="post-card" key={post.id}>
            {/* 헤더: 프로필 사진 + 이름 */}
            <div className="post-header">
              <img
                src={getProfileImage(post)}
                alt="profile"
                className="header-profile-img"
                onError={(e) => {
                  e.target.src =
                    "https://cdn-icons-png.flaticon.com/512/847/847969.png";
                }}
              />
              <span className="header-username">{getDisplayName(post)}</span>
            </div>

            {/* 본문 이미지 */}
            {post.images && post.images.length > 0 && (
              <div
                className="post-image"
                onClick={() => goToDetail(post.id)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={getImageUrl(post.images[0].url)}
                  alt="post"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/300x300?text=No+Image";
                  }}
                />
              </div>
            )}

            {/* 액션 버튼 (좋아요, 댓글) */}
            <div className="post-actions">
              <div className="action-group">
                <button
                  className={`icon-btn heart ${isLikedState ? "liked" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(post.id);
                  }}
                />
                <span className="count-text">{likeCount}</span>
              </div>

              <div className="action-group">
                <button
                  className="icon-btn comment"
                  onClick={() => goToDetail(post.id)}
                />
                <span className="count-text">{commentCount}</span>
              </div>
            </div>

            {/* 내용 및 태그 */}
            <div className="post-content">
              <div className="caption">
                <span className="caption-username">{getDisplayName(post)}</span>
                <span
                  className="caption-text"
                  onClick={() => goToDetail(post.id)}
                  style={{ cursor: "pointer" }}
                >
                  {post.body}
                </span>
              </div>

              {getSafeTags(post.tags).length > 0 && (
                <div className="tags">
                  {getSafeTags(post.tags).map((tag, idx) => (
                    <span key={idx} className="tag-item">
                      {tag.startsWith("#") ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              )}

              <div className="post-date">{formatDate(post.published_at)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MainPage;
