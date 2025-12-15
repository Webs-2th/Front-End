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

  // ★ 데이터 불러오기 및 필터링
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

        // 1. 내 게시물 필터링
        const rawPosts = postsRes.data.items || postsRes.data || [];
        const validPosts = rawPosts.filter((post) => !post.deleted_at);
        setMyPosts(validPosts);

        // 2. 내 댓글 필터링 (엄격 모드: 삭제된 글의 댓글은 숨김)
        const rawComments = commentsRes.data.items || commentsRes.data || [];
        const validComments = rawComments.filter((comment) => {
          if (comment.deleted_at) return false;
          if (!comment.post) return false; // 게시글 완전 삭제됨
          if (comment.post.deleted_at) return false; // 게시글 소프트 삭제됨
          return true;
        });

        setMyComments(validComments);
      } catch (error) {
        console.error("마이페이지 로딩 실패:", error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, handleLogout]);

  // ★ [수정됨] URL이 없으면 "" 대신 null을 반환하여 경고 방지
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("data:image")) return url;
    const path = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:4000${path}`;
  };

  const goToDetail = (id) => {
    if (!id) return;
    navigate(`/posts/${id}`);
  };

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
      console.error("실패:", error);
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

  // 프로필 이미지 URL 결정 (수정 중 vs 일반)
  const currentProfileUrl = isEditing
    ? getImageUrl(editForm.profile_image_url)
    : getImageUrl(user.profile_image_url);

  // 기본 프로필 이미지
  const defaultProfileUrl =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  return (
    <div className="mypage">
      <div className="profile-header">
        <div className="profile-img-container">
          {/* ★ [수정됨] src={A || B} 패턴 사용으로 빈 문자열 전달 방지 */}
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
                // 게시물 이미지 URL 처리
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
                    {/* ★ [수정됨] URL이 있을 때만 img 렌더링 */}
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
                const targetPostId =
                  comment.post?.id || comment.postId || comment.post_id;

                // ★ [수정됨] 썸네일 이미지 URL 안전하게 추출
                const rawThumbUrl =
                  comment.post?.images && comment.post.images.length > 0
                    ? comment.post.images[0].url
                    : null;

                const finalThumbSrc = getImageUrl(rawThumbUrl);

                return (
                  <div
                    key={comment.id || idx}
                    className="comment-row"
                    onClick={() => targetPostId && goToDetail(targetPostId)}
                    style={{ cursor: targetPostId ? "pointer" : "default" }}
                  >
                    <div className="comment-thumb">
                      {/* ★ [수정됨] URL이 있을 때만 이미지 렌더링, 없으면 회색 박스 */}
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
