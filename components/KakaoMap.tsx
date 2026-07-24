"use client";

import { useEffect, useRef } from "react";

const ADDRESS = "관악구 남부순환로 180길 6";
const LABEL = "하이프 트레이닝클럽 in 그린짐";

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
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${mapKey}&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = containerRef.current;
        if (!container) return;

        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(ADDRESS, (result: any[], status: string) => {
          if (status !== window.kakao.maps.services.Status.OK || !result[0]) return;

          const lat = parseFloat(result[0].y);
          const lng = parseFloat(result[0].x);
          const position = new window.kakao.maps.LatLng(lat, lng);

          const map = new window.kakao.maps.Map(container, {
            center: position,
            level: 3,
            draggable: false,
            scrollwheel: false,
            disableDoubleClick: true,
            disableDoubleClickZoom: true,
          });

          const content = `
            <div style="pointer-events:none; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5));">
              <svg width="48" height="64" viewBox="0 0 44 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 0C9.85 0 0 9.85 0 22C0 38.5 22 60 22 60C22 60 44 38.5 44 22C44 9.85 34.15 0 22 0Z" fill="#0A0A0A"/>
                <circle cx="22" cy="22" r="10" fill="#C8FF00"/>
              </svg>
            </div>
          `;

          new window.kakao.maps.CustomOverlay({
            map,
            position,
            content,
            yAnchor: 1.0,
          });

          window.kakao.maps.event.addListener(map, "click", () => {});
        });
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
