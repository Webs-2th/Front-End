import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postAPI } from "../../api/api"; // API import 경로 확인해주세요
import "./MainPage.css";

const MainPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ★ 1. 게시글 목록 불러오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postAPI.getPosts();
        // 백엔드 응답 구조: { items: [...], nextCursor: ... } 라고 가정
        // 만약 response.data 자체가 배열이라면 setPosts(response.data)로 수정하세요.
        setPosts(response.data.items || response.data);
      } catch (error) {
        console.error("피드 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // ★ 2. 좋아요 토글 (프론트 임시 처리 - 필요 시 API 연동 추가)
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

  // ★ 3. 상세 페이지 이동 함수
  const goToDetail = (id) => {
    navigate(`/posts/${id}`);
  };

  // 날짜 포맷팅 함수
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
            <span className="header-username">
              {post.user?.nickname || "익명 사용자"}
            </span>
          </div>

          {/* ★ 이미지 영역 (클릭 시 이동) ★ */}
          {post.images && post.images.length > 0 && (
            <div
              className="post-image"
              onClick={() => goToDetail(post.id)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={
                  // 이미지가 http로 시작하면 그대로 쓰고, 아니면 백엔드 주소 붙임
                  post.images[0].url.startsWith("http")
                    ? post.images[0].url
                    : `http://localhost:4000${post.images[0].url}`
                }
                alt="post"
              />
            </div>
          )}

          {/* 아이콘 + 숫자 영역 */}
          <div className="post-actions">
            <div className="action-group">
              <button
                className={`icon-btn heart ${post.isLiked ? "liked" : ""}`}
                onClick={(e) => {
                  e.stopPropagation(); // 버튼 누를 땐 상세페이지 이동 방지
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
                {post.user?.nickname || "익명"}
              </span>
              <span
                className="caption-text"
                onClick={() => goToDetail(post.id)}
                style={{ cursor: "pointer" }}
              >
                {post.body}
              </span>
            </div>

            {/* ★ 해시태그 영역 ★ */}
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
