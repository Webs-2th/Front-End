import { useNavigate } from "react-router-dom";
import "./CreatePostPage.css";

const CreatePostPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: 게시물 생성 API 연동
    navigate("/posts");
  };

  return (
    <div className="create-post-container">
      <h2>게시물 작성</h2>

      <form onSubmit={handleSubmit} className="create-post-form">
        <input type="text" placeholder="제목" required />
        <textarea placeholder="본문" required />
        <input type="text" placeholder="태그" />
        <input type="date" />

        <button type="submit">저장</button>
      </form>
    </div>
  );
};

export default CreatePostPage;
