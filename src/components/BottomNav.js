import { useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiPlusSquare, FiUser } from "react-icons/fi";
import "./BottomNav.css";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
