import { useParams } from "react-router-dom";
import "./PostDetailPage.css";

const PostDetailPage = () => {
  const { id } = useParams();

  // TODO: 게시물 상세 API 연동
  const post = {
    title: "게시물 제목",
    content: "게시물 본문 내용입니다.",
  };

  return (
    <div className="post-detail-container">
      <h2>{post.title}</h2>
      <p className="post-content">{post.content}</p>

      <section className="comment-section">
        <h3>댓글</h3>

        <textarea placeholder="댓글을 입력하세요" />
        <button>댓글 작성</button>

        <ul className="comment-list">
          <li>댓글 예시 1</li>
          <li>댓글 예시 2</li>
        </ul>
      </section>
    </div>
  );
};

export default PostDetailPage;
