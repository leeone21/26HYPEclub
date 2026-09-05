"use client";

import Lp2Shell, { useLpCta } from "../_components/Lp2Shell";

/** 그룹PT 진입장벽 3가지를 정면으로 해소 */
const RELIEF = [
  {
    q: "운동 처음인데 괜찮을까요?",
    a: "수준에 맞춰 코칭합니다. 초보자도 부담 없이 따라올 수 있습니다.",
  },
  {
    q: "따라가지 못하면 어쩌죠?",
    a: "코치가 자세를 하나하나 봐드립니다. 혼자 헤매지 않습니다.",
  },
  {
    q: "체험만 하고 안 해도 되나요?",
    a: "네. 체험 후 등록 여부는 그때 정하시면 됩니다.",
  },
];

/** C안 — 그룹PT 최대 진입장벽(초보 불안)을 먼저 해소 */
function HeroC() {
  const scrollToBooking = useLpCta();

  return (
    <section className="section-padding pt-16 pb-10 max-w-xl mx-auto">
      <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3">
        신림 그룹PT
      </p>
      <h1
        className="font-heading font-black text-text-primary text-display-lg mb-4 text-balance"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        0원으로 시작하는 그룹PT
      </h1>
      <p className="text-text-primary text-lg font-semibold mb-2">
        운동 처음이어도 괜찮습니다.
      </p>
      <p className="text-text-secondary text-base mb-8 leading-relaxed">
        첫 1회는 완전 무료체험. 와서 직접 해보고 결정하세요.
      </p>

      {/* 진입장벽 해소 */}
      <div className="space-y-3 mb-6">
        {RELIEF.map((r) => (
          <div
            key={r.q}
            className="rounded-2xl p-5"
            style={{ background: "var(--color-bg-surface-2)" }}
          >
            <p className="text-text-primary font-semibold text-base mb-1.5">{r.q}</p>
            <p className="text-text-secondary text-sm leading-relaxed">{r.a}</p>
          </div>
        ))}
      </div>

      {/* 근거가 되는 실제 후기 */}
      <div
        className="rounded-2xl p-5 mb-8 border"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p className="text-text-secondary text-sm leading-relaxed mb-3">
          &ldquo;운동을 늘 어려워했던 제가 건강을 위해 그린짐에서 운동을 시작했는데, 덕분에 운동의
          재미를 느꼈습니다! 코치님께서 초보도 부담 없이 수준에 맞춰 자세를 꼼꼼히 코칭해주셔서
          오로지 운동에만 집중할 수 있었습니다.&rdquo;
        </p>
        <p className="text-text-muted text-xs">HAYJIS · 네이버 리뷰</p>
      </div>

      <button
        onClick={() => scrollToBooking("hero_c")}
        className="btn-cta w-full py-4 text-base"
      >
        무료체험 예약하기 →
      </button>
    </section>
  );
}

export default function Lp2C() {
  return (
    <Lp2Shell variant="lp2-c">
      <HeroC />
    </Lp2Shell>
  );
}
