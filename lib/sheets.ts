import { google } from "googleapis";

export async function appendBookingToSheet(record: {
  id: string;
  created_at: string;
  name: string;
  contact: string;
  selected_date: string;
  selected_time: string;
  status: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  referrer: string;
  variant?: string;
}) {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

  if (!email || !key || !spreadsheetId) return;

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const row = [
    record.id,
    record.created_at,
    record.name,
    record.contact,
    record.selected_date,
    record.selected_time,
    record.status,
    record.utm_source,
    record.utm_medium,
    record.utm_campaign,
    record.referrer,
    record.variant ?? "", // L열: 랜딩 버전 (lp2-a/b/c, 메인은 빈칸)
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "2607 랜딩페이지 예약!A:L",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}
