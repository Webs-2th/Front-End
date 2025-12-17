import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, userAPI, uploadAPI, removeCookie } from "../../api/api";
import "./MyPage.css";

const MyPage = () => {
  const navigate = useNavigate();

  const fileInputRef = useRef(null); // 파일에 직접 접근

  // 1. 상태(State) 관리
  const [user, setUser] = useState(null); // 로그인한 사용자 정보

  // 프로필 수정 폼 데이터 (닉네임, 자기소개, 프사 URL)
  const [editForm, setEditForm] = useState({
    nickname: "",
    bio: "",
    profile_image_url: "",
  });

  const [myPosts, setMyPosts] = useState([]); // 내가 쓴 게시물 목록
  const [myComments, setMyComments] = useState([]); // 내가 쓴 댓글 목록

  const [activeTab, setActiveTab] = useState("posts"); // 현재 보고 있는 탭
  const [isEditing, setIsEditing] = useState(false); // 프로필 수정 모드
  const [loading, setLoading] = useState(true); // 데이터 로딩 중 여부

  // 2. 로그아웃 핸들러
  const handleLogout = useCallback(() => {
    removeCookie("accessToken");
    localStorage.removeItem("accessToken");
    setUser(null);
    setMyPosts([]);
    setMyComments([]);
    alert("로그아웃 되었습니다.");
    navigate("/login");
  }, [navigate]);

  // 3. 초기 데이터 로딩 (useEffect)
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
        setUser(userData); // 받아온 유저 정보 저장

        // 수정 폼 초기값 설정 (서버 데이터가 없으면 빈 문자열)
        setEditForm({
          nickname: userData.nickname || "",
          bio: userData.bio || "",
          profile_image_url:
            userData.profile_image_url || userData.profileImageUrl || "",
        });

        // 1. 내 게시물 데이터 처리 (삭제된 글은 필터링)
        const rawPosts = postsRes.data.items || postsRes.data || [];
        const validPosts = rawPosts.filter((post) => !post.deleted_at);
        setMyPosts(validPosts);

        // 2. 내 댓글 데이터 처리
        const rawComments = commentsRes.data.items || commentsRes.data || [];
        const validComments = rawComments.filter(
          (comment) => !comment.deleted_at
        );
        setMyComments(validComments);
      } catch (error) {
        console.error("데이터 로딩 에러:", error);
      } finally {
        setLoading(false); // 로딩 끝
      }
    };

    fetchData();
  }, [navigate, handleLogout]);

  // [유틸] 이미지 URL 보정 함수
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("data:image")) return url;
    const path = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:4000${path}`;
  };

  // [이동] 상세 페이지로 이동
  const goToDetail = (id) => {
    if (!id) {
      alert("게시물 정보를 찾을 수 없습니다.");
      return;
    }
    navigate(`/posts/${id}`);
  };

  // [이벤트] 텍스트 입력값 변경 핸들러 (닉네임, 자기소개)
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    // 기존 폼 데이터를 유지하면서 변경된 필드만 업데이트
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // 4. 프로필 이미지 변경 핸들러 (파일 업로드)
  const handleProfileImgChange = async (e) => {
    const file = e.target.files[0]; // 사용자가 선택한 파일
    if (!file) return;

    try {
      // 1. 이미지 서버 업로드
      const formData = new FormData();
      formData.append("image", file);
      const uploadRes = await uploadAPI.uploadImage(formData); // 서버에 파일 전송

      // 2. 업로드된 이미지 URL 받기 (+ 캐싱 방지용 타임스탬프)
      const newImageUrl = `${uploadRes.data.url}?t=${Date.now()}`;

      // 3. 내 정보 업데이트 요청 (이미지 URL만 변경)
      const updateData = {
        nickname: user.nickname,
        bio: user.bio || "",
        profile_image_url: newImageUrl,
      };

      await userAPI.updateMyProfile(updateData);

      // 4. 화면(State) 즉시 반영
      setUser((prev) => ({
        ...prev,
        profile_image_url: newImageUrl,
        profileImageUrl: newImageUrl,
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

  // [모드 전환] 수정 모드 시작
  const startEditing = () => {
    setEditForm({
      nickname: user.nickname || "",
      bio: user.bio || "",
      profile_image_url: user.profile_image_url || user.profileImageUrl || "",
    });
    setIsEditing(true);
  };

  // [API 요청] 프로필 수정 내용 저장
  const saveProfile = async () => {
    try {
      const safeForm = {
        ...editForm,
        bio: editForm.bio || "",
        profile_image_url: editForm.profile_image_url || "",
      };

      // 서버로 수정된 정보 전송
      const res = await userAPI.updateMyProfile(safeForm);
      setUser(res.data); // 받아온 최신 정보로 갱신
      setIsEditing(false); // 수정 모드 종료
      alert("프로필 정보가 수정되었습니다.");
    } catch (error) {
      alert("수정에 실패했습니다.");
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (!user) return null;

  // 5. 렌더링 로직
  const currentProfileUrl = isEditing
    ? getImageUrl(editForm.profile_image_url)
    : getImageUrl(user.profile_image_url || user.profileImageUrl);

  const defaultProfileUrl =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  return (
    <div className="mypage">
      {/* --- 프로필 헤더 영역 (사진 + 정보) --- */}
      <div className="profile-header">
        <div className="profile-img-container">
          {/* 프로필 이미지 (클릭 시 파일 선택창 열림) */}
          <img
            key={currentProfileUrl} // URL이 바뀌면 이미지를 깜빡이며 새로고침하도록 키 설정
            src={currentProfileUrl || defaultProfileUrl}
            alt="profile"
            className="my-profile-img"
            onClick={() => fileInputRef.current.click()} // ref로 연결된 input 클릭 트리거
            style={{ cursor: "pointer" }}
            onError={(e) => {
              e.target.src = defaultProfileUrl; // 이미지 로드 실패 시 기본 이미지
            }}
          />
          {/* 숨겨진 파일 업로드 입력창 */}
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*"
            onChange={handleProfileImgChange}
          />
        </div>

        <div className="profile-info">
          {/* 수정 모드일 때: 입력창(input) 표시 */}
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
            /* 보기 모드일 때: 텍스트 정보 표시 */
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

      {/* --- 탭 메뉴 (게시물 / 댓글) --- */}
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

      {/* --- 탭 컨텐츠 영역 --- */}
      <div className="profile-content">
        {activeTab === "posts" ? (
          /* [게시물 그리드 뷰] */
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
          /* [댓글 리스트 뷰] */
          <div className="comments-list-view">
            {myComments.length === 0 ? (
              <div className="no-content">작성한 댓글이 없습니다.</div>
            ) : (
              myComments.map((comment, idx) => {
                // 댓글이 달린 원본 게시물 정보 찾기
                const targetPost = comment.post || comment.Post;
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
                    {/* 게시물 썸네일 */}
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

                    {/* 댓글 내용 미리보기 */}
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
