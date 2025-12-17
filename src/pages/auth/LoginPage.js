import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI, setCookie } from "../../api/api";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState(""); // 이메일
  const [password, setPassword] = useState(""); // 비밀번호
  const [loading, setLoading] = useState(false); // 요청 진행 여부
  const [error, setError] = useState(""); // 에러 메시지

  // 로그인 폼 제출 시 실행되는 함수
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. 로그인 API 요청
      const response = await authAPI.login({ email, password });

      const { accessToken, user } = response.data;
      setCookie("accessToken", accessToken, 7);

      console.log(`${user.nickname}님 로그인 성공`);

      // 4. 메인 페이지로 이동
      navigate("/main");
    } catch (err) {
      console.error(err);
      // 로그인 실패 시 에러 메시지 설정
      setError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* 로그인 페이지 전체를 감싸는 컨테이너 */
    <div className="ig-auth-wrapper">
      {/* 로그인 폼 박스 영역 */}
      <div className="ig-auth-box">
        {/* 서비스 로고 */}
        <h1 className="ig-logo-text">Archive</h1>

        {/* 로그인 입력 폼 */}
        <form className="ig-auth-form" onSubmit={handleSubmit}>
          {/* 이메일 입력 */}
          <div className="ig-input-group">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* 비밀번호 입력 */}
          <div className="ig-input-group">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* 로그인 버튼 */}
          <button type="submit" className="ig-submit-btn">
            {loading ? "로그인 중..." : "로그인"}
          </button>

          {/* 에러 메시지 표시 */}
          {error && <p className="ig-auth-error">{error}</p>}
        </form>

        {/* 구분선 (디자인 요소) */}
        <div className="ig-divider">
          <div className="ig-line"></div>
          <div className="ig-text">또는</div>
          <div className="ig-line"></div>
        </div>
      </div>

      {/* 회원가입 링크 영역 */}
      <div className="ig-auth-footer">
        <p>
          계정이 없으신가요? <Link to="/signup">가입하기</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
