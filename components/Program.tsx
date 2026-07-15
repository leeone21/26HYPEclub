"use client";

import Image from "next/image";


const GALLERY_ITEMS = [
  { id: 1, src: "/images/gym-01.jpg", alt: "로잉 머신으로 유산소 수업" },
  { id: 2, src: "/images/gym-02.jpg", alt: "수업 브리핑 중인 코치" },
  { id: 3, src: "/images/gym-03.jpg", alt: "데드리프트 자세 교정" },
  { id: 4, src: "/images/gym-04.jpg", alt: "그룹 컨디셔닝 수업" },
  { id: 5, src: "/images/gym-05.jpg", alt: "바벨 벤치프레스" },
];

const TESTIMONIALS = [
  {
    id: 1,
    text: "운동을 늘 어려워했던 제가 건강을 위해 그린짐에서 운동을 시작했는데, 덕분에 운동의 재미를 느꼈습니다! 신림 근처 그룹 PT 중에서도 가격이 합리적인데, 코치님께서 초보도 부담 없이 수준에 맞춰 자세를 꼼꼼히 코칭해주셔서 오로지 운동에만 집중할 수 있었습니다.",
    name: "HAYJIS",
    duration: "네이버 리뷰",
  },
  {
    id: 2,
    text: "작년 11월에 신림으로 이사 온 후 최고로 잘 한 선택은 그린짐에 등록한 것입니다. 등록 한 달 만에 체지방률이 7% 정도 감소하였고, 반년 이상 꾸준히 다니며 몸이 미관상으로도 기능적으로도 개선됨을 느끼고 있습니다.",
    name: "hksaid",
    duration: "네이버 리뷰 · 6개월+",
  },
  {
    id: 3,
    text: "혼자 운동해도 항상 작심삼일이었고 식단도 제대로 못 지켰어요. 그러다 그룹 PT를 시작하게 됐는데, 3개월 동안 총 10kg 감량했고 무엇보다도 건강한 습관이 생겼습니다.",
    name: "김*지",
    duration: "블로그 후기 · 3개월",
  },
];

