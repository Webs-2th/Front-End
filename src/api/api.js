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
  getPosts: (params) => api.get("/posts", { params }),
  createPost: (data) => api.post("/posts", data),
  getPostById: (id) => api.get(`/posts/${id}`),
  getPostDetail: (id) => api.get(`/posts/${id}`),
  updatePost: (postId, data) => api.patch(`/posts/${postId}`, data),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  togglePostLike: (postId) => api.post(`/posts/${postId}/likes/toggle`),
};

export const commentAPI = {
  getComments: (postId, params) =>
    api.get(`/posts/${postId}/comments`, { params }),
  createComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  updateComment: (commentId, data) => api.patch(`/comments/${commentId}`, data),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

export const userAPI = {
  getMyProfile: () => api.get("/users/me"),

  // ★ [핵심 수정] 422 에러 방지 로직 추가
  updateMyProfile: (data) => {
    // 서버가 null을 받으면 422 에러를 낼 수 있으므로 안전하게 처리
    const payload = {
      nickname: data.nickname, // 닉네임은 필수라 null일 확률 낮음
      bio: data.bio || "", // bio가 null이면 빈 문자열로 보냄
      // 프론트에서 넘어온 키가 무엇이든 API 스펙(profileImageUrl)에 맞춤
      profileImageUrl: data.profileImageUrl || data.profile_image_url || "",
    };

    console.log("프로필 수정 요청 데이터:", payload); // 디버깅용 로그
    return api.patch("/users/me", payload);
  },

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
