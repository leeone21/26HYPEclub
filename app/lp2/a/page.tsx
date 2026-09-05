"use client";

import Image from "next/image";
import Lp2Shell, { useLpCta } from "../_components/Lp2Shell";

/** A안 — 실제 수업 사진으로 "진짜 있는 곳"임을 먼저 증명 */
function HeroA() {
  const scrollToBooking = useLpCta();

  return (
    <section className="relative overflow-hidden">
      {/* 실제 수업 사진 */}
      <div className="absolute inset-0">
        <Image
          src="/images/gym-01.jpg"
          alt="신림 그린짐 그룹PT 수업 현장"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-bg-base" />

      <div className="relative z-10 section-padding pt-20 pb-10 max-w-xl mx-auto">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3">
          신림역 1번 출구 · 도보 1분
        </p>
        <h1
          className="font-heading font-black text-text-primary text-display-lg mb-4 text-balance"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          0원으로 시작하는 그룹PT
        </h1>
        <p className="text-text-primary text-lg font-semibold mb-2">
          첫 1회, 완전 무료체험.
        </p>
        <p className="text-text-secondary text-base mb-8 leading-relaxed">
          와서 직접 해보고 결정하세요. 체험 후 등록 여부는 그때 정하시면 됩니다.
        </p>

        <button
          onClick={() => scrollToBooking("hero_a")}
          className="btn-cta w-full py-4 text-base"
        >
          무료체험 예약하기 →
        </button>
      </div>
    </section>
  );
}

export default function Lp2A() {
  return (
    <Lp2Shell variant="lp2-a">
      <HeroA />
    </Lp2Shell>
  );
}
