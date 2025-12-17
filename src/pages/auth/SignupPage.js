import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../api/api";
import "./SignupPage.css";

const SignupPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
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

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    try {
      // 1. 회원가입 API 호출
      // 명세서 requestBody: { email, password, nickname }
      await authAPI.register({
        email,
        password,
        nickname,
      });

      alert("회원가입이 완료되었습니다! 로그인해주세요.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 409) {
        setError("이미 사용 중인 이메일이나 닉네임입니다.");
      } else {
        setError("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ig-auth-wrapper">
      <div className="ig-auth-box">
        <h1 className="ig-logo-text">Archive</h1>

        <h2 className="ig-sub-text">
          친구들의 사진과 동영상을 보려면 가입하세요.
        </h2>

        <form className="ig-auth-form" onSubmit={handleSubmit}>
          {/* 이메일 입력 */}
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* 닉네임 입력 (추가됨) */}
          <input
            type="text"
            placeholder="사용자 이름 (닉네임)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />

          {/* 비밀번호 입력 */}
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* 비밀번호 확인 */}
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
            disabled={
              loading || !email || !nickname || !password || !confirmPassword
            }
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
