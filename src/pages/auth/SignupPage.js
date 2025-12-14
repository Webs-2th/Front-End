import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./SignupPage.css";

const SignupPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);

    try {
      // TODO: 회원가입 + 이메일 인증 API 연동
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      navigate("/login");
    } catch (err) {
      setError("회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ig-auth-wrapper">
      <div className="ig-auth-box">
        {/* 로고: 로그인 페이지와 통일하려면 'Archive'로 변경 가능 */}
        <h1 className="ig-logo-text">Archive</h1>

        <h2 className="ig-sub-text">
          친구들의 사진과 동영상을 보려면 가입하세요.
        </h2>

        <form className="ig-auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="ig-submit-btn"
            disabled={loading || !email || !password || !confirmPassword}
          >
            {loading ? "가입 중..." : "가입"}
          </button>

          {error && <p className="ig-auth-error">{error}</p>}
        </form>

        <p className="ig-terms-text">
          가입하면 Archive의 <b>약관</b>, <b>데이터 정책</b> 및 <b>쿠키 정책</b>
          에 동의하게 됩니다.
        </p>
      </div>

      <div className="ig-auth-footer">
        <p>
          계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
