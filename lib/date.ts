const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 서버 타임존과 무관하게 KST(UTC+9) 기준 오늘 날짜 문자열(YYYY-MM-DD) */
export function kstTodayStr(): string {
  return new Date(Date.now() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/** YYYY-MM-DD 문자열에 일수를 더해 새 YYYY-MM-DD 문자열 반환 */
export function addDaysStr(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** YYYY-MM-DD 문자열의 요일 반환 (0=일 ... 6=토) */
export function dayOfWeekStr(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}
