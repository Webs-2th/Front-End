import axios from "axios";

/* =======================
   쿠키 관련 유틸 함수
======================= */

// 쿠키 생성 (기본 7일 유지)
export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

// 쿠키 값 가져오기
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

// 쿠키 삭제
export const removeCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/* =======================
   axios 기본 설정
======================= */

// 공통 API 인스턴스 생성
const api = axios.create({
  baseURL: "http://localhost:4000/api/v1", // 서버 기본 주소
  headers: {
    "Content-Type": "application/json",
  },
});

/* =======================
   요청 인터셉터
   (요청 전에 토큰 자동 주입)
======================= */

api.interceptors.request.use(
  (config) => {
    // 쿠키 또는 로컬스토리지에서 토큰 가져오기
    let token = getCookie("accessToken");
    if (!token) {
      token = localStorage.getItem("accessToken");
    }

    // 토큰이 있으면 Authorization 헤더에 추가
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =======================
   인증 관련 API
======================= */

export const authAPI = {
  register: (data) => api.post("/auth/register", data), // 회원가입
  verifyEmail: (data) => api.post("/auth/verify-email", data), // 이메일 인증
  login: (data) => api.post("/auth/login", data), // 로그인
  getMe: () => api.get("/auth/me"), // 내 정보 조회
};

/* =======================
   게시글 관련 API
======================= */

export const postAPI = {
  getPosts: (params) => api.get("/posts", { params }), // 게시글 목록
  createPost: (data) => api.post("/posts", data), // 게시글 작성
  getPostById: (id) => api.get(`/posts/${id}`), // 게시글 단건 조회
  getPostDetail: (id) => api.get(`/posts/${id}`), // 게시글 상세
  updatePost: (postId, data) => api.patch(`/posts/${postId}`, data), // 수정
  deletePost: (postId) => api.delete(`/posts/${postId}`), // 삭제
  togglePostLike: (postId) => api.post(`/posts/${postId}/likes/toggle`), // 좋아요 토글
};

/* =======================
   댓글 관련 API
======================= */

export const commentAPI = {
  getComments: (postId, params) =>
    api.get(`/posts/${postId}/comments`, { params }), // 댓글 목록
  createComment: (postId, data) => api.post(`/posts/${postId}/comments`, data), // 댓글 작성
  updateComment: (commentId, data) => api.patch(`/comments/${commentId}`, data), // 댓글 수정
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`), // 댓글 삭제
};

/* =======================
   사용자 관련 API
======================= */

export const userAPI = {
  getMyProfile: () => api.get("/users/me"), // 내 프로필 조회

  // 내 프로필 수정
  updateMyProfile: (data) => {
    const payload = {
      nickname: data.nickname,
      bio: data.bio || "",
      profileImageUrl: data.profileImageUrl || data.profile_image_url || "",
    };

    console.log("프로필 수정 요청 데이터:", payload);
    return api.patch("/users/me", payload);
  },

  getMyPosts: (params) => api.get("/users/me/posts", { params }), // 내가 쓴 글
  getMyComments: (params) => api.get("/users/me/comments", { params }), // 내가 쓴 댓글
  getCommentedPosts: (params) => api.get("/users/me/commented-posts"), // 댓글 단 게시글
};

/* =======================
   이미지 업로드 API
======================= */

export const uploadAPI = {
  uploadImage: (formData) =>
    api.post("/uploads/images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default api;
