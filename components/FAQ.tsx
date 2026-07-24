"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "그린짐 그룹 PT(하이프 트레이닝)이란 어떤 운동인가요?",
    a: "최대 정원 9명, 웨이트와 컨디셔닝을 결합한 그룹 트레이닝입니다. 50분 동안 근력운동과 유산소를 함께 진행하며, 소규모라 트레이너가 한 명 한 명 자세를 봐드립니다.",
  },
  {
    q: "운동 초보자도 따라갈 수 있나요?",
    a: "네, 괜찮습니다. 9명 소규모 수업이라 트레이너가 동작과 자세를 하나씩 봐드리니 처음이어도 부담 없이 따라오실 수 있어요.",
  },
  {
    q: "그룹수업 시간에만 이용할 수 있나요?",
    a: "아니요, 수업 없는 날에도 헬스장은 자유롭게 이용하실 수 있습니다.",
  },
  {
    q: "첫 방문 시 특별한 준비물이 있나요?",
    a: "운동복과 실내화만 챙겨오시면 됩니다.",
  },
  {
    q: "센터 내에 샤워실이 완비되어 있나요?",
    a: "네, 샤워실이 완비되어 있습니다.",
  },
  {
    q: "식단 관리나 관련 조언도 받을 수 있나요?",
    a: "네, 트레이너에게 식단 관련 조언을 받으실 수 있습니다.",
  },
  {
    q: "등록 이후 예약하는 방법은 어떻게 되나요?",
    a: "예약은 전용 앱 '바디코디 회원용'을 통해 가능합니다. 수업은 평일 저녁 7·8·9시, 50분으로 운영되며 월 엔진, 화·목 리프트(웨이트·근력), 수·금 하이브리드X(맞춤형 트레이닝)로 구성됩니다.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="section-padding" style={{ background: "var(--color-bg-surface)" }}>
      <div className="max-w-xl mx-auto">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3">FAQ</p>
        <h2 className="font-heading font-black text-display-md text-text-primary mb-10 text-balance">
          자주 묻는 질문
        </h2>

        <div className="space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl overflow-hidden transition-all"
                style={{
                  border: isOpen
                    ? "1px solid var(--color-brand-accent)"
                    : "1px solid var(--color-border)",
                  background: "var(--color-bg-base)",
                }}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <span
                    className="text-sm font-semibold leading-snug"
                    style={{ color: isOpen ? "var(--color-brand-accent)" : "var(--color-text-primary)" }}
                  >
                    {item.q}
                  </span>
                  <span
                    className="shrink-0 text-lg leading-none transition-transform duration-200"
                    style={{
                      color: "var(--color-text-muted)",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  >
                    +
                  </span>
                </button>

                {isOpen && (
                  <p
                    className="px-5 pb-5 text-sm leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
