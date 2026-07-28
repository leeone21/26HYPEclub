import { NextResponse } from "next/server";
import { getKV } from "@/lib/kv";
import { kstTodayStr } from "@/lib/date";

export async function POST() {
  try {
    const kv = await getKV();
    await Promise.all([kv.incr("visits:total"), kv.incr(`visits:daily:${kstTodayStr()}`)]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
