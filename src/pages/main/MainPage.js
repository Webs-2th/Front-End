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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [postsRes, userRes] = await Promise.allSettled([
          postAPI.getPosts(),
          authAPI.getMe(),
        ]);

        if (postsRes.status === "fulfilled") {
          const items = postsRes.value.data.items || postsRes.value.data || [];
          const validPosts = items.filter((post) => !post.deleted_at);
          setPosts(validPosts);
          console.log("불러온 게시물:", validPosts);
        }

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

  // ★ [수정됨] 사용자 이름 표시 로직 (가장 중요)
  const getDisplayName = (post) => {
    // 1순위: API가 user 객체 안에 닉네임을 담아준 경우 (Standard)
    if (post.user && post.user.nickname) {
      return post.user.nickname;
    }

    // 2순위: API가 post 객체 바로 아래에 nickname을 담아준 경우 (Flat)
    if (post.nickname) {
      return post.nickname;
    }

    // 3순위: 로그인한 사용자가 작성자인 경우 (ID 비교)
    const authorId = post.user_id || post.userId;
    if (currentUser && authorId) {
      if (String(currentUser.id) === String(authorId)) {
        return currentUser.nickname || currentUser.username || "나";
      }
    }

    // 4순위: 정보가 없으면 익명
    return "익명 사용자";
  };

  const getProfileImage = (post) => {
    // 작성자 프로필 이미지 찾기
    if (post.user && post.user.profile_image_url)
      return getImageUrl(post.user.profile_image_url);
    // 작성자가 나인 경우 내 프로필 이미지
    const authorId = post.user_id || post.userId;
    if (currentUser && String(currentUser.id) === String(authorId)) {
      return getImageUrl(currentUser.profile_image_url);
    }
    return "https://cdn-icons-png.flaticon.com/512/847/847969.png";
  };

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("data:image")) return url;
    const path = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:4000${path}`;
  };

  const toggleLike = async (id) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      const response = await postAPI.togglePostLike(id);
      const { liked, likesCount } = response.data;

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === id) {
            return {
              ...post,
              isLiked: liked,
              likes: likesCount,
            };
          }
          return post;
        })
      );
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
        const isLiked = post.isLiked || post.liked || false;
        const likeCount = post.likes || post.likesCount || 0;

        return (
          <div className="post-card" key={post.id}>
            <div className="post-header">
              <img
                src={getProfileImage(post)}
                alt="profile"
                className="header-profile-img"
              />
              <span className="header-username">
                {/* 함수 호출 시 post 객체 전체를 넘김 */}
                {getDisplayName(post)}
              </span>
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
                  className={`icon-btn heart ${isLiked ? "liked" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(post.id);
                  }}
                ></button>
                <span className="count-text">{likeCount}</span>
              </div>

              <div className="action-group">
                <button
                  className="icon-btn comment"
                  onClick={() => goToDetail(post.id)}
                ></button>
                <span className="count-text">{post.commentCount || 0}</span>
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
                      {tag.trim().startsWith("#")
                        ? tag.trim()
                        : `#${tag.trim()}`}
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
