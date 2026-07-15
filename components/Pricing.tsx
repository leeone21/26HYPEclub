"use client";

interface PricingProps {
  onCtaClick?: () => void;
}

export default function Pricing({ onCtaClick }: PricingProps) {
  return (
    <section className="section-padding bg-bg-base">
      <div className="max-w-xl mx-auto">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3">Pricing</p>
        <h2 className="font-heading font-black text-display-md text-text-primary mb-3 text-balance">
          가격, 숨기지 않아요
        </h2>
        <p className="text-text-secondary text-lg mb-10 leading-relaxed">
          처음부터 끝까지 투명하게. 추가 비용 없습니다.
        </p>

        {/* 단일 플랜 카드 */}
        <div
          className="rounded-2xl p-7 mb-10"
          style={{
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-brand-accent)",
          }}
        >
          <span
            className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-5"
            style={{ background: "var(--color-brand-accent)", color: "#0A0A0A" }}
          >
            월정액
          </span>

          {/* 헤드라인 */}
          <p className="text-text-secondary text-sm mb-1">헬스 1개월 + 그룹PT 8회</p>
          <p
            className="font-black leading-none mb-6"
            style={{ fontSize: "clamp(2rem, 8vw, 3.5rem)", color: "var(--color-brand-accent)" }}
          >
            14.8만원
          </p>

          {/* 포함 내용 */}
          <ul className="space-y-3">
            {[
              "그룹PT 수업 월 8회 (주 2회)",
              "수업 외 헬스장 자유이용",
              "스포츠의학 석사 대표 + 헤드코치 설계 프로그램",
              "추가 비용 없음",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-text-secondary text-sm">
                <span className="text-accent font-bold shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* 무료체험 유도 */}
        <div className="text-center">
          <p className="text-text-secondary mb-5">첫 수업은 무료입니다.</p>
          <button onClick={onCtaClick} className="btn-cta px-8 py-4 text-base">
            1회 무료체험 예약하기 →
          </button>
        </div>
      </div>
    </section>
  );
}
