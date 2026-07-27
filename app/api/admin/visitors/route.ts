import { NextResponse } from "next/server";
import { getKV } from "@/lib/kv";

function dateKey(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `visits:daily:${yyyy}-${mm}-${dd}`;
}

function toDateStr(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function GET() {
  const kv = await getKV();
  const today = new Date();

  // 최근 7일 날짜 목록 (오래된 순)
  const last7: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });

  // 이번 달 시작
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  // 이번 주 월요일
  const weekStart = new Date(today);
  const day = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));

  const keys = [
    "visits:total",
    dateKey(today),
    dateKey(new Date(today.getTime() - 86400000)),
    ...last7.map(dateKey),
  ];

  const results = await Promise.all(keys.map((k) => kv.get(k)));

  const [totalRaw, todayRaw, yesterdayRaw, ...last7Raw] = results;

  // 이번 주 합계
  const weekDays: string[] = [];
  for (let d = new Date(weekStart); d <= today; d.setDate(d.getDate() + 1)) {
    weekDays.push(toDateStr(new Date(d)));
  }

  // 이번 달 합계 — 7일 이내 날짜는 이미 가져왔으니 추가 조회
  const monthDays: string[] = [];
  for (let d = new Date(monthStart); d <= today; d.setDate(d.getDate() + 1)) {
    monthDays.push(toDateStr(new Date(d)));
  }
  const extra = monthDays.filter((ds) => !last7.some((d) => toDateStr(d) === ds));
  const extraVals = extra.length > 0
    ? await Promise.all(extra.map((ds) => kv.get(`visits:daily:${ds}`)))
    : [];

  const dailyMap: Record<string, number> = {};
  last7.forEach((d, i) => { dailyMap[toDateStr(d)] = parseInt(last7Raw[i] ?? "0", 10); });
  extra.forEach((ds, i) => { dailyMap[ds] = parseInt(extraVals[i] ?? "0", 10); });

  const weekCount = weekDays.reduce((s, ds) => s + (dailyMap[ds] ?? 0), 0);
  const monthCount = monthDays.reduce((s, ds) => s + (dailyMap[ds] ?? 0), 0);

  const trend = last7.map((d) => ({
    date: toDateStr(d),
    count: dailyMap[toDateStr(d)] ?? 0,
  }));

  return NextResponse.json({
    success: true,
    total: parseInt(totalRaw ?? "0", 10),
    today: parseInt(todayRaw ?? "0", 10),
    yesterday: parseInt(yesterdayRaw ?? "0", 10),
    week: weekCount,
    month: monthCount,
    trend,
  });
}
