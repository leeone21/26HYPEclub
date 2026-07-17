import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";

const DEFAULTS = {
  "max-per-slot": "3",
  "booking-range-days": "14",
  "booking-paused": "0",
  "notice-text": "",
};

export async function GET() {
  const kv = await getKV();
  try {
    const entries = await Promise.all(
      Object.entries(DEFAULTS).map(async ([key, def]) => {
        const val = await kv.get(`settings:${key}`);
        return [key, val ?? def];
      })
    );
    return NextResponse.json({ success: true, settings: Object.fromEntries(entries) });
  } catch (error) {
    console.error("[ADMIN] 설정 조회 오류:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const kv = await getKV();
  try {
    const body = await request.json();
    for (const [key, value] of Object.entries(body)) {
      if (key in DEFAULTS) {
        await kv.set(`settings:${key}`, String(value));
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN] 설정 저장 오류:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
