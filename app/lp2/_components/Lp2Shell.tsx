"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { track } from "@vercel/analytics";
import { gtagEvent } from "@/lib/gtag";
import BookingForm from "@/components/BookingForm";
import StickyCtaBar from "@/components/StickyCtaBar";

const LpCtaContext = createContext<(location: string) => void>(() => {});

/** 히어로 안에서 예약폼으로 스크롤시키는 핸들러를 가져온다. */
export function useLpCta() {
  return useContext(LpCtaContext);
}

interface Lp2ShellProps {
  /** 버전 식별자. 모든 이벤트에 함께 기록되어 A/B/C 성과 비교에 쓰인다. */
  variant: string;
  /** 히어로 영역. 버전별로 다른 신뢰 요소를 넣는다. */
  children: ReactNode;
}

/**
 * LP2 공통 껍데기 — 히어로만 버전별로 갈아끼우고
 * 예약폼 / 푸터 / 계측은 전부 동일하게 유지한다.
 */
export default function Lp2Shell({ variant, children }: Lp2ShellProps) {
  const bookingRef = useRef<HTMLDivElement>(null);
  // 예약 완료 후엔 하단 고정 CTA를 숨긴다
  const [bookingCompleted, setBookingCompleted] = useState(false);
  // 예약폼이 화면에 보이는 동안도 숨긴다 — 폼의 제출 버튼과 라임 버튼이 겹쳐 보이는 걸 막는다
  const [formInView, setFormInView] = useState(false);
  useEffect(() => {
    const el = bookingRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setFormInView(entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // LP2 방문은 변형별로 따로 집계 (본 페이지 전환율 지표를 오염시키지 않음)
  useEffect(() => {
    fetch("/api/track-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant }),
    }).catch(() => {});
  }, [variant]);

  const scrollToBooking = (location: string) => {
    track("cta_clicked", { location, variant });
    gtagEvent("cta_click", { cta_location: location, variant });
    bookingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <LpCtaContext.Provider value={scrollToBooking}>{children}</LpCtaContext.Provider>

      <div ref={bookingRef}>
        <BookingForm
          variant={variant}
          onFormStart={() => { track("form_started", { variant }); gtagEvent("form_start", { variant }); }}
          onFormSubmit={() => {
            track("form_submitted", { variant });
            gtagEvent("form_submitted", { variant });
            setBookingCompleted(true);
          }}
          onDateSelect={(date) => track("date_selected", { date, variant })}
          onTimeSelect={(date, time) => track("time_selected", { date, time, variant })}
        />
      </div>

      <footer
        className="text-center pt-8 pb-28 md:pb-8 px-5 text-text-muted text-xs border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p className="mb-1 text-text-secondary font-medium">신림 그린짐 그룹PT</p>
        <p className="mb-1">관악구 남부순환로 180길 6 최강타워 2층</p>
        <p className="mt-3 pt-3 border-t text-text-muted/80" style={{ borderColor: "var(--color-border)" }}>
          상호명: 그린짐 PT · 대표자: 이창원 · 사업자등록번호: 833-05-02854
        </p>
        <p className="mt-1 text-text-muted/80">
          대표자 연락처: <a href="tel:01097502301" className="hover:text-accent transition-colors">010-9750-2301</a>
        </p>
      </footer>

      {/* 모바일 하단 고정 CTA — 페이지에 #hero-cta-trigger가 있을 때만 동작 */}
      <StickyCtaBar
        label="0원 체험 예약하기 →"
        onCtaClick={() => scrollToBooking("sticky_bar")}
        hidden={bookingCompleted || formInView}
      />
    </>
  );
}
