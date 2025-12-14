import { useNavigate } from "react-router-dom";
import "./PostListPage.css";

const PostListPage = () => {
  const navigate = useNavigate();

  // TODO: API 연동 시 상태로 교체
  const posts = [
    { id: 1, title: "첫 번째 게시물", author: "user1" },
    { id: 2, title: "두 번째 게시물", author: "user2" },
  ];

  return (
    <div className="post-list-container">
      <h2>게시물 목록</h2>

      <button className="create-btn" onClick={() => navigate("/posts/create")}>
        게시물 작성
      </button>

      <ul className="post-list">
        {posts.map((post) => (
          <li
            key={post.id}
            className="post-item"
            onClick={() => navigate(`/posts/${post.id}`)}
          >
            <h3>{post.title}</h3>
            <p>{post.author}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostListPage;
