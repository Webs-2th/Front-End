import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import "./CreatePostPage.css";

const CreatePostPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // 현재 로그인한 사용자라고 가정 (원하는 이름/사진으로 바꾸세요)
  const currentUser = {
    username: "um_chwoo",
    profileImg: "https://via.placeholder.com/150", // 임시 프로필 사진 URL
  };

  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = "";
    if (image) {
      imageUrl = await convertToBase64(image);
    }

    const newPost = {
      id: Date.now(),
      ...form, // title, content, tags, date
      image: imageUrl,
      // 추가된 부분: 작성자 정보와 좋아요/댓글 초기값
      author: currentUser,
      likes: 0,
      isLiked: false, // 내가 좋아요 눌렀는지 여부
      comments: [], // 댓글 목록 (나중에 확장 가능)
    };

    const existingPosts = JSON.parse(localStorage.getItem("posts")) || [];
    const updatedPosts = [newPost, ...existingPosts];
    localStorage.setItem("posts", JSON.stringify(updatedPosts));

    navigate("/main");
  };

  return (
    <div className="create-post">
      {/* 기존 UI 코드 유지... (생략) */}
      {/* 위에서 작성해주신 코드 그대로 쓰시면 됩니다. 로직만 바뀌었습니다. */}
      <header className="create-post-header">
        <button className="cancel-btn" onClick={() => navigate(-1)}>
          취소
        </button>
        <h2>새 게시물</h2>
        <button className="submit-btn" onClick={handleSubmit}>
          공유
        </button>
      </header>

      <form className="create-post-form" onSubmit={handleSubmit}>
        {/* ... 이미지 업로드 및 입력창들 기존과 동일 ... */}
        <div
          className="image-upload"
          onClick={() => fileInputRef.current.click()}
        >
          {preview ? (
            <img src={preview} alt="preview" className="preview-image" />
          ) : (
            <span>사진 추가</span>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageChange}
        />
        <textarea
          name="content"
          placeholder="문구 입력..."
          value={form.content}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="tags"
          placeholder="#태그"
          value={form.tags}
          onChange={handleChange}
        />
        {/* 제목은 인스타 감성상 생략하거나 숨겨도 됩니다 */}
      </form>
    </div>
  );
};

export default CreatePostPage;
