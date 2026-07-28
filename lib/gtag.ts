declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
  }
}

type GtagEventParams = Record<string, string | number | boolean | undefined>;

export function gtagEvent(eventName: string, params?: GtagEventParams) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", eventName, params);
}
