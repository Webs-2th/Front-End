import axios from "axios";

// --- 1. 쿠키 관리 함수 ---
export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

export const removeCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// --- 2. Axios 인스턴스 ---
const api = axios.create({
  baseURL: "http://localhost:4000/api/v1", // Swagger Server URL
  headers: {
    "Content-Type": "application/json",
  },
});

// --- 3. 인터셉터 (토큰 주입) ---
api.interceptors.request.use(
  (config) => {
    let token = getCookie("accessToken");
    if (!token) {
      token = localStorage.getItem("accessToken");
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 4. API 정의 ---

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  verifyEmail: (data) => api.post("/auth/verify-email", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

export const postAPI = {
  // 게시글 목록 (MainPage)
  getPosts: (params) => api.get("/posts", { params }),

  // 게시글 작성
  createPost: (data) => api.post("/posts", data),

  // 게시글 상세 (PostDetailPage 용)
  getPostById: (id) => api.get(`/posts/${id}`),

  // ★ [수정됨] 게시글 상세 (수정 페이지용 - CreatePostPage에서 호출하는 이름)
  // getPostById와 동일한 API를 호출하도록 추가
  getPostDetail: (id) => api.get(`/posts/${id}`),

  // 게시글 수정
  updatePost: (postId, data) => api.patch(`/posts/${postId}`, data),

  // 게시글 삭제
  deletePost: (postId) => api.delete(`/posts/${postId}`),

  // 좋아요 토글
  togglePostLike: (postId) => api.post(`/posts/${postId}/likes/toggle`),
};

export const commentAPI = {
  // 댓글 목록 조회
  getComments: (postId, params) =>
    api.get(`/posts/${postId}/comments`, { params }),

  // 댓글 작성
  createComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),

  // 댓글 수정
  updateComment: (commentId, data) => api.patch(`/comments/${commentId}`, data),

  // 댓글 삭제
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

export const userAPI = {
  getMyProfile: () => api.get("/users/me"),
  updateMyProfile: (data) => api.patch("/users/me", data),
  getMyPosts: (params) => api.get("/users/me/posts", { params }),
  getMyComments: (params) => api.get("/users/me/comments", { params }),
  getCommentedPosts: (params) => api.get("/users/me/commented-posts"),
};

export const uploadAPI = {
  uploadImage: (formData) =>
    api.post("/uploads/images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default api;
