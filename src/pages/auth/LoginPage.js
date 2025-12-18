import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI, setCookie } from "../../api/api";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate(); // 로그인 성공 시 페이지 이동을 위한 훅

  // 입력값 및 UI 상태 관리
  const [email, setEmail] = useState(""); // 이메일 입력값
  const [password, setPassword] = useState(""); // 비밀번호 입력값
  const [loading, setLoading] = useState(false); // 로그인 요청 중 여부
  const [error, setError] = useState(""); // 에러 메시지

  // 로그인 폼 제출 시 실행
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 form 제출 동작 방지
    setError(""); // 이전 에러 초기화
    setLoading(true); // 로딩 시작

    try {
      // 로그인 API 요청 (이메일, 비밀번호 전달)
      const response = await authAPI.login({ email, password });

      // 서버에서 받은 토큰과 사용자 정보
      const { accessToken, user } = response.data;

      // 액세스 토큰을 쿠키에 저장하여 인증 상태 유지
      setCookie("accessToken", accessToken, 7);

      console.log(`${user.nickname}님 로그인 성공`);

      // 로그인 성공 시 메인 페이지로 이동
      navigate("/main");
    } catch (err) {
      console.error(err);
      // 로그인 실패 시 에러 메시지 표시
      setError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  return (
    /* 로그인 페이지 전체 컨테이너 */
    <div className="ig-auth-wrapper">
      {/* 로그인 박스 */}
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
              onChange={(e) => setEmail(e.target.value)} // 입력값 상태 저장
              required
            />
          </div>

          {/* 비밀번호 입력 */}
          <div className="ig-input-group">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // 입력값 상태 저장
              required
            />
          </div>

          {/* 로그인 버튼 */}
          <button type="submit" className="ig-submit-btn">
            {loading ? "로그인 중..." : "로그인"} {/* 로딩 상태 표시 */}
          </button>

          {/* 로그인 실패 시 에러 메시지 */}
          {error && <p className="ig-auth-error">{error}</p>}
        </form>

        {/* 구분선 UI */}
        <div className="ig-divider">
          <div className="ig-line"></div>
          <div className="ig-text">또는</div>
          <div className="ig-line"></div>
        </div>
      </div>

      {/* 회원가입 페이지 이동 링크 */}
      <div className="ig-auth-footer">
        <p>
          계정이 없으신가요? <Link to="/signup">가입하기</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
