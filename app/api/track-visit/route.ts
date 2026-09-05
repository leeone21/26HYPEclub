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

    // LP2 등 별도 랜딩은 variant를 보낸다. 본 페이지 전환율 지표와 섞이지 않도록
    // 변형별 키에만 집계한다. (본문 없이 호출하는 기존 페이지는 variant 없음)
    const variant = await request
      .json()
      .then((b) => (typeof b?.variant === "string" ? b.variant : null))
      .catch(() => null);

    const kv = await getKV();
    const today = kstTodayStr();
    const prefix = variant ? `visits:variant:${variant}` : "visits";
    await Promise.all([kv.incr(`${prefix}:total`), kv.incr(`${prefix}:daily:${today}`)]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
