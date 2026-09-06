import { NextResponse } from "next/server";
import { getKV } from "@/lib/kv";
import { kstTodayStr, addDaysStr, dayOfWeekStr } from "@/lib/date";

export const dynamic = "force-dynamic";

/** app/lp2(+ a,b,c)가 track-visit에 보내는 variant 값과 일치해야 한다.
 *  "lp2"는 실제 광고(당근 등)가 연결된 기본 랜딩, a/b/c는 A/B 테스트용 변형. */
const LP2_VARIANTS = ["lp2", "lp2-a", "lp2-b", "lp2-c"] as const;

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

  /** prefix("visits" 또는 "visits:variant:lp2-a") 하나에 대한 총/일별 카운트 조회 */
  const readCounts = async (prefix: string) => {
    const keys = [`${prefix}:total`, ...dateList.map((d) => `${prefix}:daily:${d}`)];
    const results = await Promise.all(keys.map((k) => kv.get(k)));
    const dailyMap: Record<string, number> = {};
    dateList.forEach((d, i) => { dailyMap[d] = parseInt(results[i + 1] ?? "0", 10); });
    const sum = (days: string[]) => days.reduce((s, d) => s + (dailyMap[d] ?? 0), 0);
    return {
      total: parseInt(results[0] ?? "0", 10),
      today: dailyMap[today] ?? 0,
      yesterday: dailyMap[yesterday] ?? 0,
      week: sum(weekDays),
      month: sum(monthDays),
      dailyMap,
    };
  };

  // 메인 랜딩 + LP2 변형(A/B/C)을 각각 조회. 변형 방문은 메인 지표에 섞이지 않는다.
  const [main, ...variantCounts] = await Promise.all([
    readCounts("visits"),
    ...LP2_VARIANTS.map((v) => readCounts(`visits:variant:${v}`)),
  ]);

  const trend = last7.map((d) => ({ date: d, count: main.dailyMap[d] ?? 0 }));

  const variants = Object.fromEntries(
    LP2_VARIANTS.map((v, i) => {
      const { total, today: t, week, month } = variantCounts[i];
      return [v, { total, today: t, week, month }];
    })
  );

  // 현황(overview) 탭용 — 메인 랜딩 + LP2 전 변형을 합산한 "전체 유입" 수치.
  // 광고가 /lp2로 연결된 이후엔 메인 단독 수치는 현황 카드로서 의미가 없어 별도로 제공한다.
  const sumAcross = (key: "total" | "today" | "yesterday" | "week" | "month") =>
    main[key] + variantCounts.reduce((s, v) => s + v[key], 0);

  const allSources = {
    total: sumAcross("total"),
    today: sumAcross("today"),
    yesterday: sumAcross("yesterday"),
    week: sumAcross("week"),
    month: sumAcross("month"),
  };

  return NextResponse.json({
    success: true,
    total: main.total,
    today: main.today,
    yesterday: main.yesterday,
    week: main.week,
    month: main.month,
    trend,
    variants,
    allSources,
  });
}
