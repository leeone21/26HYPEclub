"use client";

import { useEffect, useState } from "react";

interface StickyCtaBarProps {
  onCtaClick?: () => void;
  hidden?: boolean;
}

export default function StickyCtaBar({ onCtaClick, hidden }: StickyCtaBarProps) {
  const [visible, setVisible] = useState(false);

  // Hero 섹션을 지나면 표시
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.1 }
    );

    const hero = document.getElementById("hero-cta-trigger");
    if (hero) observer.observe(hero);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 ${
        visible && !hidden ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        className="px-5 py-3"
        style={{
          background: "linear-gradient(to top, var(--color-bg-base) 85%, transparent)",
        }}
      >
        <button
          onClick={onCtaClick}
          className="btn-cta w-full py-4 text-base font-bold"
        >
          무료체험 예약하기 →
        </button>
      </div>
    </div>
  );
}
