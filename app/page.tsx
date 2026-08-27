"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { track } from "@vercel/analytics";
import { gtagEvent } from "@/lib/gtag";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Program from "@/components/Program";
import Pricing from "@/components/Pricing";
import Location from "@/components/Location";
import FAQ from "@/components/FAQ";
import BookingForm from "@/components/BookingForm";
import StickyCtaBar from "@/components/StickyCtaBar";

const SECTIONS = ["hero", "problem", "program", "pricing", "location", "faq", "booking"] as const;

export default function Home() {
  const bookingRef = useRef<HTMLDivElement>(null);
  const [bookingCompleted, setBookingCompleted] = useState(false);

  // 페이지 방문 카운트
  useEffect(() => {
    fetch("/api/track-visit", { method: "POST" }).catch(() => {});
  }, []);

  // 섹션 진입 애니메이션 + 도달 추적
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach((sectionName) => {
      const el = document.getElementById(`section-${sectionName}`);
      if (!el) return;

      // Hero는 처음부터 보이게
      if (sectionName === "hero") {
        el.classList.add("section-visible");
      } else {
        el.classList.add("section-hidden");
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.classList.remove("section-hidden");
            el.classList.add("section-visible");
            track("section_reached", { section_name: sectionName });
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollToBooking = useCallback((location: string) => {
    track("cta_clicked", { location });
    gtagEvent("cta_click", { cta_location: location });
    bookingRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      {/* Hero */}
      <div id="section-hero">
        {/* Hero 내 CTA 트리거 (StickyCtaBar 표시 기준) */}
        <div id="hero-cta-trigger" className="absolute top-[80vh]" aria-hidden />
        <Hero onCtaClick={() => scrollToBooking("hero_inline")} />
      </div>

      {/* Problem */}
      <div id="section-problem">
        <Problem />
      </div>

      {/* Program */}
      <div id="section-program">
        <Program />
      </div>

      {/* Pricing */}
      <div id="section-pricing">
        <Pricing onCtaClick={() => scrollToBooking("pricing_section")} />
      </div>

      {/* Location */}
      <div id="section-location">
        <Location />
      </div>

      {/* FAQ */}
      <div id="section-faq">
        <FAQ />
      </div>

      {/* BookingForm */}
      <div id="section-booking" ref={bookingRef}>
        <BookingForm
          onFormStart={() => { track("form_started"); gtagEvent("form_start"); }}
          onFormSubmit={() => { track("form_submitted"); gtagEvent("form_submitted"); setBookingCompleted(true); }}
          onDateSelect={(date) => track("date_selected", { date })}
          onTimeSelect={(date, time) => track("time_selected", { date, time })}
        />
      </div>

      {/* 푸터 */}
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

      {/* 모바일 하단 고정 CTA */}
      <StickyCtaBar onCtaClick={() => scrollToBooking("sticky_bar")} hidden={bookingCompleted} />
    </>
  );
}
