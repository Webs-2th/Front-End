import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, userAPI, uploadAPI } from "../../api/api";
import "./MyPage.css";

const MyPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // 내 정보 상태 (백엔드 필드명에 맞춤: nickname, bio, profile_image_url)
  const [user, setUser] = useState(null);

  // 수정 모드용 폼 데이터
  const [editForm, setEditForm] = useState({
    nickname: "",
    bio: "",
    profile_image_url: "",
  });

  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);

  const [activeTab, setActiveTab] = useState("posts"); // 'posts' or 'comments'
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // ★ 1. 데이터 불러오기 (내 정보, 내 글, 내 댓글)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 병렬로 한 번에 요청
        const [userRes, postsRes, commentsRes] = await Promise.all([
          authAPI.getMe(), // 내 프로필
          userAPI.getMyPosts(), // 내가 쓴 글
          userAPI.getMyComments(), // 내가 쓴 댓글
        ]);

        const userData = userRes.data;
        setUser(userData);

        // API 응답 구조에 따라 .data.items 혹은 .data 처리
        setMyPosts(postsRes.data.items || postsRes.data || []);
        setMyComments(commentsRes.data.items || commentsRes.data || []);
      } catch (error) {
        console.error("마이페이지 로딩 실패:", error);
        alert("로그인이 필요하거나 정보를 불러올 수 없습니다.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // 이미지 주소 처리 함수 (URL 보정)
  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("data:image")) return url; // base64
    const path = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:4000${path}`;
  };

  const goToDetail = (id) => {
    navigate(`/posts/${id}`);
  };

  // --- 프로필 수정 관련 ---

  // 입력값 변경 핸들러
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // ★ 프로필 이미지 변경 (파일 선택 시 바로 업로드 -> URL 받기)
  const handleProfileImgChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("image", file); // 백엔드가 'image'라는 필드명을 받는지 확인 필요

      // 이미지 업로드 API 호출
      const res = await uploadAPI.uploadImage(formData);

      // 업로드 된 이미지 주소를 폼 상태에 반영 (미리보기용)
      // 백엔드가 { url: "..." } 형태로 준다고 가정
      const uploadedUrl = res.data.url;
      setEditForm((prev) => ({ ...prev, profile_image_url: uploadedUrl }));
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다.");
    }
  };

  // 수정 버튼 클릭 시 초기값 세팅
  const startEditing = () => {
    setEditForm({
      nickname: user.nickname || "",
      bio: user.bio || "", // intro 대신 bio 사용 (백엔드 스키마 확인)
      profile_image_url: user.profile_image_url || "",
    });
    setIsEditing(true);
  };

  // ★ 변경 내용 저장 (서버 전송)
  const saveProfile = async () => {
    try {
      // API 호출: 내 정보 업데이트
      const res = await userAPI.updateMyProfile(editForm);

      // 성공 시 화면 정보 갱신
      setUser(res.data);
      setIsEditing(false);
      alert("프로필이 수정되었습니다.");
    } catch (error) {
      console.error("프로필 수정 실패:", error);
      alert("수정에 실패했습니다.");
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (!user) return null;

  return (
    <div className="mypage">
      {/* 1. 프로필 헤더 영역 */}
      <div className="profile-header">
        <div className="profile-img-container">
          <img
            src={
              isEditing
                ? getImageUrl(editForm.profile_image_url) ||
                  "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                : getImageUrl(user.profile_image_url) ||
                  "https://cdn-icons-png.flaticon.com/512/847/847969.png"
            }
            alt="profile"
            className="my-profile-img"
            // 수정 모드일 때만 클릭해서 사진 변경 가능
            onClick={() => isEditing && fileInputRef.current.click()}
            style={{ cursor: isEditing ? "pointer" : "default" }}
          />
          {isEditing && (
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={handleProfileImgChange}
            />
          )}
        </div>

        <div className="profile-info">
          {isEditing ? (
            <div className="edit-form">
              <input
                name="nickname"
                value={editForm.nickname}
                onChange={handleEditChange}
                placeholder="닉네임"
                className="edit-input"
              />
              <input
                name="bio"
                value={editForm.bio}
                onChange={handleEditChange}
                placeholder="자기소개"
                className="edit-input"
              />
              <div className="edit-buttons">
                <button onClick={saveProfile} className="save-btn">
                  저장
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="cancel-btn"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="username-row">
                <span className="username">{user.nickname || "익명"}</span>
                <button className="edit-profile-btn" onClick={startEditing}>
                  프로필 편집
                </button>
              </div>
              <div className="stats-row">
                <span>
                  게시물 <b>{myPosts.length}</b>
                </span>
                <span>
                  댓글 <b>{myComments.length}</b>
                </span>
              </div>
              <div className="bio-row">
                {user.bio || "자기소개가 없습니다."}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. 탭 메뉴 */}
      <div className="profile-tabs">
        <div
          className={`tab-item ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          <div className="tab-icon grid"></div>
        </div>

        <div
          className={`tab-item ${activeTab === "comments" ? "active" : ""}`}
          onClick={() => setActiveTab("comments")}
        >
          <div className="tab-icon comment"></div>
        </div>
      </div>

      {/* 3. 컨텐츠 영역 */}
      <div className="profile-content">
        {activeTab === "posts" ? (
          <div className="posts-grid">
            {myPosts.length === 0 ? (
              <div className="no-content">작성한 게시물이 없습니다.</div>
            ) : (
              myPosts.map((post) => (
                <div
                  key={post.id}
                  className="grid-item"
                  onClick={() => goToDetail(post.id)}
                >
                  {/* 대표 이미지 표시 */}
                  {post.images && post.images.length > 0 ? (
                    <img src={getImageUrl(post.images[0].url)} alt="post" />
                  ) : (
                    <div className="no-image-placeholder">No Image</div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="comments-list-view">
            {myComments.length === 0 ? (
              <div className="no-content">작성한 댓글이 없습니다.</div>
            ) : (
              myComments.map((comment, idx) => (
                <div
                  key={comment.id || idx}
                  className="comment-row"
                  onClick={() => goToDetail(comment.postId)} // 댓글 누르면 해당 게시물로 이동
                >
                  {/* 댓글 미리보기엔 게시물 썸네일은 보통 없거나 API가 줘야 함. 
                      없으면 회색 박스 처리 */}
                  <div className="comment-thumb">
                    {comment.post?.images?.[0] ? (
                      <img
                        src={getImageUrl(comment.post.images[0].url)}
                        alt="thumb"
                      />
                    ) : (
                      <div className="thumb-placeholder"></div>
                    )}
                  </div>
                  <div className="comment-preview">
                    {/* 댓글 내용 */}
                    <span className="comment-text-bold">{comment.content}</span>
                    <span className="comment-date-small">
                      {comment.created_at?.split("T")[0]}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;
