/** Meta 픽셀 이벤트 헬퍼. 픽셀 베이스 코드는 app/layout.tsx에 있다. */
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq?: (...args: any[]) => void;
  }
}

export const META_PIXEL_ID = "304381125133023";

type FbqParams = Record<string, string | number | boolean | undefined>;

/** 표준 이벤트(Lead 등)는 track, 그 외는 trackCustom */
export function fbqEvent(eventName: string, params?: FbqParams, standard = true) {
  if (typeof window === "undefined") return;
  window.fbq?.(standard ? "track" : "trackCustom", eventName, params);
}
