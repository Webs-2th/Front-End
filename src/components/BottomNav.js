import { useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiPlusSquare, FiUser } from "react-icons/fi";
import "./BottomNav.css";

const BottomNav = () => {
  const navigate = useNavigate(); // 특정 URL로 이동하기 위해 사용
  const location = useLocation(); //현재 브라우저의 URL 정보로 페이지 경로 확인

  //어떤 페이지에서 하단바를 숨길지 결정하는 변수
  const isPostDetailPage =
    location.pathname.startsWith("/posts/") &&
    location.pathname !== "/posts/create";

  if (
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    isPostDetailPage
  ) {
    return null;
  }

  // 메인 페이지, 게시물 작성, 마이페이지 이동
  return (
    <nav className="bottom-nav">
      <div
        className={`nav-item ${location.pathname === "/main" ? "active" : ""}`} //강조
        onClick={() => navigate("/main")} // 메인 페이지 이동
      >
        <FiHome />
      </div>
      <div
        className="nav-item create"
        onClick={() => navigate("/posts/create")} // 글 작성
      >
        <FiPlusSquare />
      </div>
      <div
        className={`nav-item ${
          location.pathname === "/mypage" ? "active" : "" //강조
        }`}
        onClick={() => navigate("/mypage")} // 마이페이지 이동
      >
        <FiUser />
      </div>
    </nav>
  );
};

export default BottomNav;
