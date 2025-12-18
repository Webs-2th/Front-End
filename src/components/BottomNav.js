import { useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiPlusSquare, FiUser } from "react-icons/fi";
import "./BottomNav.css";

const BottomNav = () => {
  const navigate = useNavigate(); // 클릭 시 특정 페이지로 이동하기 위한 훅
  const location = useLocation(); // 현재 URL 경로를 확인하기 위한 훅

  // 게시물 상세 페이지 여부 확인 (작성 페이지는 제외)
  const isPostDetailPage =
    location.pathname.startsWith("/posts/") &&
    location.pathname !== "/posts/create";

  // 로그인, 회원가입, 게시물 상세 페이지에서는 하단 네비게이션 숨김
  if (
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    isPostDetailPage
  ) {
    return null;
  }

  // 하단 네비게이션 렌더링
  return (
    <nav className="bottom-nav">
      {/* 메인 페이지 이동 버튼 */}
      <div
        className={`nav-item ${location.pathname === "/main" ? "active" : ""}`} // 현재 페이지 강조
        onClick={() => navigate("/main")}
      >
        <FiHome />
      </div>

      {/* 게시물 작성 페이지 이동 버튼 */}
      <div
        className="nav-item create"
        onClick={() => navigate("/posts/create")}
      >
        <FiPlusSquare />
      </div>

      {/* 마이페이지 이동 버튼 */}
      <div
        className={`nav-item ${
          location.pathname === "/mypage" ? "active" : ""
        }`} // 현재 페이지 강조
        onClick={() => navigate("/mypage")}
      >
        <FiUser />
      </div>
    </nav>
  );
};

export default BottomNav;
