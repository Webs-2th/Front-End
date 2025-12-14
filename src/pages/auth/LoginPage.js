import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      localStorage.setItem("accessToken", "dummy-token");
      navigate("/main");
    } catch (err) {
      setError("로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ig-auth-wrapper">
      <div className="ig-auth-box">
        <h1 className="ig-logo-text">Archive</h1>

        <form className="ig-auth-form" onSubmit={handleSubmit}>
          <div className="ig-input-group">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="ig-input-group">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="ig-submit-btn"
            disabled={loading || !email || !password}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          {error && <p className="ig-auth-error">{error}</p>}
        </form>

        <div className="ig-divider">
          <div className="ig-line"></div>
          <div className="ig-text">또는</div>
          <div className="ig-line"></div>
        </div>
      </div>

      <div className="ig-auth-footer">
        <p>
          계정이 없으신가요? <Link to="/signup">가입하기</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
