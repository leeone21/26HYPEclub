"use client";

import { useState } from "react";

interface PricingProps {
  onCtaClick?: () => void;
}

type Tab = "weekly2" | "unlimited";

interface PlanCard {
  months: number;
  sessions?: string;
  total: string;
  originalTotal?: string;
  monthly?: string;
  discount?: string;
  recommended?: boolean;
}

const PLANS: Record<Tab, PlanCard[]> = {
  weekly2: [
    { months: 1, total: "19.8만원" },
    {
      months: 3,
      sessions: "24회",
      total: "53.4만원",
      originalTotal: "59.4만원",
      monthly: "월 17.8만원",
      discount: "10% 할인",
      recommended: true,
    },
    {
      months: 6,
      sessions: "48회",
      total: "88.8만원",
      originalTotal: "118.8만원",
      monthly: "월 14.8만원",
      discount: "25% 할인",
    },
  ],
  unlimited: [
    { months: 1, total: "23.9만원" },
    {
      months: 3,
      total: "59.4만원",
      originalTotal: "71.7만원",
      monthly: "월 19.8만원",
      discount: "17% 할인",
      recommended: true,
    },
    {
      months: 6,
      total: "106.8만원",
      originalTotal: "143.4만원",
      monthly: "월 17.8만원",
      discount: "25% 할인",
    },
  ],
};

const TAB_LABELS: Record<Tab, string> = {
  weekly2: "주2회권",
  unlimited: "무제한권",
};

export default function Pricing({ onCtaClick }: PricingProps) {
  const [activeTab, setActiveTab] = useState<Tab>("weekly2");
  const cards = PLANS[activeTab];

  return (
    <section className="section-padding bg-bg-base">
      <div className="max-w-xl mx-auto">
        {/* 섹션 레이블 */}
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3">Pricing</p>

        {/* 헤드 */}
        <h2 className="font-heading font-black text-display-md text-text-primary mb-4 text-balance">
          가격, 숨기지 않아요
        </h2>
        <p className="text-text-secondary text-base leading-relaxed mb-10">
          1:1 PT 월 8회면 50만원이 넘습니다.<br />
          같은 코칭 설계를, 그룹으로.
        </p>

        {/* 탭 */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-6"
          style={{ background: "var(--color-bg-surface)" }}
        >
          {(["weekly2", "unlimited"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: activeTab === tab ? "var(--color-brand-accent)" : "transparent",
                color: activeTab === tab ? "#0A0A0A" : "var(--color-text-secondary)",
              }}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* 카드 3개 */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {cards.map((card) => (
            <div
              key={card.months}
              className="rounded-2xl p-4 flex flex-col"
              style={{
                background: "var(--color-bg-surface)",
                border: card.recommended
                  ? "2px solid var(--color-brand-accent)"
                  : "1px solid var(--color-border)",
                position: "relative",
              }}
            >
              {card.recommended && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black px-3 py-1 rounded-full whitespace-nowrap"
                  style={{ background: "var(--color-brand-accent)", color: "#0A0A0A" }}
                >
                  추천
                </span>
              )}

              <p className="text-text-secondary text-xs font-semibold mb-1 mt-1">
                {card.months}개월
              </p>
              {card.sessions && (
                <p className="text-text-muted text-xs mb-2">{card.sessions}</p>
              )}

              {/* 월금액 — 메인 강조 */}
              {card.monthly ? (
                <>
                  <p
                    className="font-black leading-none mb-1"
                    style={{
                      fontSize: "clamp(1rem, 4vw, 1.25rem)",
                      color: card.recommended ? "var(--color-brand-accent)" : "var(--color-text-primary)",
                    }}
                  >
                    {card.monthly}
                  </p>
                  <div className="flex items-center gap-1.5 mb-2">
                    {card.originalTotal && (
                      <span className="text-text-muted text-xs line-through">{card.originalTotal}</span>
                    )}
                    <span className="text-text-muted text-xs">총 {card.total}</span>
                  </div>
                </>
              ) : (
                <p
                  className="font-black leading-none mb-2"
                  style={{
                    fontSize: "clamp(1rem, 4vw, 1.25rem)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {card.total}
                </p>
              )}

              {card.discount && (
                <span
                  className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-auto self-start"
                  style={{ background: "rgba(200,255,0,0.15)", color: "var(--color-brand-accent)" }}
                >
                  {card.discount}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* 포함 사항 */}
        <ul className="space-y-3 mb-6">
          {[
            "그룹PT 수업 월 8회(주2회) — 무제한권은 횟수 제한 없음",
            "스포츠의학 석사 대표 + 헤드코치 설계 프로그램",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-text-secondary text-sm">
              <span className="text-accent font-bold shrink-0 mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>

        {/* 당일등록 혜택 예고 */}
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-4 mb-10"
          style={{ background: "rgba(200,255,0,0.07)", border: "1px solid rgba(200,255,0,0.35)" }}
        >
          <span className="text-lg leading-none mt-0.5">🎁</span>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-brand-accent)" }}>
            <span className="font-bold">체험 당일 등록 시 최대 9만원 할인</span> + 헬스장 이용권 무료 등 혜택이 있습니다.<br />
            자세한 내용은 체험 때 안내드려요.
          </p>
        </div>

        {/* 마감 + CTA */}
        <div className="text-center">
          <p className="font-heading font-black text-text-primary text-2xl mb-1">첫 수업은 무료입니다.</p>
          <p className="text-text-secondary text-base mb-5">해보고 결정하세요.</p>
          <button onClick={onCtaClick} className="btn-cta px-8 py-4 text-base">
            1회 무료체험 예약하기 →
          </button>
        </div>
      </div>
    </section>
  );
}
