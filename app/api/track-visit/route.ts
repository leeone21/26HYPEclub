import { NextResponse } from "next/server";
import { getKV } from "@/lib/kv";

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `visits:daily:${yyyy}-${mm}-${dd}`;
}

export async function POST() {
  try {
    const kv = await getKV();
    await Promise.all([kv.incr("visits:total"), kv.incr(todayKey())]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
