import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import MainPage from "./pages/main/MainPage";
import PostDetailPage from "./pages/post/PostDetailPage";
import CreatePostPage from "./pages/post/CreatePostPage";
import MyPage from "./pages/my/MyPage";

import BottomNav from "./components/BottomNav";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/posts/create" element={<CreatePostPage />} />
        <Route path="/posts/edit/:id" element={<CreatePostPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
      <BottomNav />
    </>
  );
}

export default App;
