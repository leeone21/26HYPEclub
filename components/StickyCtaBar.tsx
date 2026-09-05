"use client";

import { useEffect, useState } from "react";

interface StickyCtaBarProps {
  onCtaClick?: () => void;
  hidden?: boolean;
  /** 버튼 문구. 페이지의 메인 CTA와 맞춘다. */
  label?: string;
  /** true면 스크롤과 무관하게 처음부터 떠 있다. 기본은 히어로를 지나야 나타난다. */
  alwaysVisible?: boolean;
  /** true면 데스크톱에서도 노출한다. 기본은 모바일 전용(md:hidden). */
  showOnDesktop?: boolean;
}

export default function StickyCtaBar({
  onCtaClick,
  hidden,
  label = "무료체험 예약하기 →",
  alwaysVisible = false,
  showOnDesktop = false,
}: StickyCtaBarProps) {
  const [visible, setVisible] = useState(alwaysVisible);

  // Hero 섹션을 지나면 표시 (alwaysVisible이면 처음부터 떠 있으므로 관찰하지 않는다)
  useEffect(() => {
    if (alwaysVisible) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.1 }
    );

    const hero = document.getElementById("hero-cta-trigger");
    if (hero) observer.observe(hero);

    return () => observer.disconnect();
  }, [alwaysVisible]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 ${showOnDesktop ? "" : "md:hidden"} transition-transform duration-300 ${
        visible && !hidden ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        className="px-5 py-3 md:py-5 flex justify-center"
        style={{
          background: "linear-gradient(to top, var(--color-bg-base) 85%, transparent)",
        }}
      >
        <button
          onClick={onCtaClick}
          className="btn-cta w-full md:w-auto md:px-16 py-4 text-base font-bold shadow-2xl"
        >
          {label}
        </button>
      </div>
    </div>
  );
}
