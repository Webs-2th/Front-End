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

  // 이미지 주소 안전하게 처리하는 함수
  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("data:image")) return url;
    const path = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:4000${path}`;
  };

  // 사용자 이름 표시 로직
  const getDisplayName = (post) => {
    if (post.user && post.user.nickname) return post.user.nickname;
    if (post.nickname) return post.nickname;
    const authorId = post.user_id || post.userId;
    if (currentUser && authorId) {
      if (String(currentUser.id) === String(authorId)) {
        return currentUser.nickname || currentUser.username || "나";
      }
    }
    return "익명 사용자";
  };

  // 프로필 이미지 표시 로직
  const getProfileImage = (post) => {
    if (post.user && post.user.profile_image_url) {
      return getImageUrl(post.user.profile_image_url);
    }
    const authorId = post.user_id || post.userId;
    if (currentUser && String(currentUser.id) === String(authorId)) {
      return getImageUrl(currentUser.profile_image_url);
    }
    return "https://cdn-icons-png.flaticon.com/512/847/847969.png";
  };

  // 좋아요 토글 기능
  const toggleLike = async (id) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      const response = await postAPI.togglePostLike(id);
      // 서버 응답: { liked: boolean, likesCount: integer }
      const { liked, likesCount } = response.data;

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === id) {
            return {
              ...post,
              // 화면 갱신을 위해 모든 관련 필드를 최신 상태로 덮어씌움
              isLiked: liked,
              liked: liked,
              is_liked: liked,
              likes_count: likesCount,
              likesCount: likesCount,
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
        // 3가지 변수명 모두 체크
        const isLiked = post.isLiked || post.liked || post.is_liked || false;

        // 문법 에러 수정됨 (?? 연산자 통일)
        const likeCount =
          post.likes_count ?? post.likesCount ?? post.likes ?? 0;
        const commentCount = post.comment_count ?? post.commentCount ?? 0;

        return (
          <div className="post-card" key={post.id}>
            {/* 헤더 */}
            <div className="post-header">
              <img
                src={getProfileImage(post)}
                alt="profile"
                className="header-profile-img"
              />
              <span className="header-username">{getDisplayName(post)}</span>
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
                    e.target.src = "https://placehold.co/300x300?text=No+Image";
                  }}
                />
              </div>
            )}

            {/* 아이콘 + 숫자 영역 */}
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
                <span className="count-text">{commentCount}</span>
              </div>
            </div>

            {/* 내용 */}
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

              {/* 해시태그 */}
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
