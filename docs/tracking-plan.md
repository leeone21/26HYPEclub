# 하이프트레이닝클럽 — Tracking Plan v1.1

Analytics: Vercel Analytics  
Last updated: 2026-07-14  
변경: v1.0 → v1.1 — date_selected, time_selected 이벤트 추가

---

## 추적 이벤트 정의

| 이벤트명 | 트리거 시점 | 속성 | 담당 컴포넌트 |
|---|---|---|---|
| `page_view` | 페이지 최초 로드 | `referrer`, `utm_source`, `utm_medium`, `utm_campaign` | `app/layout.tsx` (Vercel Analytics 자동) |
| `section_reached` | 각 섹션이 뷰포트에 30% 이상 진입 | `section_name`: hero / problem / program / pricing / location / booking | `app/page.tsx` |
| `cta_clicked` | 무료체험 예약 버튼 클릭 | `location`: hero_inline / sticky_bar / pricing_section | `Hero.tsx`, `StickyCtaBar.tsx`, `Pricing.tsx` |
| `form_started` | 예약폼 첫 필드 포커스 또는 날짜 선택 | — | `BookingForm.tsx` |
| `date_selected` | 날짜 칩 선택 | `date`: YYYY-MM-DD | `BookingForm.tsx` |
| `time_selected` | 시간 슬롯 선택 | `date`: YYYY-MM-DD, `time`: HH:mm | `BookingForm.tsx` |
| `form_submitted` | 예약폼 제출 성공 응답 수신 | — | `BookingForm.tsx` |

---

## date_selected / time_selected 수집 목적

수업 편성 최적화를 위한 수요 파악:
- **어떤 날짜가 인기인지** (주초 vs 주말 직전 vs 특정 주)
- **어떤 시간대에 수요가 집중되는지** (19:00 vs 20:00 vs 21:00)
- 폼 제출 완료 여부와 결합하면 "선택했지만 제출하지 않은 시간대"도 파악 가능

활용 예시:
```
time_selected { time: "19:00" } 이벤트가 "21:00" 대비 3배 많으면
→ 19:00 클래스 정원 확대 또는 추가 개설 검토
```

---

## 이벤트 사용 방법

```typescript
import { track } from "@vercel/analytics";

track("date_selected", { date: "2026-07-21" });
track("time_selected", { date: "2026-07-21", time: "19:00" });
```

---

## 전환 퍼널

```
page_view
  └→ section_reached (hero)
       └→ cta_clicked
            └→ form_started
                 └→ date_selected
                      └→ time_selected
                           └→ form_submitted  ← 최종 전환
```

---

## 다음 단계에 필요한 계정/키 목록

| 항목 | 취득 방법 |
|---|---|
| Vercel 프로젝트 연결 | Vercel 대시보드 → 프로젝트 import → Analytics 탭 활성화 |
| Google 서비스 계정 이메일 | Google Cloud Console → IAM & Admin → 서비스 계정 생성 |
| Google 서비스 계정 JSON 키 | 위 서비스 계정 → 키 → JSON 다운로드 |
| Google Spreadsheet ID | 대상 스프레드시트 URL의 `/d/` 이후 값 |
| Gmail 앱 비밀번호 | 구글 계정 → 보안 → 2단계 인증 → 앱 비밀번호 |
