import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postAPI, authAPI } from "../../api/api"; // authAPI 추가
import "./MainPage.css";

const MainPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // 현재 로그인한 사용자 정보
  const [loading, setLoading] = useState(true);

  // ★ 1. 게시글 목록 + 내 정보 동시에 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 게시글과 내 정보를 병렬로 요청 (하나가 실패해도 나머지는 로드되도록 처리)
        const [postsRes, userRes] = await Promise.allSettled([
          postAPI.getPosts(),
          authAPI.getMe(),
        ]);

        // 게시글 처리
        if (postsRes.status === "fulfilled") {
          const postList =
            postsRes.value.data.items || postsRes.value.data || [];
          setPosts(postList);
          console.log("불러온 게시물:", postList);
        }

        // 내 정보 처리 (로그인 상태라면 정보 저장)
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

  // ★ 사용자 이름 표시 우선순위 로직 (닉네임 > 유저네임 > 이름 > 이메일 > 익명)
  const getDisplayName = (user, userId) => {
    // 1. 게시물에 유저 정보가 있는 경우
    if (user) {
      return (
        user.nickname ||
        user.username ||
        user.name ||
        (user.email ? user.email.split("@")[0] : "익명 사용자")
      );
    }
    // 2. 유저 정보가 없지만(백엔드 누락 등), 내 글인 경우 (ID 매칭 시도)
    if (currentUser && userId === currentUser.id) {
      return currentUser.nickname || currentUser.username || "나(정보 없음)";
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

  const toggleLike = (id) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === id) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked: isLiked,
            likes: isLiked ? (post.likes || 0) + 1 : (post.likes || 0) - 1,
          };
        }
        return post;
      })
    );
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
                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              alt="profile"
              className="header-profile-img"
            />

            {/* ★ 수정된 이름 표시 영역 ★ */}
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
                {/* ★ 여기도 수정된 이름 로직 적용 ★ */}
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
            {post.tags && post.tags.length > 0 && (
              <div
                className="tags"
                style={{
                  marginTop: "8px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "5px",
                }}
              >
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="tag-item"
                    style={{
                      color: "#00376b",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    {tag.startsWith("#") ? tag : `#${tag}`}
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
