"use client";

import Lp2Shell, { useLpCta } from "../_components/Lp2Shell";

/** 실제 네이버 리뷰 / 블로그 후기 (Program.tsx와 동일 출처) */
const PROOF = [
  {
    result: "체지방률 7% 감소",
    text: "등록 한 달 만에 체지방률이 7% 정도 감소하였고, 반년 이상 꾸준히 다니며 몸이 미관상으로도 기능적으로도 개선됨을 느끼고 있습니다.",
    name: "hksaid",
    source: "네이버 리뷰 · 6개월+",
  },
  {
    result: "3개월 10kg 감량",
    text: "혼자 운동해도 항상 작심삼일이었고 식단도 제대로 못 지켰어요. 그러다 그룹 PT를 시작하게 됐는데, 3개월 동안 총 10kg 감량했고 무엇보다도 건강한 습관이 생겼습니다.",
    name: "김*지",
    source: "블로그 후기 · 3개월",
  },
];

/** B안 — 실제 후기의 '결과'를 먼저 보여줘 0원 오퍼의 신뢰를 받친다 */
function HeroB() {
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
        첫 1회, 완전 무료체험.
      </p>
      <p className="text-text-secondary text-base mb-8 leading-relaxed">
        와서 직접 해보고 결정하세요. 체험 후 등록 여부는 그때 정하시면 됩니다.
      </p>

      {/* 결과 증명 */}
      <div className="space-y-3 mb-8">
        {PROOF.map((p) => (
          <div
            key={p.name}
            className="rounded-2xl p-5"
            style={{ background: "var(--color-bg-surface-2)" }}
          >
            <p className="text-accent font-heading font-black text-xl mb-2">{p.result}</p>
            <p className="text-text-secondary text-sm leading-relaxed mb-3">
              &ldquo;{p.text}&rdquo;
            </p>
            <p className="text-text-muted text-xs">
              {p.name} · {p.source}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => scrollToBooking("hero_b")}
        className="btn-cta w-full py-4 text-base"
      >
        무료체험 예약하기 →
      </button>
    </section>
  );
}

export default function Lp2B() {
  return (
    <Lp2Shell variant="lp2-b">
      <HeroB />
    </Lp2Shell>
  );
}
