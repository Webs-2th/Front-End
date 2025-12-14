import { useState } from "react";
import "./MyPage.css";

const MyPage = () => {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    email: "test@example.com",
    nickname: "테스트유저",
  });

  const [tempProfile, setTempProfile] = useState(profile);

  const myPosts = ["내가 쓴 첫 글", "여행 후기"];
  const myComments = [
    { content: "댓글 내용 1", post: "게시물 A" },
    { content: "댓글 내용 2", post: "게시물 B" },
  ];

  const handleSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
  };

  return (
    <div className="mypage">
      {/* 프로필 카드 */}
      <section className="profile-card">
        <div className="profile-header">
          <div className="avatar">{profile.nickname[0]}</div>
          <div className="profile-info">
            {isEditing ? (
              <>
                <input
                  value={tempProfile.nickname}
                  onChange={(e) =>
                    setTempProfile({
                      ...tempProfile,
                      nickname: e.target.value,
                    })
                  }
                />
                <input value={tempProfile.email} disabled />
              </>
            ) : (
              <>
                <span className="nickname">{profile.nickname}</span>
                <span className="email">{profile.email}</span>
              </>
            )}
          </div>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="save" onClick={handleSave}>
                저장
              </button>
              <button className="cancel" onClick={() => setIsEditing(false)}>
                취소
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)}>프로필 수정</button>
          )}
        </div>
      </section>

      {/* 내가 쓴 글 */}
      <section className="mypage-section">
        <h3>내가 쓴 글</h3>
        <ul>
          {myPosts.map((post, idx) => (
            <li key={idx}>{post}</li>
          ))}
        </ul>
      </section>

      {/* 내가 쓴 댓글 */}
      <section className="mypage-section">
        <h3>내가 쓴 댓글</h3>
        <ul>
          {myComments.map((c, idx) => (
            <li key={idx}>
              {c.content}
              <span className="comment-post"> · {c.post}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default MyPage;
