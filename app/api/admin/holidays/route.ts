import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";

export async function GET() {
  const kv = await getKV();
  try {
    const holidays = await kv.smembers("holidays");
    return NextResponse.json({ success: true, holidays: holidays.sort() });
  } catch (error) {
    console.error("[ADMIN] 휴일 조회 오류:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const kv = await getKV();
  try {
    const { dates } = await request.json(); // string[]
    if (!Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json({ success: false, error: "날짜 목록이 필요합니다." }, { status: 400 });
    }
    const valid = dates.filter((d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d));
    if (valid.length > 0) await kv.sadd("holidays", ...valid);
    return NextResponse.json({ success: true, added: valid });
  } catch (error) {
    console.error("[ADMIN] 휴일 추가 오류:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const kv = await getKV();
  try {
    const { dates } = await request.json();
    if (!Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json({ success: false, error: "날짜 목록이 필요합니다." }, { status: 400 });
    }
    await kv.srem("holidays", ...dates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN] 휴일 삭제 오류:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
