import { NextRequest, NextResponse } from "next/server";

// 예약 데이터 스키마 v1.1
// v1.0 → v1.1: preferred_time(자유입력) → selected_date + selected_time(구조화)
interface BookingRecord {
  id: string;
  created_at: string;
  version: string;
  name: string;
  contact: string;
  selected_date: string;   // YYYY-MM-DD
  selected_time: string;   // HH:mm (24시간제)
  consent_agreed: boolean;
  consent_agreed_at: string;
  source: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    referrer?: string;
  };
  meta: Record<string, unknown>;
}

function checkEnv() {
  const required = [
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
    "GOOGLE_SPREADSHEET_ID",
    "NOTIFICATION_EMAIL",
  ];
  return required.filter((key) => !process.env[key]);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, contact, selectedDate, selectedTime, consentAgreed } = body;

    // 입력 유효성 검사
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

    // 날짜 형식 기본 검증 (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      return NextResponse.json(
        { success: false, error: "올바른 날짜 형식이 아닙니다." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const record: BookingRecord = {
      id: crypto.randomUUID(),
      created_at: now,
      version: "1.1",
      name: name.trim(),
      contact: contact.trim(),
      selected_date: selectedDate,
      selected_time: selectedTime,
      consent_agreed: consentAgreed,
      consent_agreed_at: now,
      source: {
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        referrer: body.referrer,
      },
      meta: {},
    };

    // ── 환경변수 미설정 시 개발 모드 ──────────────────────
    const missingEnv = checkEnv();
    if (missingEnv.length > 0) {
      console.log("[BOOKING][DEV] 환경변수 미설정:", missingEnv);
      console.log("[BOOKING][DEV] 예약 데이터:", record);
      return NextResponse.json({
        success: true,
        message: "예약이 완료되었습니다. (개발 모드 — 실제 저장/알림 미작동)",
        dev_note: `미설정 환경변수: ${missingEnv.join(", ")}`,
      });
    }

    // ── TODO: Google Sheets 저장 ──────────────────────────
    // await saveToGoogleSheets(record);
    // Sheets 컬럼 순서 (v1.1):
    //   id | created_at | version | name | contact |
    //   selected_date | selected_time |
    //   consent_agreed | consent_agreed_at |
    //   utm_source | utm_medium | utm_campaign | referrer | meta

    // ── TODO: 이메일 알림 ─────────────────────────────────
    // await sendNotificationEmail(record);

    return NextResponse.json({ success: true, message: "예약이 완료되었습니다." });
  } catch (error) {
    console.error("[BOOKING] 처리 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
