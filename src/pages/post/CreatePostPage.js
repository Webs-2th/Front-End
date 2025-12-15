import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { postAPI, uploadAPI } from "../../api/api"; // API import
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

  // ★ 1. 수정 모드일 때 기존 데이터 불러오기 (API 연동)
  useEffect(() => {
    const fetchPost = async () => {
      if (id) {
        try {
          const response = await postAPI.getPostDetail(id);
          const post = response.data;

          // 기존 데이터 상태에 채워넣기
          setContent(post.body);
          // 태그 배열을 문자열(#태그 #태그)로 변환
          setTags(post.tags ? post.tags.join(" ") : "");
          // 기존 이미지 (첫 번째 이미지)
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

  // 이미지 선택 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. 파일 객체 저장 (나중에 업로드용)
      setSelectedFile(file);

      // 2. 미리보기용 URL 생성 (즉시 보여주기용)
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 작성/수정 완료 핸들러
  const handleSubmit = async () => {
    if (!content) {
      alert("내용을 입력해주세요.");
      return;
    }
    // 수정 모드가 아니고, 새 글인데 사진이 없으면 경고
    if (!id && !selectedFile) {
      alert("사진을 선택해주세요.");
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = preview; // 수정 모드일 경우 기존 URL 유지

      // 1. 새 이미지가 선택되었다면 먼저 이미지 업로드 API 호출
      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);

        const uploadRes = await uploadAPI.uploadImage(formData);
        finalImageUrl = uploadRes.data.url; // 서버에서 받은 이미지 URL
      }

      // 2. 게시글 데이터 구성
      // 백엔드 명세에 맞춰 데이터 가공
      const postData = {
        title: content.slice(0, 20) || "새로운 게시글", // 제목이 없으므로 내용 앞부분 사용
        body: content,
        place: "Unknown", // 위치 기능이 없으므로 임시 값
        images: [{ imageUrl: finalImageUrl }], // 이미지 배열 형태
        tags: tags.split(" ").filter((tag) => tag.startsWith("#")), // 태그 처리
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
      alert("게시글 업로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page">
      <header className="create-header">
        <button className="icon-btn back-arrow" onClick={() => navigate(-1)}>
          <FiArrowLeft size={26} color="#262626" />
        </button>

        <span className="header-title">{id ? "정보 수정" : "새 게시물"}</span>

        <button
          className="submit-text-btn"
          onClick={handleSubmit}
          disabled={loading} // 로딩 중 클릭 방지
        >
          {loading ? "처리 중..." : id ? "완료" : "공유"}
        </button>
      </header>

      <div className="create-content">
        {/* 이미지 업로드 영역 */}
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

        {/* 텍스트 입력 영역 */}
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
