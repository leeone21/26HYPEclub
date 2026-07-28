import { NextResponse } from "next/server";
import { getKV } from "@/lib/kv";
import { kstTodayStr, addDaysStr, dayOfWeekStr } from "@/lib/date";

export async function GET() {
  const kv = await getKV();
  const today = kstTodayStr();
  const yesterday = addDaysStr(today, -1);

  // 최근 7일 날짜 목록 (오래된 순)
  const last7 = Array.from({ length: 7 }, (_, i) => addDaysStr(today, -(6 - i)));

  // 이번 주 월요일
  const dow = dayOfWeekStr(today); // 0=일 ... 6=토
  const weekStart = addDaysStr(today, dow === 0 ? -6 : -(dow - 1));

  // 이번 달 1일
  const monthStart = `${today.slice(0, 7)}-01`;

  const weekDays: string[] = [];
  for (let d = weekStart; d <= today; d = addDaysStr(d, 1)) weekDays.push(d);

  const monthDays: string[] = [];
  for (let d = monthStart; d <= today; d = addDaysStr(d, 1)) monthDays.push(d);

  // 필요한 날짜 전체를 중복 없이 한 번에 조회
  const dateList = Array.from(new Set([today, yesterday, ...last7, ...monthDays]));
  const keys = ["visits:total", ...dateList.map((d) => `visits:daily:${d}`)];
  const results = await Promise.all(keys.map((k) => kv.get(k)));

  const totalRaw = results[0];
  const dailyMap: Record<string, number> = {};
  dateList.forEach((d, i) => { dailyMap[d] = parseInt(results[i + 1] ?? "0", 10); });

  const weekCount = weekDays.reduce((s, d) => s + (dailyMap[d] ?? 0), 0);
  const monthCount = monthDays.reduce((s, d) => s + (dailyMap[d] ?? 0), 0);

  const trend = last7.map((d) => ({ date: d, count: dailyMap[d] ?? 0 }));

  return NextResponse.json({
    success: true,
    total: parseInt(totalRaw ?? "0", 10),
    today: dailyMap[today] ?? 0,
    yesterday: dailyMap[yesterday] ?? 0,
    week: weekCount,
    month: monthCount,
    trend,
  });
}
