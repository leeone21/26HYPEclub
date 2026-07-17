import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";

// POST: 슬롯 수동 마감/재오픈
// body: { date: "YYYY-MM-DD", time: "HH:mm", action: "close" | "open" }
export async function POST(request: NextRequest) {
  const kv = await getKV();
  try {
    const { date, time, action } = await request.json();
    if (!date || !time || !["close", "open"].includes(action)) {
      return NextResponse.json({ success: false, error: "올바른 파라미터가 필요합니다." }, { status: 400 });
    }
    const key = `slot-override:${date}:${time}`;
    if (action === "close") {
      await kv.set(key, "closed");
    } else {
      await kv.del(key);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN] 슬롯 오버라이드 오류:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}

// GET: 특정 날짜의 슬롯 현황 조회
export async function GET(request: NextRequest) {
  const kv = await getKV();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) {
    return NextResponse.json({ success: false, error: "date 파라미터 필요" }, { status: 400 });
  }

  try {
    const times = ["19:00", "20:00", "21:00"];
    const slots = await Promise.all(
      times.map(async (time) => {
        const count = await kv.scard(`slot:${date}:${time}`);
        const override = await kv.get(`slot-override:${date}:${time}`);
        const maxStr = await kv.get("settings:max-per-slot");
        const max = parseInt(maxStr ?? "3", 10);
        return {
          time,
          count,
          max,
          isClosed: override === "closed" || count >= max,
          isManualClose: override === "closed",
        };
      })
    );

    return NextResponse.json({ success: true, date, slots });
  } catch (error) {
    console.error("[ADMIN] 슬롯 현황 조회 오류:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
