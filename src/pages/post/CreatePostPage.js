import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { postAPI, uploadAPI } from "../../api/api";
import "./CreatePostPage.css";

const CreatePostPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // URL에 id가 있으면 '수정 모드'
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(null); // 이미지 미리보기 URL
  const [selectedFile, setSelectedFile] = useState(null); // 실제 업로드할 파일 객체

  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  // 이미지 주소 처리 헬퍼 함수
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("data:")) return url; // 미리보기용 Data URI
    if (url.startsWith("http")) return url; // 절대 경로
    const path = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:4000${path}`;
  };

  // 1. 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    const fetchPost = async () => {
      if (id) {
        try {
          const response = await postAPI.getPostDetail(id);
          const post = response.data;

          setContent(post.body);

          // 태그 데이터 안전하게 처리
          let safeTags = [];
          if (Array.isArray(post.tags)) {
            safeTags = post.tags;
          } else if (typeof post.tags === "string") {
            safeTags = post.tags.split(",").map((t) => t.trim());
          }

          if (safeTags.length > 0) {
            const formattedTags = safeTags
              .map((t) => (t.startsWith("#") ? t : `#${t}`))
              .join(" ");
            setTags(formattedTags);
          }

          // 기존 이미지 설정
          if (post.images && post.images.length > 0) {
            setPreview(post.images[0].url);
          }
        } catch (error) {
          console.error("게시글 불러오기 실패:", error);
          alert("게시글 정보를 불러올 수 없습니다.");
          navigate(-1);
        }
      }
    };
    fetchPost();
  }, [id, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!content) {
      alert("내용을 입력해주세요.");
      return;
    }
    // 새 글 작성인데 사진이 없으면 경고 (수정 시에는 기존 사진 유지 가능)
    if (!id && !selectedFile && !preview) {
      alert("사진을 선택해주세요.");
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = preview;

      // 1. 새 이미지가 선택되었다면 업로드
      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        const uploadRes = await uploadAPI.uploadImage(formData);
        finalImageUrl = uploadRes.data.url;
      }

      // 2. 태그 처리
      const tagArray = tags
        .split(" ")
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .map((t) => (t.startsWith("#") ? t : `#${t}`));

      // 3. 데이터 구성
      const postData = {
        title: content.slice(0, 20) || "게시글",
        body: content,
        place: "Unknown",
        // ★ 백엔드 스키마 맞춤 (url -> imageUrl)
        images: [{ imageUrl: finalImageUrl }],
        tags: tagArray,
      };

      if (id) {
        // [수정]
        await postAPI.updatePost(id, postData);
        alert("게시글이 수정되었습니다.");
        navigate(`/posts/${id}`);
      } else {
        // [작성]
        await postAPI.createPost(postData);
        alert("게시글이 등록되었습니다.");
        navigate("/main");
      }
    } catch (error) {
      console.error("업로드 실패:", error);
      if (error.response && error.response.status === 422) {
        alert("입력 형식이 잘못되었습니다. (422 Error)");
      } else {
        alert("실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 렌더링 시 사용할 이미지 URL 계산
  const previewUrl = getImageUrl(preview);

  return (
    <div className="create-post-page">
      <header className="create-header">
        <button className="icon-btn back-arrow" onClick={() => navigate(-1)}>
          {/* 아이콘 라이브러리가 없으면 텍스트로 대체됨 */}
          <FiArrowLeft size={26} color="#262626" />
        </button>

        <span className="header-title">{id ? "게시물 수정" : "새 게시물"}</span>

        <button
          className="submit-text-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "처리 중..." : id ? "완료" : "공유"}
        </button>
      </header>

      <div className="create-content">
        <div
          className="image-upload-area"
          onClick={() => fileInputRef.current.click()}
        >
          {/* previewUrl이 null이면 렌더링하지 않음 -> src 경고 방지 */}
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="preview"
              className="preview-img"
              onError={(e) => {
                e.target.src = "https://placehold.co/300x300?text=No+Image";
              }}
            />
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
            placeholder="#태그 (띄어쓰기로 구분)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
