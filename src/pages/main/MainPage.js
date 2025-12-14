import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";

const MainPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem("posts")) || [];
    setPosts(savedPosts);
  }, []);

  const toggleLike = (id) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === id) {
        const isLiked = !post.isLiked;
        return {
          ...post,
          isLiked: isLiked,
          likes: isLiked ? (post.likes || 0) + 1 : (post.likes || 0) - 1,
        };
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorage.setItem("posts", JSON.stringify(updatedPosts));
  };

  const goToDetail = (id) => {
    navigate(`/posts/${id}`);
  };

  return (
    <div className="main-page">
      {posts.length === 0 && (
        <div className="empty-message">게시물이 없습니다.</div>
      )}

      {posts.map((post) => (
        <div className="post-card" key={post.id}>
          {/* 헤더 */}
          <div className="post-header">
            <img
              src={
                post.author?.profileImg ||
                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              alt="profile"
              className="header-profile-img"
            />
            <span className="header-username">
              {post.author?.username || "익명"}
            </span>
          </div>

          {/* 이미지 */}
          {post.image && (
            <div className="post-image" onClick={() => goToDetail(post.id)}>
              <img src={post.image} alt="post" />
            </div>
          )}

          {/* ★ 아이콘 + 숫자 영역 ★ */}
          <div className="post-actions">
            {/* 1. 좋아요 그룹 */}
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

            {/* 2. 댓글 그룹 */}
            <div className="action-group">
              <button className="icon-btn comment"></button>
              <span className="count-text">{(post.comments || []).length}</span>
            </div>
          </div>

          {/* 내용 */}
          <div className="post-content">
            {/* 기존의 likes-count div는 삭제했습니다 */}

            <div className="caption" onClick={() => goToDetail(post.id)}>
              <span className="caption-username">
                {post.author?.username || "익명"}
              </span>
              <span className="caption-text">{post.content}</span>
            </div>

            {post.tags && (
              <div className="tags">
                {post.tags.split(" ").map((tag, idx) => (
                  <span key={idx} className="tag-item">
                    {tag.startsWith("#") ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}
            <div className="post-date">{post.date}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MainPage;
