import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postAPI, authAPI } from "../../api/api";
import "./MainPage.css";

// --------------------
// 태그 안전 처리
// --------------------
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

// --------------------
// ★ 좋아요 localStorage 헬퍼 (유저별 분리)
// --------------------
const getLikedPostIds = (userId) => {
  if (!userId) return []; // 로그인 안 했으면 빈 배열
  try {
    // 키 이름을 "likedPosts_유저ID"로 설정하여 계정별로 분리
    return JSON.parse(localStorage.getItem(`likedPosts_${userId}`)) || [];
  } catch {
    return [];
  }
};

const setLikedPostIds = (userId, ids) => {
  if (!userId) return;
  localStorage.setItem(`likedPosts_${userId}`, JSON.stringify(ids));
};

const MainPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --------------------
  // 게시글 + 내 정보 로딩
  // --------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. 데이터 병렬 요청
        const [postsRes, userRes] = await Promise.allSettled([
          postAPI.getPosts(),
          authAPI.getMe(),
        ]);

        // 2. 유저 정보 먼저 확인 (ID가 필요함)
        let fetchedUser = null;
        if (userRes.status === "fulfilled" && userRes.value.data) {
          fetchedUser = userRes.value.data;
          setCurrentUser(fetchedUser);
          console.log("현재 로그인한 유저:", fetchedUser);
        }

        // 3. 해당 유저의 좋아요 목록 가져오기 (비로그인이면 빈 배열)
        const currentUserId = fetchedUser ? fetchedUser.id : null;
        const likedPostIds = getLikedPostIds(currentUserId);

        // 4. 게시글 처리
        if (postsRes.status === "fulfilled") {
          const items = postsRes.value.data.items || postsRes.value.data || [];

          const validPosts = items
            .filter((post) => !post.deleted_at)
            .map((post) => ({
              ...post,
              // ★ 내 ID로 저장된 로컬스토리지 목록에 있는지 확인
              isLiked: likedPostIds.some(
                (pid) => String(pid) === String(post.id)
              ),
            }));

          setPosts(validPosts);
          console.log("불러온 게시물:", validPosts);
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --------------------
  // 이미지 URL 보정
  // --------------------
  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("data:image")) return url;
    const path = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:4000${path}`;
  };

  const getProfileImage = (post) => {
    const authorId = post.user_id || post.userId;
    if (currentUser && String(currentUser.id) === String(authorId)) {
      if (currentUser.profile_image_url) {
        return getImageUrl(currentUser.profile_image_url);
      }
    }
    if (post.user && post.user.profile_image_url) {
      return getImageUrl(post.user.profile_image_url);
    }
    return "https://cdn-icons-png.flaticon.com/512/847/847969.png";
  };

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

  // --------------------
  // 좋아요 토글
  // --------------------
  const toggleLike = async (id) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await postAPI.togglePostLike(id);
      const { liked, likesCount } = response.data;

      // 화면 업데이트
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

      // ★ 내 ID에 해당하는 로컬 스토리지 업데이트
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
      console.error("좋아요 실패:", error);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  const goToDetail = (id) => {
    navigate(`/posts/${id}`);
  };

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
      {posts.length === 0 && (
        <div className="empty-message">
          게시물이 없습니다. 첫 글을 작성해보세요!
        </div>
      )}

      {posts.map((post) => {
        const isLikedState = !!post.isLiked;
        const likeCount =
          post.likes_count ?? post.likesCount ?? post.likes ?? 0;
        const commentCount = post.comment_count ?? post.commentCount ?? 0;

        return (
          <div className="post-card" key={post.id}>
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
