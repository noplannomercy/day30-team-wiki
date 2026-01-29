# Vercel 배포 가이드

## 1단계: Vercel 로그인

```bash
vercel login
```

브라우저에서 인증을 완료하세요.

## 2단계: 첫 배포 (환경 변수 없이)

```bash
vercel
```

- Setup and deploy? **Y**
- Which scope? (본인 계정 선택)
- Link to existing project? **N**
- What's your project's name? **day30-team-wiki** (원하는 이름)
- In which directory is your code located? **./** (엔터)
- Want to override the settings? **N**

배포가 완료되면 **도메인**이 표시됩니다:
```
https://day30-team-wiki-xxxxx.vercel.app
```

## 3단계: 환경 변수 설정

Vercel 대시보드에서 환경 변수를 설정합니다:

### 방법 1: Vercel CLI로 설정

```bash
# DATABASE_URL
vercel env add DATABASE_URL production
# 입력: postgresql://budget:budget123@193.168.195.222:5432/teamwiki

# DATABASE_DIRECT_URL
vercel env add DATABASE_DIRECT_URL production
# 입력: postgresql://budget:budget123@193.168.195.222:5432/teamwiki

# NEXTAUTH_URL (배포된 도메인 사용)
vercel env add NEXTAUTH_URL production
# 입력: https://your-actual-domain.vercel.app

# NEXTAUTH_SECRET
vercel env add NEXTAUTH_SECRET production
# 입력: 5R//H9UPnylLSU9ZGk/LQYBsDJRt+kh7apmtRZZKEFQ=

# OPENROUTER_API_KEY
vercel env add OPENROUTER_API_KEY production
# 입력: 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
```

### 방법 2: Vercel 대시보드에서 설정

1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables**
4. 다음 변수들을 추가:

| Name | Value | Environment |
|------|-------|-------------|
| DATABASE_URL | postgresql://budget:budget123@193.168.195.222:5432/teamwiki | Production |
| DATABASE_DIRECT_URL | postgresql://budget:budget123@193.168.195.222:5432/teamwiki | Production |
| NEXTAUTH_URL | https://your-app.vercel.app | Production |
| NEXTAUTH_SECRET | 5R//H9UPnylLSU9ZGk/LQYBsDJRt+kh7apmtRZZKEFQ= | Production |
| OPENROUTER_API_KEY | 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 | Production |

## 4단계: 재배포

환경 변수 설정 후 재배포:

```bash
vercel --prod
```

## 5단계: 데이터베이스 확인

배포된 사이트에서:
1. 회원가입 테스트
2. 워크스페이스가 없으면 시드 스크립트 실행 필요
3. 문서 생성 테스트

## 주의사항

### NEXTAUTH_URL 설정

- **로컬**: `http://localhost:3000`
- **Production**: `https://your-app.vercel.app`
- Vercel은 자동으로 `VERCEL_URL` 환경 변수를 제공하지만, NextAuth는 명시적 설정 필요

### 도메인 변경 시

커스텀 도메인을 추가한 경우:
```bash
vercel env rm NEXTAUTH_URL production
vercel env add NEXTAUTH_URL production
# 입력: https://your-custom-domain.com

vercel --prod
```

### Google OAuth 설정

Google OAuth를 사용하려면:
1. Google Cloud Console에서 Authorized redirect URIs 추가:
   - `https://your-app.vercel.app/api/auth/callback/google`
2. 환경 변수 추가:
   ```bash
   vercel env add GOOGLE_CLIENT_ID production
   vercel env add GOOGLE_CLIENT_SECRET production
   ```

## 문제 해결

### 배포 후 500 에러

1. Vercel 대시보드 → **Functions** 탭에서 로그 확인
2. 환경 변수 누락 확인
3. 데이터베이스 연결 확인 (IP 화이트리스트)

### 데이터베이스 연결 실패

PostgreSQL 서버에서 Vercel IP 허용 확인:
- Vercel은 동적 IP 사용
- 모든 IP 허용 (0.0.0.0/0) 또는 Vercel IP 범위 설정

### NEXTAUTH 에러

- NEXTAUTH_URL이 배포 도메인과 정확히 일치하는지 확인
- https:// 포함 확인
- 마지막 슬래시(/) 없이 설정

## 유용한 명령어

```bash
# 로그 확인
vercel logs

# 환경 변수 목록
vercel env ls

# 환경 변수 삭제
vercel env rm VARIABLE_NAME production

# 프로젝트 제거
vercel remove project-name
```

## 자동 배포 설정 (권장)

GitHub/GitLab 연동 시 자동 배포:

1. Vercel 대시보드 → **Import Project**
2. Git 저장소 선택
3. 환경 변수 설정
4. main 브랜치에 push하면 자동 배포

## 성능 최적화

### Edge Config (선택사항)

빠른 응답을 위해 Vercel Edge Config 사용 가능

### Caching

- Next.js 자동 캐싱 활용
- ISR (Incremental Static Regeneration) 고려

---

배포 완료 후 접속 URL:
- **Production**: https://your-app.vercel.app
- **Preview**: https://your-app-xxxxx.vercel.app (각 배포마다 생성)
