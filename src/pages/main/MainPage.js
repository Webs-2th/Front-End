import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postAPI, authAPI } from "../../api/api";
import "./MainPage.css";

// 태그 데이터를 안전한 배열로 변환하는 헬퍼 함수
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

const MainPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. 게시글 목록 + 내 정보 동시에 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [postsRes, userRes] = await Promise.allSettled([
          postAPI.getPosts(),
          authAPI.getMe(),
        ]);

        // 게시글 처리
        if (postsRes.status === "fulfilled") {
          const items = postsRes.value.data.items || postsRes.value.data || [];
          const validPosts = items.filter((post) => !post.deleted_at);
          setPosts(validPosts);
          console.log("불러온 게시물:", validPosts);
        }

        // 내 정보 처리
        if (userRes.status === "fulfilled" && userRes.value.data) {
          setCurrentUser(userRes.value.data);
          console.log("현재 로그인한 유저:", userRes.value.data);
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ★ 사용자 이름 표시 로직
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

  // ★ 좋아요 토글 기능 (API 연동 포함)
  const toggleLike = async (id) => {
    try {
      // 1. 서버 API 호출 (togglePostLike는 postAPI에 정의되어 있어야 함)
      await postAPI.togglePostLike(id);

      // 2. 성공 시에만 로컬 상태 업데이트
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === id) {
            const isLiked = !post.isLiked;
            return {
              ...post,
              isLiked: isLiked,
              // 좋아요 상태에 따라 카운트 증가/감소
              likes: isLiked ? (post.likes || 0) + 1 : (post.likes || 0) - 1,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("좋아요 실패:", error);
      alert("좋아요 처리에 실패했습니다. 로그인했는지 확인해주세요.");
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

      {posts.map((post) => (
        <div className="post-card" key={post.id}>
          {/* 헤더 */}
          <div className="post-header">
            <img
              src={
                post.user?.profile_image_url ||
                currentUser?.profile_image_url ||
                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              alt="profile"
              className="header-profile-img"
            />
            <span className="header-username">
              {getDisplayName(post.user, post.user_id || post.userId)}
            </span>
          </div>

          {/* 이미지 영역 */}
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
                  e.target.src =
                    "https://via.placeholder.com/300?text=No+Image";
                }}
              />
            </div>
          )}

          {/* 아이콘 + 숫자 영역 */}
          <div className="post-actions">
            <div className="action-group">
              <button
                className={`icon-btn heart ${post.isLiked ? "liked" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(post.id);
                }}
              ></button>
              <span className="count-text">{post.likes || 0}</span>
            </div>

            <div className="action-group">
              <button
                className="icon-btn comment"
                onClick={() => goToDetail(post.id)}
              ></button>
              <span className="count-text">{post.commentCount || 0}</span>
            </div>
          </div>

          {/* 내용 및 해시태그 */}
          <div className="post-content">
            <div className="caption">
              <span className="caption-username">
                {getDisplayName(post.user, post.user_id || post.userId)}
              </span>
              <span
                className="caption-text"
                onClick={() => goToDetail(post.id)}
                style={{ cursor: "pointer" }}
              >
                {post.body}
              </span>
            </div>

            {/* 해시태그 영역 */}
            {getSafeTags(post.tags).length > 0 && (
              <div
                className="tags"
                style={{
                  marginTop: "8px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "5px",
                }}
              >
                {getSafeTags(post.tags).map((tag, idx) => (
                  <span
                    key={idx}
                    className="tag-item"
                    style={{
                      color: "#00376b",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    {tag.trim().startsWith("#") ? tag.trim() : `#${tag.trim()}`}
                  </span>
                ))}
              </div>
            )}

            <div className="post-date">{formatDate(post.published_at)}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MainPage;
