"use client";

interface HeroProps {
  onCtaClick?: () => void;
}

export default function Hero({ onCtaClick }: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* 배경 영상 */}
      <div className="absolute inset-0">
        <video
          src="/videos/hero.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-bg-base" />

      {/* 콘텐츠 */}
      <div className="relative z-10 section-padding max-w-2xl mx-auto w-full pt-28">
        {/* 서브 태그 */}
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4 animate-fade-in">
          신림 그룹PT · 하이브리드 트레이닝
        </p>

        {/* 브랜드명 */}
        <p className="text-text-secondary text-base mb-3 font-normal">
          하이프트레이닝클럽
        </p>

        {/* 메인 헤드라인 */}
        <h1
          className="font-heading font-black text-text-primary text-display-xl mb-5 text-balance"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          운동이 즐거워집니다.
        </h1>

        {/* 보조 설명 */}
        <p className="text-text-primary text-xl font-semibold mb-3 leading-relaxed">
          같이 하니까, 꾸준해집니다.
        </p>
        <div className="flex flex-wrap gap-2 mb-10">
          {["신림역 하이브리드 그룹PT", "평일 저녁 7·8·9시", "50분"].map((label) => (
            <span
              key={label}
              className="text-sm font-semibold px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
                backdropFilter: "blur(4px)",
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* CTA — 데스크톱 인라인 */}
        <div className="hidden md:flex gap-4 items-center">
          <button onClick={onCtaClick} className="btn-cta px-8 py-4 text-lg">
            1회 무료체험 예약하기 →
          </button>
        </div>

        {/* 모바일 인라인 CTA */}
        <div className="md:hidden">
          <button onClick={onCtaClick} className="btn-cta w-full py-4 text-base">
            1회 무료체험 예약하기 →
          </button>
        </div>
      </div>

      {/* 하단 스크롤 힌트 */}
      <div
        id="hero-cta-trigger"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-text-muted text-xs animate-fade-in"
      >
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-text-muted" />
        scroll
      </div>
    </section>
  );
}
