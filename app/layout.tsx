import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { META_PIXEL_ID } from "@/lib/fbq";

export const metadata: Metadata = {
  metadataBase: new URL("https://26-hyp-eclub.vercel.app"),
  title: "신림 그린짐 PT | 그룹 PT 체험",
  description:
    "신림역 근처 하이브리드 그룹PT — 혼자 하는 운동이 지겨웠다면 함께 하세요. 첫 수업 무료체험 신청 가능.",
  keywords: ["신림 그룹PT", "신림 하이브리드 트레이닝", "신림역 운동 모임", "신림 그린짐 그룹PT"],
  openGraph: {
    title: "신림 그린짐 PT | 그룹 PT 체험",
    description:
      "신림 지역 20~30대와 함께하는 하이브리드 트레이닝. 첫 수업 무료체험 신청하기.",
    type: "website",
    locale: "ko_KR",
    images: [{ url: "/images/og-thumbnail.png", width: 1080, height: 1080 }],
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
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-SWB3HKRDQD"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-SWB3HKRDQD');
        `}} />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "xquqjrutrm");
        `}} />
        {/* Meta 픽셀 — 광고 전환 최적화용. Lead 이벤트는 예약 폼 제출 시 발화 (lib/fbq.ts) */}
        <script dangerouslySetInnerHTML={{ __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}} />
        <noscript>
          <img height="1" width="1" style={{ display: "none" }} alt=""
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} />
        </noscript>
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