export default function Program() {
  return (
    <section className="section-padding" style={{ background: "var(--color-bg-surface)" }}>
      <div className="max-w-2xl mx-auto">

        {/* 헤드라인 */}
        <div className="mb-12">
          <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3">Program</p>
          <h2 className="font-heading font-black text-display-md text-text-primary mb-4 text-balance">
            매일 바뀌는 50분.
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed">
            웨이트와 컨디셔닝을 결합한 하이브리드 트레이닝.<br />
            지루할 틈이 없습니다.
          </p>
        </div>

        {/* 시간표 — 팀버핏 스타일 그리드 */}
        <div className="mb-12">
          <div className="mb-6">
            <p className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: "var(--color-brand-accent)" }}>
              Time Table
            </p>
            <h3 className="font-black text-4xl text-text-primary">시간표</h3>
          </div>

          <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--color-border)" }}>
            <table className="w-full border-collapse text-sm" style={{ minWidth: "480px" }}>
              <thead>
                <tr style={{ background: "var(--color-bg-surface-2)" }}>
                  <th
                    className="text-left px-4 py-3 font-semibold text-xs tracking-widest uppercase"
                    style={{ color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)", width: "90px" }}
                  >
                    TIME
                  </th>
                  {["월", "화", "수", "목", "금"].map((d) => (
                    <th
                      key={d}
                      className="text-center px-3 py-3 font-bold text-base"
                      style={{ color: "var(--color-text-primary)", borderBottom: "1px solid var(--color-border)", borderLeft: "1px solid var(--color-border)" }}
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    time: "19:00",
                    classes: ["하이브리드", "웨이트", "하이브리드", "웨이트", "스쿼트X"],
                  },
                  {
                    time: "20:00",
                    classes: ["하이브리드", "웨이트", "하이브리드", "웨이트", "스쿼트X"],
                  },
                  {
                    time: "21:00",
                    classes: ["하이브리드", "웨이트", "하이브리드", "웨이트", null],
                  },
                ].map((row, ri) => (
                  <tr key={row.time} style={{ borderTop: ri === 0 ? undefined : "1px solid var(--color-border)" }}>
                    <td
                      className="px-4 py-4 font-mono font-bold text-sm"
                      style={{ color: "var(--color-text-muted)", background: "var(--color-bg-surface-2)" }}
                    >
                      {row.time}
                    </td>
                    {row.classes.map((cls, ci) => (
                      <td
                        key={ci}
                        className="text-center px-3 py-4"
                        style={{ borderLeft: "1px solid var(--color-border)", background: "var(--color-bg-base)" }}
                      >
                        {cls ? (
                          <span
                            className="inline-block px-3 py-1.5 rounded font-black text-xs tracking-widest uppercase"
                            style={{
                              background:
                                cls === "스쿼트X"
                                  ? "var(--color-brand-accent)"
                                  : cls === "하이브리드"
                                  ? "var(--color-bg-surface-2)"
                                  : "#1e1e1e",
                              color:
                                cls === "스쿼트X"
                                  ? "#0A0A0A"
                                  : "var(--color-text-primary)",
                              border:
                                cls === "스쿼트X"
                                  ? "none"
                                  : "1px solid var(--color-border)",
                            }}
                          >
                            {cls}
                          </span>
                        ) : (
                          <span style={{ color: "var(--color-border)" }}>—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* 금요일 안내 */}
                <tr style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td colSpan={6} className="px-4 py-3 text-xs" style={{ color: "var(--color-text-muted)", background: "var(--color-bg-surface-2)" }}>
                    * 금요일 스쿼트X는 19:00 · 20:00 2회만 운영 / 금요일 21시 없음
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 헬스장 자유이용 블록 */}
        <div
          className="rounded-2xl p-6 mb-12"
          style={{ background: "var(--color-bg-surface-2)", border: "1px solid var(--color-border)" }}
        >
          <p className="font-bold text-text-primary text-lg mb-2">
            그룹수업 + 헬스장, 다 됩니다.
          </p>
          <p className="text-text-secondary text-base leading-relaxed">
            수업 없는 날에도 헬스장은 자유롭게 이용하실 수 있습니다.
          </p>
        </div>

        {/* 갤러리 */}
        <div className="mb-12">
          <h3 className="text-text-primary font-bold text-xl mb-2">이런 분위기입니다</h3>
          <p className="text-text-muted text-sm mb-6">글보다 사진이 설명해줄 거예요</p>
          <div className="grid grid-cols-2 gap-3">
            {/* 첫 번째 사진: 세로로 2칸 차지 */}
            <div className="row-span-2 relative rounded-2xl overflow-hidden" style={{ minHeight: "320px" }}>
              <Image
                src={GALLERY_ITEMS[0].src}
                alt={GALLERY_ITEMS[0].alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            {GALLERY_ITEMS.slice(1).map((item) => (
              <div key={item.id} className="relative rounded-2xl overflow-hidden aspect-square">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 영상 */}
        <div className="mb-12">
          <video
            src="/videos/highlight2.mov"
            controls
            playsInline
            muted
            loop
            className="w-full rounded-2xl"
            style={{ background: "var(--color-bg-surface-2)" }}
          >
            브라우저가 동영상 재생을 지원하지 않습니다.
          </video>
        </div>

        {/* 커뮤니티 블록 */}
        <div
          className="rounded-2xl p-6 mb-12"
          style={{ background: "var(--color-brand-accent-muted)", border: "1px solid var(--color-brand-accent)" }}
        >
          <p className="text-text-primary text-lg leading-relaxed">
            수업만 듣고 가도 됩니다.<br />
            <span className="text-text-secondary">같이 운동하다 보면 자연스럽게 친해지고요.</span>
          </p>
        </div>

        {/* 후기 */}
        <div>
          <h3 className="text-text-primary font-bold text-xl mb-6">다니는 사람들 얘기</h3>
          <div className="space-y-4">
            {TESTIMONIALS.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl"
                style={{ background: "var(--color-bg-surface-2)" }}
              >
                <p className="text-text-primary leading-relaxed mb-3 text-sm">
                  &ldquo;{item.text}&rdquo;
                </p>
                <div className="flex items-center gap-2 text-text-muted text-xs">
                  <span className="font-semibold text-text-primary">{item.name}</span>
                  <span>·</span>
                  <span>{item.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
