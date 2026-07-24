# 하이프트레이닝클럽 랜딩페이지 — 프로젝트 컨텍스트

## 브랜드 룰 (절대 준수)
- **브랜드명**: 하이프트레이닝클럽 (한글 표기 고정, 영문 병기 금지)
- **절대 금지**: 1:1PT 관련 내용 일절 포함 금지
- **그린짐 노출**: 푸터 / 오시는길 섹션에만 최소 노출
- **사실 정보**: 임의 생성 금지. 미확보 항목은 `[플레이스홀더: 항목명]` 형식
- **과장 표현 금지**: '최고의', '1등' 등 근거 없는 표현 금지

## 비즈니스 정보
- **위치**: 관악구 남부순환로 180길 6 최강타워 2층 (그린짐 신림점)
- **지하철**: 2호선 신림역 1번 출구, 도보 1분
- **전화**: 010-8132-4550
- **운영시간**: 평일 저녁 7시·8시·9시 (금요일 9시 없음)
- **가격**: 월 14.8만원 (4주 8회, 헬스장 자유이용 포함)

## 수업 시간표
- 월·수: 하이브리드 (근력+유산소) — 7시/8시/9시
- 화·목: 웨이트 (바디쉐이핑, 근비대) — 7시/8시/9시
- 금: 스쿼드X (맞춤형 트레이닝) — 7시/8시

## 기술 스택
- Next.js 14 App Router + TypeScript + Tailwind CSS
- 포트: localhost:3000
- 디자인: 다크 베이스(`#0A0A0A`) + 라임그린 포인트(`#C8FF00`)
- 폰트: Pretendard Variable (CDN)
- 분석: Vercel Analytics (커스텀 이벤트 7종)

## 파일 구조
```
app/
  layout.tsx       # Pretendard CDN, SEO 메타, Vercel Analytics
  page.tsx         # 섹션 조립, IntersectionObserver, scrollToBooking
  globals.css      # 디자인 토큰(CSS 변수), 전역 타이포그래피
  api/booking/route.ts  # 예약 API (v1.1)

components/
  Hero.tsx         # 풀블리드 배경, 헤드라인 "운동이 즐거워집니다.", 모바일 인라인 CTA
  Problem.tsx      # 페인포인트 3개 (01/02/03), 전환 카드
  Program.tsx      # 시간표 칩, 갤러리(실제사진5장), 영상, 후기(실제3개)
  Pricing.tsx      # 단일 플랜 카드, 14.8만원
  Location.tsx     # 주소, 지하철, 전화, 운영시간
  BookingForm.tsx  # 날짜칩 + 시간슬롯 선택, 예약 폼
  StickyCtaBar.tsx # 모바일 하단 고정 CTA

config/
  schedule.json    # 예약 가능 날짜/시간/공휴일 (코드 수정 없이 관리)

lib/
  schedule.ts      # getAvailableDates(), getTimeSlotsForDate()

public/
  images/          # gym-01.jpg ~ gym-05.jpg (실제 수업 사진 5장)
  videos/          # highlight.mov, highlight2.mov

.claude/agents/
  orchestrator.md  # 프로젝트 오케스트레이터
  design-team.md   # UI/UX 에이전트
  content-team.md  # 카피라이팅 에이전트
  data-team.md     # 애널리틱스/백엔드 에이전트
```

## 완료된 작업
- [x] Next.js 14 프로젝트 초기화
- [x] 디자인 토큰 시스템 (CSS 변수 + Tailwind 매핑)
- [x] 6개 섹션 컴포넌트 (Hero/Problem/Program/Pricing/Location/BookingForm)
- [x] StickyCtaBar (IntersectionObserver 기반)
- [x] 날짜/시간 선택 BookingForm (config/schedule.json 연동)
- [x] 예약 API Route (v1.1, 개발모드 지원)
- [x] Vercel Analytics 이벤트 7종
- [x] 실제 후기 3개 반영 (HAYJIS, hksaid, 김*지)
- [x] 실제 수업 사진 5장 갤러리 적용
- [x] 영상 파일 2개 (highlight.mov, highlight2.mov)
- [x] Pretendard 폰트, 한국어 타이포그래피 가독성 개선

## 남은 작업 (미완료)
- [ ] 후기 섹션: 텍스트 → 실제 리뷰 스크린샷 이미지로 교체 (유저 요청, 파일 미전달)
- [ ] 갤러리 사진 순서/선정 최종 확인
- [ ] 영상 mp4 변환 (현재 .mov, Chrome 호환 이슈)
- [ ] 카카오/네이버 지도 임베드
- [ ] OG 이미지 (1200×630)
- [ ] Google Sheets API 연동 (서비스 계정 크레덴셜 미수령)
- [ ] 이메일 알림 연동 (SMTP 설정 필요)
- [ ] 도메인 설정 및 Vercel 배포
- [ ] .env.local 실제 값 채우기 (.env.local.example 참고)

## 환경변수 (.env.local 필요)
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SPREADSHEET_ID=
NOTIFICATION_EMAIL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```
