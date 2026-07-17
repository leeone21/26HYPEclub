import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";

export async function GET(request: NextRequest) {
  const kv = await getKV();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date"); // YYYY-MM-DD

  try {
    let ids: string[] = [];

    if (date) {
      ids = await kv.lrange(`bookings:by-date:${date}`, 0, -1);
    } else {
      // 전체: 날짜 인덱스 키를 모두 스캔
      const dateKeys = await kv.keys("bookings:by-date:*");
      for (const key of dateKeys) {
        const dayIds = await kv.lrange(key, 0, -1);
        ids.push(...dayIds);
      }
    }

    const bookings = await Promise.all(
      ids.map(async (id) => {
        const record = await kv.hgetall(`booking:${id}`);
        return record ? { id, ...record } : null;
      })
    );

    const valid = bookings
      .filter(Boolean)
      .sort((a, b) => {
        const dateA = (a as Record<string, string>).selected_date ?? "";
        const dateB = (b as Record<string, string>).selected_date ?? "";
        return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
      });

    return NextResponse.json({ success: true, bookings: valid });
  } catch (error) {
    console.error("[ADMIN] 예약 목록 조회 오류:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
