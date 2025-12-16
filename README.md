<div align="center">

# 📸 Archive

### 사진과 함께 일상의 추억을 기록하고 공유하는 SNS

**React 기반 추억 저장소 웹 애플리케이션**

<br/>

<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img src="https://img.shields.io/badge/React_Router_v6-CA4245?style=for-the-badge&logo=react-router&logoColor=white">
<img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white">
<img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white">

<br/>
<br/>

</div>

## 📝 프로젝트 소개

**Archive**는 사용자의 소중한 추억을 사진과 함께 기록하고 타인과 공유할 수 있는 **SNS 형태의 웹 애플리케이션**입니다.  
직관적인 UI를 통해 게시물을 관리하고, 좋아요와 댓글 기능을 통해 다른 사용자와 소통할 수 있습니다.

<br/>

## ✨ 주요 기능

### 🔐 인증 (Authentication)

- **회원가입 및 로그인**: JWT 기반 인증 시스템
- **보안**: 로그인 후 서비스 이용 가능, Cookie 기반 로그인 상태 유지

### 🖼️ 게시물 (Post)

- **CRUD**: 게시물 작성, 수정, 삭제 기능
- **미디어**: 이미지 업로드 지원 (FormData 활용)
- **태그**: 게시물 관련 태그 추가 및 관리
- **조회**: 전체 게시물 목록(피드) 및 상세 페이지 조회

### 💬 소통 (Interaction)

- **댓글**: 게시물에 대한 댓글 작성, 수정, 삭제
- **좋아요**: 게시물 좋아요 토글 기능 (localStorage를 활용한 상태 관리 보조)

### 👤 마이페이지 (My Page)

- **프로필 관리**: 닉네임, 자기소개, 프로필 이미지 편집
- **활동 모아보기**: 내가 작성한 게시물 및 댓글 목록 조회

<br/>

## 🛠 기술 스택 (Tech Stack)

| 구분              | 기술 (Technology)                                                                              | 상세 내용                             |
| :---------------- | :--------------------------------------------------------------------------------------------- | :------------------------------------ |
| **Frontend**      | <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black">               | Function Component, Hooks 활용        |
| **Routing**       | <img src="https://img.shields.io/badge/React_Router-CA4245?logo=react-router&logoColor=white"> | SPA 라우팅 구현 (v6)                  |
| **Data Fetching** | <img src="https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white">               | REST API 비동기 통신                  |
| **Auth**          | <img src="https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white">         | Token 기반 인증 및 Cookie 관리        |
| **Storage**       | **LocalStorage**                                                                               | 좋아요 상태 등 클라이언트 데이터 관리 |

<br/>

## 📁 프로젝트 구조 (Project Structure)

```bash
src
├─ 📂 api           # API 통신 모듈 (Axios 인스턴스 및 요청 함수)
├─ 📂 components    # 재사용 가능한 공통 컴포넌트
├─ 📂 pages         # 페이지 단위 컴포넌트
│  ├─ 📂 auth       # 로그인 / 회원가입 페이지
│  ├─ 📂 main       # 메인 피드 페이지
│  ├─ 📂 post       # 게시물 작성/상세 페이지
│  └─ 📂 my         # 마이페이지
└─ App.js           # 라우팅 및 전역 설정
```
