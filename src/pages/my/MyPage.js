import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, userAPI, uploadAPI, removeCookie } from "../../api/api"; // removeCookie 추가
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

  // --- 로그아웃 핸들러 추가 ---
  const handleLogout = useCallback(() => {
    // 1. 저장된 토큰 제거
    removeCookie("accessToken"); // 쿠키 토큰 제거
    localStorage.removeItem("accessToken"); // 로컬스토리지 토큰 제거 (비상용)

    // 2. 상태 초기화 및 페이지 이동
    setUser(null);
    setMyPosts([]);
    setMyComments([]);
    alert("로그아웃 되었습니다.");
    navigate("/login"); // 로그인 페이지로 이동
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

        // 1. 내 게시물 필터링 (삭제된 글 제외)
        const rawPosts = postsRes.data.items || postsRes.data || [];
        const validPosts = rawPosts.filter((post) => !post.deleted_at);
        setMyPosts(validPosts);

        // 2. 내 댓글 필터링 (여기가 핵심!)
        const rawComments = commentsRes.data.items || commentsRes.data || [];

        const validComments = rawComments.filter((comment) => {
          // 1) 댓글 자체가 삭제된 경우 제외
          if (comment.deleted_at) return false;

          // 2) 연결된 게시글 정보(post)가 아예 없는 경우 제외 (게시글 완전 삭제됨)
          if (!comment.post) return false;

          // 3) 연결된 게시글이 soft delete(휴지통) 상태인 경우 제외
          if (comment.post.deleted_at) return false;

          return true;
        });

        setMyComments(validComments);
      } catch (error) {
        console.error("마이페이지 로딩 실패:", error);
        // 오류 발생 시 로그아웃 처리 및 로그인 페이지로 리다이렉트
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, handleLogout]); // handleLogout 의존성 추가

  // --- 기존 코드 유지 ---
  const getImageUrl = (url) => {
    if (!url) return "";
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

  return (
    <div className="mypage">
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
                {" "}
                {/* 버튼을 담을 새로운 Row */}
                <button className="edit-profile-btn" onClick={startEditing}>
                  프로필 편집
                </button>
                <button className="logout-btn" onClick={handleLogout}>
                  {" "}
                  {/* 로그아웃 버튼 */}
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
      {/* ... (나머지 UI 코드는 동일) ... */}
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
              myPosts.map((post) => (
                <div
                  key={post.id}
                  className="grid-item"
                  onClick={() => goToDetail(post.id)}
                >
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
                  onClick={() => comment.post && goToDetail(comment.postId)}
                >
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
