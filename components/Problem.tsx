"use client";

const PAIN_POINTS = [
  { text: "헬스장 가도 뭘 해야 할지 모르겠고" },
  { text: "유튜브 따라 해도 맞게 하는 건지 모르겠고" },
  { text: "한 달 끊고 안 간 적, 다들 있으니까요" },
];

export default function Problem() {
  return (
    <section className="section-padding bg-bg-base">
      <div className="max-w-xl mx-auto">
        {/* 헤드라인 */}
        <h2 className="font-heading font-black text-display-md text-text-primary mb-3 text-balance">
          작심삼일, 의지 문제가 아닙니다.
        </h2>
        <p className="text-text-secondary mb-10 text-lg leading-relaxed">
          운동 의지가 없는 게 아니에요. 환경이 문제였던 겁니다.
        </p>

        {/* 페인 포인트 목록 */}
        <ul className="space-y-4 mb-12">
          {PAIN_POINTS.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-4 p-5 rounded-2xl"
              style={{ background: "var(--color-bg-surface)" }}
            >
              <span
                className="text-xs font-black shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "var(--color-bg-surface-2)", color: "var(--color-text-muted)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-text-primary text-base leading-relaxed">{item.text}</span>
            </li>
          ))}
        </ul>

        {/* 전환 카드 */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            background: "var(--color-brand-accent-muted)",
            borderColor: "var(--color-brand-accent)",
          }}
        >
          <p className="font-heading font-black text-text-primary text-xl mb-3">
            예약하고 오면, 운동 끝.
          </p>
          <p className="text-text-secondary text-base leading-relaxed">
            프로그램은 스포츠의학 석사 대표와 트레이닝 전문가 헤드코치가 설계합니다.
            고민 없이 오시면 됩니다.
          </p>
        </div>
      </div>
    </section>
  );
}
