import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, userAPI, uploadAPI, removeCookie } from "../../api/api";
import "./MyPage.css";

const MyPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [editForm, setEditForm] = useState({
    nickname: "",
    bio: "",
    profile_image_url: "",
  });

  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);

  const [activeTab, setActiveTab] = useState("posts");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- 로그아웃 핸들러 ---
  const handleLogout = useCallback(() => {
    removeCookie("accessToken");
    localStorage.removeItem("accessToken");
    setUser(null);
    setMyPosts([]);
    setMyComments([]);
    alert("로그아웃 되었습니다.");
    navigate("/login");
  }, [navigate]);

  // ★ 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, postsRes, commentsRes] = await Promise.all([
          authAPI.getMe(),
          userAPI.getMyPosts(),
          userAPI.getMyComments(),
        ]);

        const userData = userRes.data;
        setUser(userData);

        // 1. 내 게시물 처리 (삭제 안 된 것만)
        const rawPosts = postsRes.data.items || postsRes.data || [];
        const validPosts = rawPosts.filter((post) => !post.deleted_at);
        setMyPosts(validPosts);

        // 2. 내 댓글 처리
        const rawComments = commentsRes.data.items || commentsRes.data || [];
        console.log("서버에서 받은 댓글 원본:", rawComments);

        // 댓글 자체가 삭제된 것만 제외하고 모두 표시 (게시물 삭제 여부 상관 X)
        const validComments = rawComments.filter(
          (comment) => !comment.deleted_at
        );

        console.log("화면에 표시할 댓글 목록:", validComments);
        setMyComments(validComments);
      } catch (error) {
        console.error("데이터 로딩 에러:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, handleLogout]);

  // 이미지 URL 처리 함수
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("data:image")) return url;
    const path = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:4000${path}`;
  };

  // ★ 게시물 상세 페이지 이동
  const goToDetail = (id) => {
    if (!id) {
      alert("원본 게시물이 존재하지 않거나 삭제되어 이동할 수 없습니다.");
      return;
    }
    navigate(`/posts/${id}`);
  };

  // 프로필 편집 관련 핸들러들
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImgChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadAPI.uploadImage(formData);
      setEditForm((prev) => ({ ...prev, profile_image_url: res.data.url }));
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
    }
  };

  const startEditing = () => {
    setEditForm({
      nickname: user.nickname || "",
      bio: user.bio || "",
      profile_image_url: user.profile_image_url || "",
    });
    setIsEditing(true);
  };

  const saveProfile = async () => {
    try {
      const res = await userAPI.updateMyProfile(editForm);
      setUser(res.data);
      setIsEditing(false);
      alert("프로필이 수정되었습니다.");
    } catch (error) {
      alert("수정에 실패했습니다.");
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (!user) return null;

  const currentProfileUrl = isEditing
    ? getImageUrl(editForm.profile_image_url)
    : getImageUrl(user.profile_image_url);

  const defaultProfileUrl =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  return (
    <div className="mypage">
      {/* --- 프로필 헤더 영역 --- */}
      <div className="profile-header">
        <div className="profile-img-container">
          <img
            src={currentProfileUrl || defaultProfileUrl}
            alt="profile"
            className="my-profile-img"
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
              </div>
              <div className="button-row">
                <button className="edit-profile-btn" onClick={startEditing}>
                  프로필 편집
                </button>
                <button className="logout-btn" onClick={handleLogout}>
                  로그아웃
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

      {/* --- 탭 메뉴 --- */}
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

      {/* --- 탭 컨텐츠 --- */}
      <div className="profile-content">
        {activeTab === "posts" ? (
          // [내 게시물 그리드 뷰]
          <div className="posts-grid">
            {myPosts.length === 0 ? (
              <div className="no-content">작성한 게시물이 없습니다.</div>
            ) : (
              myPosts.map((post) => {
                const postImgUrl =
                  post.images && post.images.length > 0
                    ? getImageUrl(post.images[0].url)
                    : null;

                return (
                  <div
                    key={post.id}
                    className="grid-item"
                    onClick={() => goToDetail(post.id)}
                  >
                    {postImgUrl ? (
                      <img src={postImgUrl} alt="post" />
                    ) : (
                      <div className="no-image-placeholder">No Image</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          // [내 댓글 리스트 뷰]
          <div className="comments-list-view">
            {myComments.length === 0 ? (
              <div className="no-content">작성한 댓글이 없습니다.</div>
            ) : (
              myComments.map((comment, idx) => {
                // 게시물 정보 (대소문자 처리)
                const targetPost = comment.post || comment.Post;

                // ★ ID 추출 강화: post 객체가 없더라도 comment 자체에 postId가 있다면 그걸 사용
                const targetPostId =
                  targetPost?.id || comment.postId || comment.post_id;

                // 썸네일 안전하게 추출
                const rawThumbUrl =
                  targetPost?.images && targetPost.images.length > 0
                    ? targetPost.images[0].url
                    : null;

                const finalThumbSrc = getImageUrl(rawThumbUrl);

                return (
                  <div
                    key={comment.id || idx}
                    className="comment-row"
                    // ★ 클릭 시 해당 ID로 이동
                    onClick={() => goToDetail(targetPostId)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* 게시물 썸네일 이미지 영역 */}
                    <div className="comment-thumb">
                      {finalThumbSrc ? (
                        <img
                          src={finalThumbSrc}
                          alt="thumb"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentNode.classList.add(
                              "thumb-placeholder"
                            );
                          }}
                        />
                      ) : (
                        <div className="thumb-placeholder"></div>
                      )}
                    </div>

                    {/* 댓글 내용 및 날짜 */}
                    <div className="comment-preview">
                      <span className="comment-text-bold">
                        {comment.content}
                      </span>
                      <span className="comment-date-small">
                        {comment.created_at?.split("T")[0]}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;
