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

        setEditForm({
          nickname: userData.nickname || "",
          bio: userData.bio || "",
          profile_image_url: userData.profile_image_url || "",
        });

        // 1. 내 게시물
        const rawPosts = postsRes.data.items || postsRes.data || [];
        const validPosts = rawPosts.filter((post) => !post.deleted_at);
        setMyPosts(validPosts);

        // 2. 내 댓글
        const rawComments = commentsRes.data.items || commentsRes.data || [];
        const validComments = rawComments.filter(
          (comment) => !comment.deleted_at
        );
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

  // ★ 상세 페이지 이동 함수
  const goToDetail = (id) => {
    if (!id) {
      alert("게시물 정보를 찾을 수 없습니다.");
      return;
    }
    navigate(`/posts/${id}`);
  };

  // 텍스트 편집 핸들러
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // 이미지 변경 핸들러
  const handleProfileImgChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("image", file);
      const uploadRes = await uploadAPI.uploadImage(formData);

      const newImageUrl = `${uploadRes.data.url}?t=${Date.now()}`;

      const updateData = {
        nickname: user.nickname,
        bio: user.bio || "",
        profile_image_url: newImageUrl,
      };

      await userAPI.updateMyProfile(updateData);

      setUser((prev) => ({
        ...prev,
        profile_image_url: newImageUrl,
      }));

      setEditForm((prev) => ({
        ...prev,
        profile_image_url: newImageUrl,
      }));

      alert("프로필 사진이 변경되었습니다.");
    } catch (error) {
      console.error("프로필 사진 변경 실패:", error);
      if (error.response && error.response.status === 422) {
        console.log("422 에러 상세:", error.response.data);
      }
      alert("사진 변경에 실패했습니다.");
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
      const safeForm = {
        ...editForm,
        bio: editForm.bio || "",
        profile_image_url: editForm.profile_image_url || "",
      };

      const res = await userAPI.updateMyProfile(safeForm);
      setUser(res.data);
      setIsEditing(false);
      alert("프로필 정보가 수정되었습니다.");
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
      <div className="profile-header">
        <div className="profile-img-container">
          <img
            key={currentProfileUrl}
            src={currentProfileUrl || defaultProfileUrl}
            alt="profile"
            className="my-profile-img"
            onClick={() => fileInputRef.current.click()}
            style={{ cursor: "pointer" }}
            onError={(e) => {
              e.target.src = defaultProfileUrl;
            }}
          />
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*"
            onChange={handleProfileImgChange}
          />
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

      <div className="profile-content">
        {activeTab === "posts" ? (
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
          <div className="comments-list-view">
            {myComments.length === 0 ? (
              <div className="no-content">작성한 댓글이 없습니다.</div>
            ) : (
              myComments.map((comment, idx) => {
                // 원본 게시물 객체 확인
                const targetPost = comment.post || comment.Post;

                // ★ ID 추출 로직 강화: post 객체 ID -> camelCase -> snake_case 순서로 확인
                const targetPostId =
                  targetPost?.id || comment.postId || comment.post_id;

                const rawThumbUrl =
                  targetPost?.images && targetPost.images.length > 0
                    ? targetPost.images[0].url
                    : null;

                const finalThumbSrc = getImageUrl(rawThumbUrl);

                return (
                  <div
                    key={comment.id || idx}
                    className="comment-row"
                    onClick={() => {
                      if (targetPostId) goToDetail(targetPostId);
                      else alert("게시물 정보를 찾을 수 없습니다.");
                    }}
                    style={{ cursor: "pointer" }}
                  >
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
