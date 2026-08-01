import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";
import { kstTodayStr } from "@/lib/date";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // 관리자가 로그인된 브라우저에서의 방문은 집계에서 제외
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token && (await verifySession(token))) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const kv = await getKV();
    await Promise.all([kv.incr("visits:total"), kv.incr(`visits:daily:${kstTodayStr()}`)]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
