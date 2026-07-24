import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const kv = await getKV();
  const { id } = params;
  const permanent = new URL(request.url).searchParams.get("permanent") === "1";

  try {
    const record = await kv.hgetall(`booking:${id}`);
    if (!record) {
      return NextResponse.json({ success: false, error: "예약을 찾을 수 없습니다." }, { status: 404 });
    }

    const slotKey = `slot:${record.selected_date}:${record.selected_time}`;
    await kv.srem(slotKey, id);

    if (permanent) {
      await kv.lrem(`bookings:by-date:${record.selected_date}`, 0, id);
      await kv.del(`booking:${id}`);
    } else {
      await kv.hset(`booking:${id}`, { status: "cancelled" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN] 예약 삭제 오류:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}

// CRM 필드 업데이트 (참석/등록 여부)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const kv = await getKV();
  const { id } = params;

  try {
    const record = await kv.hgetall(`booking:${id}`);
    if (!record) {
      return NextResponse.json({ success: false, error: "예약을 찾을 수 없습니다." }, { status: 404 });
    }

    const body = await request.json();
    const allowed = ["attended", "outcome", "no_show_reason", "no_show_memo"];
    const updates: Record<string, string> = {};

    for (const key of allowed) {
      if (key in body) updates[key] = String(body[key]);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: "업데이트할 항목이 없습니다." }, { status: 400 });
    }

    await kv.hset(`booking:${id}`, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN] CRM 업데이트 오류:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
