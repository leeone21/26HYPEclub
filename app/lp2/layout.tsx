import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "0원으로 시작하는 그룹PT | 신림 그린짐",
  description: "첫 1회 완전 무료체험. 신림역 1번 출구 도보 1분, 지금 예약하세요.",
  robots: { index: false, follow: false },
};

export default function Lp2Layout({ children }: { children: React.ReactNode }) {
  return children;
}
