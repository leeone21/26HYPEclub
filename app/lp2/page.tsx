"use client";

import Image from "next/image";
import Lp2Shell, { useLpCta } from "./_components/Lp2Shell";

/**
 * LP2 — "0원으로 시작하는 그룹PT" 광고 유입용 랜딩.
 * 원칙: 읽을 거 최소, 재밌어 보이는 장면 먼저, 버튼은 항상 손 닿는 곳에.
 * 광고 카피가 첫 화면 헤드라인으로 그대로 이어져 이탈 없이 예약폼까지 내려가게 한다.
 */

const PHOTOS = [
  { src: "/images/gym-02.jpg", alt: "그룹 수업 중 로잉과 줄넘기를 함께 하는 회원들" },
  { src: "/images/gym-03.jpg", alt: "코치가 회원의 데드리프트 자세를 봐주는 모습" },
  { src: "/images/gym-01.jpg", alt: "벤치프레스를 하는 회원" },
];

const FACTS = [
  { big: "0원", small: "첫 1회 체험" },
  { big: "1분", small: "신림역 1번 출구" },
  { big: "7·8·9시", small: "평일 저녁 · 50분" },
];

/** 실제 네이버 리뷰 (Program.tsx와 동일 출처) — 가장 짧고 감정이 드러나는 한 줄만 */
const QUOTES = [
  { text: "덕분에 운동의 재미를 느꼈습니다!", name: "HAYJIS", source: "네이버 리뷰" },
  { text: "무엇보다도 건강한 습관이 생겼습니다.", name: "김*지", source: "블로그 후기" },
];

const HERO_CHIPS = ["평일 저녁 7·8·9시", "50분", "초보 환영"];

function HeroChips() {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {HERO_CHIPS.map((label) => (
        <span
          key={label}
          className="text-sm font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(255,255,255,0.14)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.28)",
            backdropFilter: "blur(4px)",
          }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[100svh] md:min-h-0 md:h-[82vh] md:min-h-[640px] md:max-h-[840px] flex flex-col justify-end md:flex-row-reverse">
      {/* StickyCtaBar가 처음부터 떠 있어 더는 스크롤 트리거로 쓰이지 않지만, 참조 대상이라 유지 */}
      <div id="hero-cta-trigger" className="absolute top-[70vh] md:hidden" aria-hidden />

      {/* 영상 — DOM에 하나만 둔다. 위치만 브레이크포인트별로 바뀐다(모바일: 풀블리드 배경 / 데스크톱: 오른쪽 컬럼) */}
      <div className="absolute inset-0 md:static md:w-[54%]">
        <video
          src="/videos/hero.mp4"
          poster="/images/gym-02.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />
        {/* 모바일: 하단으로 갈수록 어두워져 텍스트와 겹쳐도 읽히게 */}
        <div className="absolute inset-0 md:hidden bg-gradient-to-b from-black/20 via-black/40 to-bg-base" />
        {/* 데스크톱: 왼쪽 텍스트 컬럼과 자연스럽게 이어지도록 */}
        <div
          className="absolute inset-0 hidden md:block"
          style={{ background: "linear-gradient(to right, var(--color-bg-base), transparent 18%)" }}
        />
      </div>

      {/* 텍스트 — 모바일은 영상 위 오버레이, 데스크톱은 왼쪽 컬럼(겹치지 않음) */}
      <div className="relative z-10 section-padding pb-10 pt-24 max-w-xl mx-auto w-full md:mx-0 md:max-w-none md:w-[46%] md:flex md:flex-col md:justify-center md:px-12 lg:px-20 md:py-16">
        <p className="text-accent text-sm font-semibold tracking-widest mb-3 md:mb-4 animate-fade-in">
          신림역 1번 출구 · 도보 1분
        </p>
        <h1
          className="font-heading font-black text-text-primary text-display-xl md:text-display-lg mb-4 md:mb-5 text-balance"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          0원으로 시작하는
          <br className="md:hidden" /> 그룹PT
        </h1>
        <p className="text-text-primary text-lg md:text-xl font-semibold mb-6 md:mb-8">
          첫 1회 무료. 해보고 나서 정하세요.
        </p>
        <HeroChips />
        <p className="text-text-secondary text-sm">
          아래 <span className="text-accent font-semibold">0원 체험 예약하기</span> 버튼을 누르면 바로 예약 폼으로 이동해요.
        </p>
      </div>
    </section>
  );
}

function PhotoStrip() {
  return (
    <section className="pt-8 pb-2">
      <p className="px-5 md:px-12 text-text-secondary text-sm font-medium mb-3 max-w-xl md:max-w-3xl mx-auto w-full">
        이런 분위기예요
      </p>
      <div
        className="flex gap-3 md:gap-4 overflow-x-auto px-5 md:px-12 pb-2 snap-x snap-mandatory md:max-w-3xl md:mx-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {PHOTOS.map((p) => (
          <div
            key={p.src}
            className="relative shrink-0 snap-center rounded-2xl overflow-hidden"
            style={{ width: "min(78vw, 340px)", aspectRatio: "4 / 5" }}
          >
            <Image src={p.src} alt={p.alt} fill sizes="(max-width: 640px) 78vw, 340px" className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}

function Facts() {
  return (
    <section className="px-5 md:px-12 py-6 max-w-xl md:max-w-3xl mx-auto w-full">
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {FACTS.map((f) => (
          <div
            key={f.small}
            className="rounded-2xl px-3 py-5 md:py-8 text-center"
            style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}
          >
            <p className="font-heading font-black text-accent text-2xl md:text-3xl leading-none mb-2 whitespace-nowrap">
              {f.big}
            </p>
            <p className="text-text-secondary text-xs md:text-sm">{f.small}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Quotes() {
  return (
    <section className="px-5 md:px-12 pt-2 pb-5 max-w-xl md:max-w-3xl mx-auto w-full">
      <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
        {QUOTES.map((q) => (
          <div key={q.name} className="rounded-2xl p-5 md:p-6" style={{ background: "var(--color-bg-surface-2)" }}>
            <p className="text-text-primary text-base md:text-lg font-semibold leading-snug mb-2">
              &ldquo;{q.text}&rdquo;
            </p>
            <p className="text-text-muted text-xs">
              {q.name} · {q.source}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaBridge() {
  const scrollToBooking = useLpCta();
  return (
    <section className="px-5 md:px-12 pt-1 pb-6 max-w-xl md:max-w-3xl mx-auto w-full flex">
      <button
        onClick={() => scrollToBooking("bridge")}
        className="btn-cta w-full md:w-auto md:mx-auto md:px-16 py-4 text-base font-bold"
      >
        0원 체험 예약하기 →
      </button>
    </section>
  );
}

export default function Lp2() {
  return (
    <Lp2Shell variant="lp2">
      <Hero />
      <PhotoStrip />
      <Facts />
      <Quotes />
      <CtaBridge />
    </Lp2Shell>
  );
}
