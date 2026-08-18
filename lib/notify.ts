import { Resend } from "resend";

export async function sendBookingNotification(record: {
  name: string;
  contact: string;
  selected_date: string;
  selected_time: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_EMAIL;
  if (!apiKey || !to) return;

  const resend = new Resend(apiKey);

  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const day = new Date(record.selected_date + "T00:00:00").getDay();
  const [, m, d] = record.selected_date.split("-");
  const dateStr = `${parseInt(m)}/${parseInt(d)} (${days[day]}) ${record.selected_time}`;

  const { error } = await resend.emails.send({
    from: "신림 그린짐 그룹PT <onboarding@resend.dev>",
    to,
    subject: `[새 예약] ${record.name} · ${dateStr}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:12px;">
        <h2 style="color:#0a0a0a;margin:0 0 16px;">🔔 새 체험 예약이 들어왔어요</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#666;width:80px;">이름</td><td style="padding:8px 0;font-weight:600;">${record.name}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">연락처</td><td style="padding:8px 0;font-weight:600;">${record.contact}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">일시</td><td style="padding:8px 0;font-weight:600;">${dateStr}</td></tr>
        </table>
        <p style="margin-top:20px;font-size:13px;color:#999;">신림 그린짐 그룹PT 예약 시스템</p>
      </div>
    `,
  });

  if (error) throw new Error(JSON.stringify(error));
}
