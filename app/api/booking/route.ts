import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";
import { appendBookingToSheet } from "@/lib/sheets";

interface BookingRecord {
  id: string;
  created_at: string;
  version: string;
  name: string;
  contact: string;
  selected_date: string;
  selected_time: string;
  consent_agreed: string;
  consent_agreed_at: string;
  status: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  referrer: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, contact, selectedDate, selectedTime, consentAgreed } = body;

    if (!name || !contact || !selectedDate || !selectedTime) {
      return NextResponse.json(
        { success: false, error: "필수 항목이 누락되었습니다." },
        { status: 400 }
      );
    }
    if (!consentAgreed) {
      return NextResponse.json(
        { success: false, error: "개인정보 수집·이용에 동의해주세요." },
        { status: 400 }
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      return NextResponse.json(
        { success: false, error: "올바른 날짜 형식이 아닙니다." },
        { status: 400 }
      );
    }

    const kv = await getKV();

    // 전체 예약 중단 여부 확인
    const paused = await kv.get("settings:booking-paused");
    if (paused === "1") {
      return NextResponse.json(
        { success: false, error: "현재 예약이 일시 중단되었습니다. 잠시 후 다시 시도해주세요." },
        { status: 503 }
      );
    }

    // 휴일 확인
    const isHoliday = await kv.sismember("holidays", selectedDate);
    if (isHoliday) {
      return NextResponse.json(
        { success: false, error: "선택하신 날짜는 예약이 불가합니다." },
        { status: 400 }
      );
    }

    // 슬롯 수동 마감 확인
    const slotOverride = await kv.get(`slot-override:${selectedDate}:${selectedTime}`);
    if (slotOverride === "closed") {
      return NextResponse.json(
        { success: false, error: "선택하신 시간은 마감되었습니다." },
        { status: 409 }
      );
    }

    // 슬롯 정원 확인
    const maxStr = await kv.get("settings:max-per-slot");
    const max = parseInt(maxStr ?? "3", 10);
    const slotKey = `slot:${selectedDate}:${selectedTime}`;
    const currentCount = await kv.scard(slotKey);
    if (currentCount >= max) {
      return NextResponse.json(
        { success: false, error: "선택하신 시간은 마감되었습니다.", code: "SLOT_FULL" },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const record: BookingRecord = {
      id,
      created_at: now,
      version: "1.1",
      name: name.trim(),
      contact: contact.trim(),
      selected_date: selectedDate,
      selected_time: selectedTime,
      consent_agreed: String(consentAgreed),
      consent_agreed_at: now,
      status: "confirmed",
      utm_source: body.utm_source ?? "",
      utm_medium: body.utm_medium ?? "",
      utm_campaign: body.utm_campaign ?? "",
      referrer: body.referrer ?? "",
    };

    // KV에 저장
    await kv.hset(`booking:${id}`, record as unknown as Record<string, string>);
    await kv.sadd(slotKey, id);
    await kv.rpush(`bookings:by-date:${selectedDate}`, id);

    // Google Sheets에 저장 (실패해도 예약은 완료 처리)
    appendBookingToSheet(record).catch((err) =>
      console.error("[SHEETS] 저장 오류:", err)
    );

    return NextResponse.json({ success: true, message: "예약이 완료되었습니다." });
  } catch (error) {
    console.error("[BOOKING] 처리 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
