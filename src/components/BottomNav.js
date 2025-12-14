import { useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiPlusSquare, FiUser } from "react-icons/fi";
import "./BottomNav.css";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 / 회원가입 페이지에서는 숨김
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  return (
    <nav className="bottom-nav">
      <div
        className={`nav-item ${location.pathname === "/main" ? "active" : ""}`}
        onClick={() => navigate("/main")}
      >
        <FiHome />
      </div>

      <div
        className="nav-item create"
        onClick={() => navigate("/posts/create")}
      >
        <FiPlusSquare />
      </div>

      <div
        className={`nav-item ${
          location.pathname === "/mypage" ? "active" : ""
        }`}
        onClick={() => navigate("/mypage")}
      >
        <FiUser />
      </div>
    </nav>
  );
};

export default BottomNav;
