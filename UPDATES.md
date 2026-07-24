# 하이프트레이닝클럽 작업 로그

---

## 2026-07-23 세션 — 랜딩페이지 카피 수정 + Pricing 섹션 전면 재설계

### 완료된 작업

#### 1. Hero — 서브카피 한 줄 추가
- `components/Hero.tsx`
- "운동이 즐거워집니다." 아래 "**같이 하니까, 꾸준해집니다.**" 추가

#### 2. Problem — 페인포인트 3항목 교체
- `components/Problem.tsx`
- 재미(01) → 시간(02) → 혼자·포기(03) 순서로 재구성
  - 01: "러닝머신 위 30분이 세 시간 같고"
  - 02: "퇴근하면 이미 저녁이라 갈 엄두가 안 나고"
  - 03: "혼자 하다 보면, 한 달 끊고 안 간 적 다들 있으니까요"

#### 3. Pricing — 섹션 전면 재설계
- `components/Pricing.tsx` 전체 재작성
- 단일 카드(14.8만원) → 탭(주2회권/무제한권) + 3카드(1·3·6개월) 구조로 교체
- 헤드 문구: "가격, 숨기지 않아요" + "1:1 PT 월 8회면 50만원이 넘습니다. 같은 코칭 설계를, 그룹으로."
- 3개월 카드 "추천" 뱃지 + 라임 테두리 강조
- 주2회권 3개월·6개월 카드에 횟수(24회·48회) 표기
- **월금액을 메인 강조**, 총액·취소선 원가는 서브로 처리
- 포함 사항 2항목으로 정리 (헬스장 자유이용 항목 제거)
- 당일등록 혜택 예고: 라임 테두리 박스 + 🎁 아이콘
- "첫 수업은 무료입니다." 굵은 대형 헤드로 강조

**가격표 (주2회권):**
| 구간 | 표시 | 총액 | 할인 |
|---|---|---|---|
| 1개월 | 19.8만원 | — | — |
| 3개월 ⭐ | 월 17.8만원 | 총 53.4만원 | 10% |
| 6개월 | 월 14.8만원 | 총 88.8만원 | 25% |

**가격표 (무제한권):**
| 구간 | 표시 | 총액 | 할인 |
|---|---|---|---|
| 1개월 | 23.9만원 | — | — |
| 3개월 ⭐ | 월 19.8만원 | 총 59.4만원 | 17% |
| 6개월 | 월 17.8만원 | 총 106.8만원 | 25% |

#### 4. BookingForm — 서브헤드 추가
- `components/BookingForm.tsx`
- "원하는 날짜와 시간을 선택하세요." 아래 "체험 후 등록 여부는 그때 정하시면 됩니다." 추가

#### 5. BookingForm — 예약 완료 화면 문구 추가
- 예약 완료 시 "체험 당일 등록하시면 별도 혜택도 안내해드려요." 추가
- 금액·조건 비노출, 현장 안내 예고만 표기

---

## 2026-07-17 세션 — 어드민 대시보드 완성 및 배포

### 완료된 작업

#### 1. 캘린더 아이콘 흰색 처리
- `app/globals.css` — `input[type="date"]::-webkit-calendar-picker-indicator` 에 `filter: invert(1)` 적용

#### 2. 통계 탭 기간 필터 추가
- 프리셋 칩: 이번 주 / 이번 달 / 3개월 / 올해 / 전체
- 커스텀 기간: "기간 설정" 토글 시 시작일·종료일 날짜 입력 필드 표시

#### 3. 예약 목록 기간 필터 추가
- 프리셋 칩: 오늘 / 이번 주 / 이번 달 / 기간 선택
- 기간 선택 모드: 시작일·종료일 입력 + "하루만" 버튼 (종료일을 시작일과 동일하게 설정)
- 모든 필터링은 클라이언트 사이드 처리 (API에서 전체 로드 후 프론트에서 필터)

#### 4. 현황 카드 "등록 전환" → "이번 달 전환율"로 교체
- 이번 달 confirmed 예약 중 `outcome === "registered"` 비율 계산
- `loadOverview` 함수에서 월별 예약을 별도 집계

#### 5. 수동 예약 추가 기능
- 예약 목록 탭에 "+ 예약 추가" 버튼 추가
- 모달 폼: 이름, 연락처, 날짜, 시간 입력 후 `/api/booking` POST 호출

#### 6. Upstash Redis (영구 저장소) 연동
- `lib/kv.ts`: `@vercel/kv` 래퍼 작성. `KV_REST_API_URL` 설정 시 Upstash 사용, 미설정 시 인메모리 fallback
- Vercel Marketplace → Upstash for Redis 통합 생성 (도쿄 리전)
- `.env.local`에 KV 크레덴셜 4개 추가 완료
- 이전까지는 서버 재시작 시 데이터 소실 → 이제 Upstash에 영속 저장

#### 7. 테스트 데이터 시드 API
- `app/api/admin/seed/route.ts` 신규 생성
- 2026-06-01 ~ 2026-07-16 사이 56건 결정적 더미 데이터 생성 (개발 환경 전용)
- Upstash 연동 후 시드 데이터 실제 저장 확인

