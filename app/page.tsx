"use client";

import { useRef, useEffect, useCallback } from "react";
import { track } from "@vercel/analytics";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Program from "@/components/Program";
import Pricing from "@/components/Pricing";
import Location from "@/components/Location";
import BookingForm from "@/components/BookingForm";
import StickyCtaBar from "@/components/StickyCtaBar";

const SECTIONS = ["hero", "problem", "program", "pricing", "location", "booking"] as const;

export default function Home() {
  const bookingRef = useRef<HTMLDivElement>(null);

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

      {/* BookingForm */}
      <div id="section-booking" ref={bookingRef}>
        <BookingForm
          onFormStart={() => track("form_started")}
          onFormSubmit={() => track("form_submitted")}
          onDateSelect={(date) => track("date_selected", { date })}
          onTimeSelect={(date, time) => track("time_selected", { date, time })}
        />
      </div>

      {/* 푸터 */}
      <footer
        className="text-center py-8 px-5 text-text-muted text-xs border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p className="mb-1 text-text-secondary font-medium">하이프트레이닝클럽</p>
        <p className="mb-1">그린짐 신림점 운영</p>
        <p className="mb-1">관악구 남부순환로 180길 6 최강타워 2층</p>
        <p>
          <a href="tel:01081324550" className="hover:text-accent transition-colors">010-8132-4550</a>
        </p>
      </footer>

      {/* 모바일 하단 고정 CTA */}
      <StickyCtaBar onCtaClick={() => scrollToBooking("sticky_bar")} />
    </>
  );
}
