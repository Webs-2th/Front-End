import axios from "axios";

// ==============================================
// 1. 쿠키 관리 헬퍼 함수
// ==============================================

// 쿠키 저장 (기본 7일)
export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  // path=/ 설정으로 사이트 전체에서 쿠키 접근 가능
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

// 쿠키 가져오기
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

// 쿠키 삭제 (로그아웃 시 사용)
export const removeCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// ==============================================
// 2. Axios 인스턴스 생성 (기본 설정)
// ==============================================
const api = axios.create({
  baseURL: "http://localhost:4000/api/v1", // 백엔드 서버 주소
  headers: {
    "Content-Type": "application/json",
  },
});

// ==============================================
// ★ 3. 요청 인터셉터 (Request Interceptor) - 수정됨 ★
// ==============================================
// API 요청을 보낼 때마다 토큰을 찾아 헤더에 심어줍니다.
api.interceptors.request.use(
  (config) => {
    // 1순위: 쿠키에서 토큰 찾기
    let token = getCookie("accessToken");

    // 2순위: 쿠키에 없으면 로컬스토리지에서 찾기 (비상용)
    if (!token) {
      token = localStorage.getItem("accessToken");
    }

    // 토큰이 발견되면 헤더에 Authorization 추가
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ API 요청에 토큰이 없습니다. (익명 처리될 수 있음)");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==============================================
// 4. API 함수 정의 (Swagger 명세 기준)
// ==============================================

/**
 * [Auth] 인증 관련
 */
export const authAPI = {
  // 회원가입
  register: (data) => api.post("/auth/register", data),

  // 이메일 인증
  verifyEmail: (data) => api.post("/auth/verify-email", data),

  // 로그인
  login: (data) => api.post("/auth/login", data),

  // 현재 로그인한 사용자 정보 조회 (내 정보)
  getMe: () => api.get("/auth/me"),
};

/**
 * [Posts] 게시글 관련
 */
export const postAPI = {
  // 게시글 목록 조회
  getPosts: (params) => api.get("/posts", { params }),

  // 게시글 작성
  createPost: (data) => api.post("/posts", data),

  // ★ 상세 페이지용 (기존 getPostDetail과 동일)
  getPostById: (id) => api.get(`/posts/${id}`),

  // 게시글 상세 조회
  getPostDetail: (postId) => api.get(`/posts/${postId}`),

  // 게시글 수정
  updatePost: (postId, data) => api.patch(`/posts/${postId}`, data),

  // 게시글 삭제
  deletePost: (postId) => api.delete(`/posts/${postId}`),
};

/**
 * [Comments] 댓글 관련
 */
export const commentAPI = {
  // 특정 게시글의 댓글 목록 조회
  getComments: (postId, params) =>
    api.get(`/posts/${postId}/comments`, { params }),

  // 댓글 작성
  createComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),

  // 댓글 수정
  updateComment: (commentId, data) => api.patch(`/comments/${commentId}`, data),

  // 댓글 삭제
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

/**
 * [Users] 사용자(마이페이지) 관련
 */
export const userAPI = {
  // 내 프로필 상세 조회
  getMyProfile: () => api.get("/users/me"),

  // 내 프로필 수정
  updateMyProfile: (data) => api.patch("/users/me", data),

  // 내가 쓴 게시글 목록
  getMyPosts: (params) => api.get("/users/me/posts", { params }),

  // 내가 쓴 댓글 목록
  getMyComments: (params) => api.get("/users/me/comments", { params }),

  // 내가 댓글 단 게시글 목록
  getCommentedPosts: (params) => api.get("/users/me/commented-posts"),
};

/**
 * [Uploads] 파일 업로드 관련
 */
export const uploadAPI = {
  // 이미지 업로드
  uploadImage: (formData) =>
    api.post("/uploads/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

export default api;