#### 8. 어드민 인증 시스템
- `lib/auth.ts`: Web Crypto API (HMAC-SHA256) 기반 세션 쿠키 서명/검증 (Edge Runtime 호환)
- `middleware.ts`: `/admin/*`, `/api/admin/*` 전체 보호. 미인증 시 `/admin/login` 리다이렉트

#### 9. GitHub 푸시 및 Vercel 배포 수정
- `bd37232` 커밋 푸시 (23개 파일, 1953줄 추가)
- ESLint 빌드 오류 발견 (`randomItem` 미사용 함수) → `743c93a`에서 수정 후 재푸시
- Vercel 자동 배포 진행 중

---

### 현재 배포 상태

| 항목 | 상태 |
|---|---|
| GitHub 최신 커밋 | `743c93a` |
| Vercel 배포 | 빌드 진행 중 (로컬 빌드 성공 확인) |
| 로컬 KV 연동 | Upstash 연결 완료 |
| Vercel 환경변수 | **미등록** — 아래 TODO 참고 |

---

### 배포 후 즉시 해야 할 것 (필수)

1. **Vercel 대시보드 → Settings → Environment Variables** 에 아래 값 추가:

   ```
   KV_REST_API_URL=https://flexible-muskrat-170919.upstash.io
   KV_REST_API_TOKEN=<.env.local 값 복사>
   KV_REST_API_READ_ONLY_TOKEN=<.env.local 값 복사>
   KV_URL=<.env.local 값 복사>
   ADMIN_PASSWORD=<운영용 비밀번호로 변경>
   ADMIN_SESSION_SECRET=<32자 이상 랜덤 문자열>
   ```

2. 환경변수 추가 후 **Redeploy** 실행 (새 빌드 트리거)

3. `26-hyp-eclub.vercel.app/admin/login` 접속 확인

---

## 앞으로 해야 할 작업 (백로그)

### 🔴 높은 우선순위

- [ ] **Vercel 환경변수 등록** (위 필수 항목)
- [ ] **ADMIN_PASSWORD 운영용으로 변경** (현재 `admin1234` — 보안 취약)
- [ ] **CSV 내보내기** — 예약 목록 탭에 버튼만 있고 기능 미구현

### 🟡 중간 우선순위

- [ ] **카카오/네이버 지도 임베드** — Location 섹션에 실제 지도 삽입
- [ ] **OG 이미지** — SNS 공유용 1200×630 이미지 제작
- [ ] **도메인 연결** — 실제 도메인 구매 후 Vercel 연결
- [ ] **예약 알림** — 예약 완료 시 운영자에게 SMS/카카오 알림 (알리고, 솔라피 API)
- [ ] **예약 목록 페이지네이션** — 예약 수 증가 시 필요

### 🟢 낮은 우선순위 / 보류

- [ ] **Google Sheets 연동** — 서비스 계정 크레덴셜 수령 후 진행. `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SPREADSHEET_ID` 필요
- [ ] **이메일 알림** — SMTP 설정 필요 (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` 등)
- [ ] **후기 섹션 이미지 교체** — 텍스트 후기 → 실제 스크린샷 이미지 (파일 미전달)
- [ ] **영상 mp4 변환** — 현재 `.mov` 파일은 Chrome 호환 이슈 있음
- [ ] **갤러리 사진 순서 최종 확인**
- [ ] **예약 목록 페이지네이션** — 예약 100건 초과 시 필요

---

## 전체 프로젝트 구조 요약

```
app/
  layout.tsx          # Pretendard CDN, SEO 메타, Vercel Analytics
  page.tsx            # 섹션 조립, IntersectionObserver, scrollToBooking
  globals.css         # 디자인 토큰, 캘린더 아이콘 흰색 처리
  admin/
    login/page.tsx    # 관리자 로그인 폼
    page.tsx          # 6탭 어드민 대시보드
  api/
    booking/route.ts  # 공개 예약 API
    admin/
      auth/           # 로그인/로그아웃
      bookings/       # 예약 목록, CRM 업데이트, 취소
      holidays/       # 휴일 관리
      settings/       # 슬롯 수, 예약 가능 기간, 공지
      slots/override/ # 슬롯 수동 마감
      seed/           # 테스트 데이터 (개발 전용)

lib/
  kv.ts     # Upstash KV / 인메모리 fallback 추상화
  auth.ts   # HMAC 세션 서명 (Edge 호환)
  schedule.ts  # 예약 가능 날짜 계산

middleware.ts  # 어드민 라우트 보호

components/
  Hero.tsx / Problem.tsx / Program.tsx
  Pricing.tsx / Location.tsx / BookingForm.tsx
  StickyCtaBar.tsx
```

## 환경변수 현황

| 변수 | 로컬 | Vercel |
|---|---|---|
| KV_REST_API_URL | ✅ | ❌ 미등록 |
| KV_REST_API_TOKEN | ✅ | ❌ 미등록 |
| KV_REST_API_READ_ONLY_TOKEN | ✅ | ❌ 미등록 |
| KV_URL | ✅ | ❌ 미등록 |
| ADMIN_PASSWORD | ✅ (test) | ❌ 미등록 |
| ADMIN_SESSION_SECRET | ✅ (test) | ❌ 미등록 |
| GOOGLE_* | ❌ 크레덴셜 미수령 | ❌ |
| SMTP_* | ❌ 미설정 | ❌ |
