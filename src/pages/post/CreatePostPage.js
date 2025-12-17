import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { postAPI, uploadAPI } from "../../api/api";
import "./CreatePostPage.css";

const CreatePostPage = () => {
  const navigate = useNavigate();
  // URL 파라미터에서 id 가져오기 (id가 있으면 '수정', 없으면 '새 글 작성')
  const { id } = useParams();

  // 숨겨진 파일 input 요소에 접근하기 위한 Ref
  const fileInputRef = useRef(null);

  // -----------------------------------------------------------
  // 1. 상태(State) 관리
  // -----------------------------------------------------------
  const [preview, setPreview] = useState(null); // 화면에 보여줄 이미지 URL (미리보기)
  const [selectedFile, setSelectedFile] = useState(null); // 서버로 보낼 실제 파일 객체

  const [content, setContent] = useState(""); // 게시글 본문
  const [tags, setTags] = useState(""); // 태그 입력값 (문자열)
  const [loading, setLoading] = useState(false); // 로딩 상태

  // [유틸] 이미지 경로 보정 (미리보기용 data URI / 절대 경로 / 상대 경로 구분)
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("data:")) return url; // 파일 선택 시 생성된 Base64 미리보기 주소
    if (url.startsWith("http")) return url; // 이미 완전한 주소인 경우
    const path = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:4000${path}`; // 로컬 서버 경로 붙이기
  };

  // -----------------------------------------------------------
  // 2. [수정 모드] 진입 시 기존 데이터 불러오기
  // -----------------------------------------------------------
  useEffect(() => {
    const fetchPost = async () => {
      // id가 존재한다면 = 수정 모드임
      if (id) {
        try {
          const response = await postAPI.getPostDetail(id);
          const post = response.data;

          setContent(post.body);

          // 태그 데이터 포맷팅 (배열 -> "#태그1 #태그2" 문자열로 변환)
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

          // 기존 이미지 미리보기 설정
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

  // -----------------------------------------------------------
  // 3. 이미지 선택 핸들러 (미리보기 생성)
  // -----------------------------------------------------------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); // 업로드할 파일 저장

      // 브라우저에서 즉시 미리보기를 보여주기 위해 FileReader 사용
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result); // 읽은 결과를 미리보기 URL로 설정
      };
      reader.readAsDataURL(file);
    }
  };

  // -----------------------------------------------------------
  // 4. 저장/수정 제출 핸들러
  // -----------------------------------------------------------
  const handleSubmit = async () => {
    // 유효성 검사
    if (!content) {
      alert("내용을 입력해주세요.");
      return;
    }
    // 새 글인데 사진이 없거나, 수정인데 기존 사진도 없는 경우
    if (!id && !selectedFile && !preview) {
      alert("사진을 선택해주세요.");
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = preview;

      // [STEP 1] 새 이미지가 선택되었다면 서버에 업로드
      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        const uploadRes = await uploadAPI.uploadImage(formData);
        finalImageUrl = uploadRes.data.url; // 서버가 준 진짜 이미지 주소
      }

      // [STEP 2] 태그 문자열을 배열로 변환 ("#태그1 #태그2" -> ["태그1", "태그2"])
      const tagArray = tags
        .split(" ")
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .map((t) => (t.startsWith("#") ? t : `#${t}`));

      // [STEP 3] 전송할 데이터 구성
      const postData = {
        title: content.slice(0, 20) || "게시글",
        body: content,
        place: "Unknown",
        images: [{ imageUrl: finalImageUrl }], // 백엔드 스키마에 맞춤
        tags: tagArray,
      };

      // [STEP 4] id 유무에 따라 생성(Create) 또는 수정(Update) 요청
      if (id) {
        await postAPI.updatePost(id, postData);
        alert("게시글이 수정되었습니다.");
        navigate(`/posts/${id}`); // 상세 페이지로 이동
      } else {
        await postAPI.createPost(postData);
        alert("게시글이 등록되었습니다.");
        navigate("/main"); // 메인으로 이동
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

  // 렌더링 시 사용할 최종 이미지 URL
  const previewUrl = getImageUrl(preview);

  return (
    <div className="create-post-page">
      {/* --- 헤더 영역 --- */}
      <header className="create-header">
        <button className="icon-btn back-arrow" onClick={() => navigate(-1)}>
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

      {/* --- 컨텐츠 영역 --- */}
      <div className="create-content">
        {/* 이미지 업로드 영역 (클릭 시 파일 선택창 열림) */}
        <div
          className="image-upload-area"
          onClick={() => fileInputRef.current.click()}
        >
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
          {/* 숨겨진 input (ref로 연결됨) */}
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
