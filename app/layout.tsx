import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "하이프트레이닝클럽 | 신림 그룹PT 무료체험",
  description:
    "신림역 근처 하이브리드 그룹PT — 혼자 하는 운동이 지겨웠다면 함께 하세요. 첫 수업 무료체험 신청 가능.",
  keywords: ["신림 그룹PT", "신림 하이브리드 트레이닝", "신림역 운동 모임", "하이프트레이닝클럽"],
  openGraph: {
    title: "하이프트레이닝클럽 | 신림 그룹PT 무료체험",
    description:
      "신림 지역 20~30대와 함께하는 하이브리드 트레이닝. 첫 수업 무료체험 신청하기.",
    type: "website",
    locale: "ko_KR",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard — 한국어 가독성 최적화 웹폰트 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
