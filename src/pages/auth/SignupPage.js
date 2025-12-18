import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../api/api";
import "./SignupPage.css";

const SignupPage = () => {
  const navigate = useNavigate(); // 회원가입 성공 후 페이지 이동을 위한 훅

  // 입력값 상태 관리
  const [email, setEmail] = useState(""); // 이메일
  const [nickname, setNickname] = useState(""); // 닉네임
  const [password, setPassword] = useState(""); // 비밀번호
  const [confirmPassword, setConfirmPassword] = useState(""); // 비밀번호 확인

  // UI 상태 관리
  const [loading, setLoading] = useState(false); // 회원가입 요청 중 여부
  const [error, setError] = useState(""); // 에러 메시지

  // 회원가입 폼 제출 시 실행
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 form 제출 방지
    setError(""); // 이전 에러 초기화

    // 클라이언트 단 유효성 검사
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setLoading(true); // 로딩 시작

    try {
      // 회원가입 API 요청 (이메일, 비밀번호, 닉네임 전달)
      await authAPI.register({
        email,
        password,
        nickname,
      });

      // 회원가입 성공 시 로그인 페이지로 이동
      alert("회원가입이 완료되었습니다! 로그인해주세요.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      // 중복 계정 등 서버 에러 처리
      if (err.response && err.response.status === 409) {
        setError("이미 사용 중인 이메일이나 닉네임입니다.");
      } else {
        setError("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  return (
    /* 회원가입 페이지 전체 컨테이너 */
    <div className="ig-auth-wrapper">
      {/* 회원가입 박스 */}
      <div className="ig-auth-box">
        {/* 서비스 로고 */}
        <h1 className="ig-logo-text">Archive</h1>

        {/* 안내 문구 */}
        <h2 className="ig-sub-text">
          친구들의 사진과 동영상을 보려면 가입하세요.
        </h2>

        {/* 회원가입 입력 폼 */}
        <form className="ig-auth-form" onSubmit={handleSubmit}>
          {/* 이메일 입력 */}
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // 입력값 상태 저장
            required
          />

          {/* 닉네임 입력 */}
          <input
            type="text"
            placeholder="사용자 이름 (닉네임)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)} // 입력값 상태 저장
            required
          />

          {/* 비밀번호 입력 */}
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // 입력값 상태 저장
            required
          />

          {/* 비밀번호 확인 */}
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} // 입력값 상태 저장
            required
          />

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            className="ig-submit-btn"
            disabled={
              loading || !email || !nickname || !password || !confirmPassword
            } // 입력값 미완성 또는 로딩 중 비활성화
          >
            {loading ? "가입 중..." : "가입"}
          </button>

          {/* 회원가입 실패 시 에러 메시지 */}
          {error && <p className="ig-auth-error">{error}</p>}
        </form>

        {/* 약관 안내 문구 */}
        <p className="ig-terms-text">
          가입하면 Archive의 <b>약관</b>, <b>데이터 정책</b> 및 <b>쿠키 정책</b>
          에 동의하게 됩니다.
        </p>
      </div>

      {/* 로그인 페이지 이동 링크 */}
      <div className="ig-auth-footer">
        <p>
          계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
