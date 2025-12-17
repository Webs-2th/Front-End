import { Routes, Route, Navigate } from "react-router-dom";

// 각 페이지 컴포넌트 import
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import MainPage from "./pages/main/MainPage";
import PostDetailPage from "./pages/post/PostDetailPage";
import CreatePostPage from "./pages/post/CreatePostPage";
import MyPage from "./pages/my/MyPage";

// 하단 네비게이션 컴포넌트
import BottomNav from "./components/BottomNav";

function App() {
  return (
    <>
      {/* Routes: URL에 따라 어떤 페이지를 보여줄지 정의 */}
      <Routes>
        {/* 기본 경로(/)로 접근 시 로그인 페이지로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 로그인 페이지 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 회원가입 페이지 */}
        <Route path="/signup" element={<SignupPage />} />

        {/* 메인 페이지 */}
        <Route path="/main" element={<MainPage />} />

        {/* 게시물 작성 페이지 */}
        <Route path="/posts/create" element={<CreatePostPage />} />

        {/* 게시물 수정 페이지 (id를 URL 파라미터로 전달) */}
        <Route path="/posts/edit/:id" element={<CreatePostPage />} />

        {/* 게시물 상세 페이지 (id를 URL 파라미터로 전달) */}
        <Route path="/posts/:id" element={<PostDetailPage />} />

        {/* 마이페이지 */}
        <Route path="/mypage" element={<MyPage />} />
      </Routes>

      {/* 모든 페이지 하단에 고정으로 표시되는 네비게이션 바 */}
      <BottomNav />
    </>
  );
}

export default App;
