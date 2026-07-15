"use client";

import KakaoMap from "./KakaoMap";

export default function Location() {
  return (
    <section className="section-padding" style={{ background: "var(--color-bg-surface)" }}>
      <div className="max-w-xl mx-auto">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3">Location</p>
        <h2 className="font-heading font-black text-display-md text-text-primary mb-3 text-balance">
          신림역 1번 출구에서 1분.
        </h2>
        <p className="text-text-secondary text-lg mb-8 leading-relaxed">
          최강타워 2층. 퇴근하고 오기 좋은 거리, 오기 좋은 시간입니다.
        </p>

        <KakaoMap />

        {/* 상세 정보 */}
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{ background: "var(--color-bg-surface-2)" }}
        >
          <div className="flex gap-3">
            <span className="text-accent text-lg shrink-0">📍</span>
            <div>
              <p className="text-text-secondary text-xs mb-1 uppercase tracking-wide">주소</p>
              <p className="text-text-primary font-medium">
                관악구 남부순환로 180길 6 최강타워 2층
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-accent text-lg shrink-0">🚇</span>
            <div>
              <p className="text-text-secondary text-xs mb-1 uppercase tracking-wide">지하철</p>
              <p className="text-text-primary font-medium">
                2호선 신림역 1번 출구, 도보 1분
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-accent text-lg shrink-0">🕐</span>
            <div>
              <p className="text-text-secondary text-xs mb-1 uppercase tracking-wide">수업 시간</p>
              <p className="text-text-primary font-medium">
                평일 저녁 7시 · 8시 · 9시 (금요일 9시 없음)
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-accent text-lg shrink-0">📞</span>
            <div>
              <p className="text-text-secondary text-xs mb-1 uppercase tracking-wide">문의</p>
              <a
                href="tel:01081324550"
                className="text-text-primary font-medium hover:text-accent transition-colors"
              >
                010-8132-4550
              </a>
            </div>
          </div>
        </div>

        {/* 그린짐 표기 (최소 노출) */}
        <p className="text-text-muted text-xs mt-5 text-center">그린짐 신림점 운영</p>
      </div>
    </section>
  );
}
