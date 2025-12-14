import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./MyPage.css";

const MyPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // 현재 로그인한 사용자 (가정)
  const [user, setUser] = useState({
    username: "um_chwoo",
    name: "엄준식",
    intro: "안녕하세요. 프론트엔드 개발자입니다.",
    profileImg: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
  });

  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts"); // 'posts' or 'comments'
  const [isEditing, setIsEditing] = useState(false); // 편집 모드 상태
  const [editForm, setEditForm] = useState({ ...user }); // 편집 입력값

  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem("posts")) || [];
    setPosts(savedPosts);
  }, []);

  // 1. 내가 쓴 글 필터링
  const myPosts = posts.filter((p) => p.author?.username === user.username);

  // 2. 내가 쓴 댓글 필터링
  const myComments = [];
  posts.forEach((post) => {
    if (post.comments) {
      post.comments.forEach((comment) => {
        if (comment.username === user.username) {
          myComments.push({
            ...comment,
            postId: post.id,
            postImage: post.image, // 썸네일용
          });
        }
      });
    }
  });

  const goToDetail = (id) => {
    navigate(`/posts/${id}`);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditForm((prev) => ({ ...prev, profileImg: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    setUser(editForm);
    setIsEditing(false);
  };

  return (
    <div className="mypage">
      {/* 1. 프로필 헤더 영역 */}
      <div className="profile-header">
        <div className="profile-img-container">
          <img
            src={isEditing ? editForm.profileImg : user.profileImg}
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
                name="username"
                value={editForm.username}
                onChange={handleEditChange}
                placeholder="아이디"
                className="edit-input"
              />
              <input
                name="intro"
                value={editForm.intro}
                onChange={handleEditChange}
                placeholder="소개"
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
                <span className="username">{user.username}</span>
                <button
                  className="edit-profile-btn"
                  onClick={() => {
                    setIsEditing(true);
                    setEditForm(user);
                  }}
                >
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
              <div className="bio-row">{user.intro}</div>
            </>
          )}
        </div>
      </div>

      {/* 2. 탭 메뉴 (게시물 / 댓글) */}
      <div className="profile-tabs">
        {/* 왼쪽 탭: 내 게시물 */}
        <div
          className={`tab-item ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          {/* CSS로 처리된 아이콘 */}
          <div className="tab-icon grid"></div>
        </div>

        {/* 오른쪽 탭: 내 댓글 (말풍선 아이콘) */}
        <div
          className={`tab-item ${activeTab === "comments" ? "active" : ""}`}
          onClick={() => setActiveTab("comments")}
        >
          {/* CSS로 처리된 아이콘 */}
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
                  {post.image ? (
                    <img src={post.image} alt="post" />
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
                  key={idx}
                  className="comment-row"
                  onClick={() => goToDetail(comment.postId)}
                >
                  <div className="comment-thumb">
                    {comment.postImage ? (
                      <img src={comment.postImage} alt="thumb" />
                    ) : (
                      <div className="thumb-placeholder"></div>
                    )}
                  </div>
                  <div className="comment-preview">
                    <span className="comment-text-bold">{comment.text}</span>
                    <span className="comment-date-small">{comment.date}</span>
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
