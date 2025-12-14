import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import "./CreatePostPage.css";

const CreatePostPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // URL에 id가 있으면 '수정 모드'입니다.
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const currentUser = {
    username: "um_chwoo",
    profileImg: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
  };

  // ★ 1. 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    if (id) {
      const savedPosts = JSON.parse(localStorage.getItem("posts")) || [];
      const targetPost = savedPosts.find((p) => p.id.toString() === id);

      if (targetPost) {
        setPreview(targetPost.image);
        setContent(targetPost.content);
        setTags(targetPost.tags || "");
      }
    }
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!preview || !content) {
      alert("사진과 내용을 입력해주세요.");
      return;
    }

    const savedPosts = JSON.parse(localStorage.getItem("posts")) || [];

    // 날짜 생성 (한국 시간)
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (id) {
      // 수정 모드: 기존 글 업데이트
      const updatedPosts = savedPosts.map((p) => {
        if (p.id.toString() === id) {
          return {
            ...p,
            image: preview,
            content: content,
            tags: tags,
            // 수정 시 날짜를 갱신하려면 아래 주석 해제
            // date: formattedDate,
          };
        }
        return p;
      });
      localStorage.setItem("posts", JSON.stringify(updatedPosts));
      alert("수정되었습니다.");
      navigate(`/posts/${id}`); // 상세 페이지로 돌아가기
    } else {
      // 3. 작성 모드: 새 글 추가
      const newPost = {
        id: Date.now(),
        author: currentUser,
        image: preview,
        content: content,
        tags: tags,
        likes: 0,
        isLiked: false,
        comments: [],
        date: formattedDate,
      };
      const updatedPosts = [newPost, ...savedPosts];
      localStorage.setItem("posts", JSON.stringify(updatedPosts));
      navigate("/main");
    }
  };

  return (
    <div className="create-post-page">
      <header className="create-header">
        <button className="icon-btn back-arrow" onClick={() => navigate(-1)}>
          <FiArrowLeft size={26} color="#262626" />
        </button>

        <span className="header-title">{id ? "게시물 수정" : "새 게시물"}</span>

        <button className="submit-text-btn" onClick={handleSubmit}>
          {id ? "완료" : "공유"}
        </button>
      </header>

      <div className="create-content">
        <div
          className="image-upload-area"
          onClick={() => fileInputRef.current.click()}
        >
          {preview ? (
            <img src={preview} alt="preview" className="preview-img" />
          ) : (
            <div className="upload-placeholder">
              <span>사진 추가</span>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            hidden
          />
        </div>

        <div className="input-section">
          <textarea
            className="caption-input"
            placeholder="문구 입력..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="divider"></div>
          <input
            className="tag-input"
            type="text"
            placeholder="#태그"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
