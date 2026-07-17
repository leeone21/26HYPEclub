import { NextResponse } from "next/server";
import { getKV } from "@/lib/kv";

const NAMES = ["김민준", "이서연", "박지호", "최수아", "정현우", "강예린", "윤태양", "임나은", "조성민", "한지원", "오다은", "신재혁", "류미래", "문승현", "배하늘", "노예슬", "구태민", "심소희", "엄준혁", "전가을"];
const CONTACTS = ["010-1234-5678", "010-2345-6789", "010-3456-7890", "010-4567-8901", "010-5678-9012", "010-6789-0123", "010-7890-1234", "010-8901-2345", "010-9012-3456", "010-0123-4567", "010-1111-2222", "010-2222-3333", "010-3333-4444", "010-4444-5555", "010-5555-6666", "010-6666-7777", "010-7777-8888", "010-8888-9999", "010-9999-0000", "010-1357-2468"];
const TIMES = ["19:00", "20:00", "21:00"];
const REASONS = ["가격", "시간대", "거리/위치", "운동 강도", "기타"];

// 월·수: 하이브리드, 화·목: 웨이트, 금: 스쿼트X (금요일은 21:00 없음)
function getTimesForDay(dayOfWeek: number) {
  if (dayOfWeek === 5) return ["19:00", "20:00"];
  if (dayOfWeek === 0 || dayOfWeek === 6) return []; // 주말 없음
  return TIMES;
}

// 결정적 랜덤 (seed 기반)
function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ success: false, error: "프로덕션에서는 사용 불가" }, { status: 403 });
  }

  const kv = await getKV();

  // 6월 1일 ~ 7월 16일
  const bookings: Array<{
    id: string; name: string; contact: string;
    selected_date: string; selected_time: string;
    status: string; created_at: string;
    attended?: string; outcome?: string;
    no_show_reason?: string; no_show_memo?: string;
  }> = [];

  let seed = 42;
  const startDate = new Date("2026-06-01");
  const endDate = new Date("2026-07-16");

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    const times = getTimesForDay(dow);
    if (times.length === 0) continue;

    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    // 날짜당 0~3명 예약
    const count = Math.floor(seededRandom(seed++) * 4);
    for (let i = 0; i < count; i++) {
      const nameIdx = Math.floor(seededRandom(seed++) * NAMES.length);
      const contactIdx = Math.floor(seededRandom(seed++) * CONTACTS.length);
      const timeIdx = Math.floor(seededRandom(seed++) * times.length);
      const isCancelled = seededRandom(seed++) < 0.05; // 5% 취소
      const isAttended = !isCancelled && seededRandom(seed++) < 0.82; // 82% 참석
      const isRegistered = isAttended && seededRandom(seed++) < 0.55; // 55% 등록
      const hasReason = isAttended && !isRegistered && seededRandom(seed++) < 0.7;

      const id = `seed-${dateStr}-${i}`;
      const b = {
        id,
        name: NAMES[nameIdx],
        contact: CONTACTS[contactIdx],
        selected_date: dateStr,
        selected_time: times[timeIdx],
        status: isCancelled ? "cancelled" : "confirmed",
        created_at: new Date(d.getTime() - 86400000 * Math.floor(seededRandom(seed++) * 5 + 1)).toISOString(),
        version: "1.1",
        consent_agreed: "true",
        consent_agreed_at: new Date(d.getTime() - 86400000).toISOString(),
        ...(isAttended ? { attended: "yes" } : isCancelled ? {} : seededRandom(seed++) < 0.3 ? { attended: "no" } : {}),
        ...(isRegistered ? { outcome: "registered" } : isAttended ? { outcome: "not_registered" } : {}),
        ...(hasReason && !isRegistered ? {
          no_show_reason: REASONS[Math.floor(seededRandom(seed++) * REASONS.length)],
        } : {}),
      };
      bookings.push(b);
    }
  }

  // KV에 저장
  for (const b of bookings) {
    const { id, ...fields } = b;
    await kv.hset(`booking:${id}`, fields as Record<string, string>);
    await kv.sadd(`slot:${b.selected_date}:${b.selected_time}`, id);
    await kv.rpush(`bookings:by-date:${b.selected_date}`, id);
  }

  return NextResponse.json({ success: true, inserted: bookings.length });
}

export async function DELETE() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ success: false, error: "프로덕션에서는 사용 불가" }, { status: 403 });
  }
  const kv = await getKV();
  const keys = await kv.keys("booking:seed-*");
  const dateKeys = await kv.keys("bookings:by-date:*");
  for (const k of [...keys, ...dateKeys]) await kv.del(k);
  return NextResponse.json({ success: true, deleted: keys.length });
}
