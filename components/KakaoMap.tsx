"use client";

import { useEffect, useRef } from "react";

const LAT = 37.484149;
const LNG = 126.929583;
const LABEL = "하이프트레이닝클럽";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

export default function KakaoMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  useEffect(() => {
    if (!mapKey || !containerRef.current) return;

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${mapKey}&autoload=false`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = containerRef.current;
        if (!container) return;

        const map = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(LAT, LNG),
          level: 3,
          draggable: false,
          scrollwheel: false,
          disableDoubleClick: true,
          disableDoubleClickZoom: true,
        });

        // 커스텀 오버레이 (팀버핏 스타일 마커)
        const content = `
          <div style="
            display:flex; align-items:center; gap:8px;
            background:#0A0A0A; color:#F5F5F5;
            padding:10px 16px; border-radius:999px;
            font-family:'Pretendard Variable',sans-serif;
            font-size:14px; font-weight:700;
            box-shadow:0 4px 16px rgba(0,0,0,0.5);
            pointer-events:none; white-space:nowrap;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#C8FF00"/>
              <path d="M12 6C9.24 6 7 8.24 7 11C7 14.75 12 19 12 19C12 19 17 14.75 17 11C17 8.24 14.76 6 12 6ZM12 12.5C11.17 12.5 10.5 11.83 10.5 11C10.5 10.17 11.17 9.5 12 9.5C12.83 9.5 13.5 10.17 13.5 11C13.5 11.83 12.83 12.5 12 12.5Z" fill="#0A0A0A"/>
            </svg>
            ${LABEL}
          </div>
        `;

        new window.kakao.maps.CustomOverlay({
          map,
          position: new window.kakao.maps.LatLng(LAT, LNG),
          content,
          yAnchor: 1.4,
        });

        // 지도 클릭 시 아무것도 안 함 (외부 이동 차단)
        window.kakao.maps.event.addListener(map, "click", () => {});
      });
    };

    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [mapKey]);

  if (!mapKey) {
    return (
      <div
        className="img-placeholder rounded-2xl h-56 mb-8"
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          [지도: NEXT_PUBLIC_KAKAO_MAP_KEY 설정 후 표시]
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-2xl overflow-hidden mb-8"
      style={{ height: "240px", width: "100%" }}
    />
  );
}
