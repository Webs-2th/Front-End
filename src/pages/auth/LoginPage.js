import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI, setCookie } from "../../api/api";
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
      // 1. API 로그인 요청
      const response = await authAPI.login({ email, password });

      // 2. 응답에서 토큰 추출 (명세서: accessToken)
      const { accessToken, user } = response.data;

      // 3. 쿠키에 토큰 저장 (7일간 유지)
      setCookie("accessToken", accessToken, 7);

      // (선택) 사용자 닉네임 환영 메시지 등 필요하면 사용
      console.log(`${user.nickname}님 로그인 성공`);

      // 4. 메인으로 이동
      navigate("/main");
    } catch (err) {
      console.error(err);
      // 에러 메시지 처리 (401 등)
      setError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
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
