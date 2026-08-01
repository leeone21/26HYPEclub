"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Booking {
  id: string;
  name: string;
  contact: string;
  selected_date: string;
  selected_time: string;
  status: string;
  created_at: string;
  attended?: string;
  outcome?: string;
  no_show_reason?: string;
  no_show_memo?: string;
}

interface Settings {
  "max-per-slot": string;
  "booking-range-days": string;
  "booking-paused": string;
  "notice-text": string;
}

type Tab = "overview" | "bookings" | "stats" | "slots" | "holidays" | "settings";

const NO_SHOW_REASONS = ["가격", "시간대", "거리/위치", "운동 강도", "기타"];

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const [, m, d] = dateStr.split("-");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const day = new Date(dateStr + "T00:00:00").getDay();
  return `${parseInt(m)}/${parseInt(d)} (${days[day]})`;
}

function maskContact(contact: string) {
  return contact;
}

const BUSINESS_ADDRESS = "관악구 남부순환로 180길 6 최강타워 2층 (신림역 1번 출구, 도보 1분)";

function buildConfirmMessage(b: { name: string; selected_date: string; selected_time: string }) {
  return `안녕하세요! ${b.name}님, 신림 그린짐 PT 입니다.
그룹 PT 무료체험 예약이 확정됐어요 🙌

📅 일시: ${formatDate(b.selected_date)} ${b.selected_time}
📍 장소: ${BUSINESS_ADDRESS}
👟 준비물: 실내에서 신으실 운동화, 운동복

문의사항 있으시면 편하게 연락주세요.`;
}

function formatKoreanDateTime(dateStr: string, timeStr: string) {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const [, mm, dd] = dateStr.split("-");
  const dow = new Date(dateStr + "T00:00:00").getDay();
  const [hh, min] = timeStr.split(":");
  return `${mm}월 ${dd}일 ${days[dow]}요일 ${hh}시 ${min}분`;
}

function buildReminderMessage(b: { selected_date: string; selected_time: string }) {
  return `회원님 안녕하세요!
신림 그린짐 PT 입니다~^^
${formatKoreanDateTime(b.selected_date, b.selected_time)} 무료체험 수업이 있으십니다.

실내에서 신으실 운동화, 운동복만 지참 부탁드리며, 시작 5~10분정도 전에 오시면 간단히 센터 소개 및 몸풀기 운동 도와 드리겠습니다 :)

운동 후 피드백 사항 있으시다면 상담 진행시 전달 주시면 감사드리겠습니다^^

혹시 참석 전 변경사항 혹은 문의사항 있으시면 연락부탁드립니다.
그럼 곧 뵙겠습니다! 감사합니다!🤗🤗`;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // 클립보드 API 미지원/권한 없는 환경 대비 fallback
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function CopyButton({ label, getText }: { label: string; getText: () => string }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    await copyToClipboard(getText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleClick}
      className="text-xs px-2 py-1 rounded-md border font-medium transition-colors shrink-0"
      style={{
        borderColor: copied ? "var(--color-brand-accent)" : "var(--color-border)",
        color: copied ? "var(--color-brand-accent)" : "var(--color-text-muted)",
        background: "transparent",
      }}
    >
      {copied ? "복사됨 ✓" : label}
    </button>
  );
}

function formatRelativeTime(iso: string) {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "";
  const diffMin = Math.floor((Date.now() - t) / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${Math.floor(diffHour / 24)}일 전`;
}

function getWeekDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

function toLocalDateStr(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ─── 인라인 CRM 컨트롤 ────────────────────────────────────────────
function CrmRow({ booking, onUpdate }: { booking: Booking; onUpdate: (id: string, fields: Record<string, string>) => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [showMemo, setShowMemo] = useState(booking.no_show_reason === "기타");

  const update = async (fields: Record<string, string>) => {
    setSaving(true);
    await onUpdate(booking.id, fields);
    setSaving(false);
  };

  const toggleAttended = async (val: "yes" | "no") => {
    const newVal = booking.attended === val ? "" : val;
    const extra: Record<string, string> = { attended: newVal };
    if (newVal === "no") { extra.outcome = ""; extra.no_show_reason = ""; extra.no_show_memo = ""; }
    await update(extra);
  };

  const toggleOutcome = async (val: "registered" | "not_registered") => {
    const newVal = booking.outcome === val ? "" : val;
    const extra: Record<string, string> = { outcome: newVal };
    if (newVal !== "not_registered") { extra.no_show_reason = ""; extra.no_show_memo = ""; }
    await update(extra);
  };

  const btnBase = "px-2.5 py-1 rounded-md text-xs font-medium border transition-all";

  const attendedBtn = (val: "yes" | "no", label: string, activeColor: string, activeBg: string) => {
    const isActive = booking.attended === val;
    return (
      <button
        onClick={() => toggleAttended(val)}
        disabled={saving}
        className={btnBase}
        style={{
          background: isActive ? activeBg : "transparent",
          borderColor: isActive ? activeColor : "var(--color-border)",
          color: isActive ? activeColor : "var(--color-text-muted)",
        }}
      >
        {label}
      </button>
    );
  };

  const outcomeBtn = (val: "registered" | "not_registered", label: string, activeColor: string, activeBg: string) => {
    const isActive = booking.outcome === val;
    const disabled = booking.attended !== "yes";
    return (
      <button
        onClick={() => !disabled && toggleOutcome(val)}
        disabled={saving || disabled}
        className={btnBase}
        style={{
          background: isActive ? activeBg : "transparent",
          borderColor: isActive ? activeColor : "var(--color-border)",
          color: isActive ? activeColor : disabled ? "var(--color-text-muted)" : "var(--color-text-secondary)",
          opacity: disabled ? 0.35 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <tr>
      <td colSpan={8} style={{ background: "var(--color-bg-surface)", padding: "10px 16px 10px 44px", borderBottom: "1px solid var(--color-border)" }}>
        <div className="flex items-center gap-4 flex-wrap">
          {/* 참석 여부 */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs" style={{ color: "var(--color-text-muted)", minWidth: 48 }}>참석</span>
            {attendedBtn("yes", "참석", "var(--color-brand-accent)", "rgba(200,255,0,0.12)")}
            {attendedBtn("no", "미참석", "#ff6464", "rgba(255,100,100,0.12)")}
          </div>

          <div style={{ width: 1, height: 20, background: "var(--color-border)" }} />

          {/* 등록 여부 */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs" style={{ color: "var(--color-text-muted)", minWidth: 48 }}>등록</span>
            {outcomeBtn("registered", "등록", "var(--color-brand-accent)", "rgba(200,255,0,0.12)")}
            {outcomeBtn("not_registered", "비등록", "#ff9f43", "rgba(255,159,67,0.12)")}
          </div>

          {/* 비등록 사유 */}
          {booking.outcome === "not_registered" && (
            <>
              <div style={{ width: 1, height: 20, background: "var(--color-border)" }} />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs" style={{ color: "var(--color-text-muted)", minWidth: 32 }}>사유</span>
                {NO_SHOW_REASONS.map((r) => {
                  const isActive = booking.no_show_reason === r;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        setShowMemo(r === "기타");
                        update({ no_show_reason: isActive ? "" : r, no_show_memo: "" });
                      }}
                      disabled={saving}
                      className={btnBase}
                      style={{
                        background: isActive ? "rgba(255,159,67,0.12)" : "transparent",
                        borderColor: isActive ? "#ff9f43" : "var(--color-border)",
                        color: isActive ? "#ff9f43" : "var(--color-text-secondary)",
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
                {(showMemo || booking.no_show_reason === "기타") && (
                  <input
                    type="text"
                    defaultValue={booking.no_show_memo ?? ""}
                    placeholder="기타 사유 입력"
                    onBlur={(e) => update({ no_show_memo: e.target.value })}
                    className="rounded-md px-2.5 py-1 text-xs border outline-none"
                    style={{
                      background: "var(--color-bg-base)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-primary)",
                      width: 140,
                    }}
                  />
                )}
              </div>
            </>
          )}

          {saving && <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>저장 중...</span>}
        </div>
      </td>
    </tr>
  );
}

type PeriodKey = "week" | "month" | "quarter" | "year" | "all";

function getPeriodRange(key: PeriodKey): { start: string; end: string } | null {
  if (key === "all") return null;
  const today = new Date();
  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };
  if (key === "week") {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: fmt(start), end: fmt(end) };
  }
  if (key === "month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { start: fmt(start), end: fmt(end) };
  }
  if (key === "quarter") {
    const start = new Date(today);
    start.setMonth(today.getMonth() - 2, 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { start: fmt(start), end: fmt(end) };
  }
  if (key === "year") {
    return { start: `${today.getFullYear()}-01-01`, end: `${today.getFullYear()}-12-31` };
  }
  return null;
}

// ─── 방문자 탭 ────────────────────────────────────────────────────
type VisitorData = { today: number; yesterday: number; total: number; week: number; month: number; trend: { date: string; count: number }[] } | null;

function VisitorsTab({ visitors, todayBookings }: { visitors: VisitorData; todayBookings: number }) {
  if (!visitors) return <p className="text-sm py-8 text-center" style={{ color: "var(--color-text-muted)" }}>불러오는 중...</p>;

  const { today, yesterday, total, week, month, trend } = visitors;
  const maxTrend = Math.max(...trend.map((t) => t.count), 1);
  const convRate = today > 0 && todayBookings > 0 ? Math.round((todayBookings / today) * 100) : null;
  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

  const card = (label: string, value: string | number, sub?: string, accent?: boolean) => (
    <div className="p-5 rounded-2xl" style={{ background: "var(--color-bg-surface)", border: `1px solid ${accent ? "rgba(200,255,0,0.3)" : "var(--color-border)"}` }}>
      <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>{label}</p>
      <p className="font-heading font-black text-3xl" style={{ color: accent ? "var(--color-brand-accent)" : "var(--color-text-primary)" }}>
        {value}
        {typeof value === "number" && <span className="text-base font-normal ml-1" style={{ color: "var(--color-text-muted)" }}>명</span>}
      </p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {card("오늘 방문자", today, yesterday > 0 ? `어제 ${yesterday}명` : "어제 0명", true)}
        {card("이번 주", week, "월~오늘 합계")}
        {card("이번 달", month, new Date().getMonth() + 1 + "월 누적")}
        {card("누적 방문자", total, "서비스 시작 이후")}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 최근 7일 트렌드 */}
        <div className="p-5 rounded-2xl space-y-4" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>최근 7일 방문 추이</h3>
          <div className="flex items-end gap-1.5" style={{ height: 80 }}>
            {trend.map((t, i) => {
              const isToday = i === trend.length - 1;
              const h = Math.max(Math.round((t.count / maxTrend) * 72), t.count > 0 ? 4 : 0);
              const dow = new Date(t.date + "T00:00:00").getDay();
              return (
                <div key={t.date} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
                  {t.count > 0 && (
                    <span className="text-xs" style={{ color: isToday ? "var(--color-brand-accent)" : "var(--color-text-muted)", fontVariantNumeric: "tabular-nums" }}>
                      {t.count}
                    </span>
                  )}
                  <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                    <div
                      style={{
                        width: "100%",
                        height: h,
                        background: isToday ? "var(--color-brand-accent)" : "rgba(200,255,0,0.3)",
                        borderRadius: "3px 3px 0 0",
                        minHeight: t.count > 0 ? 4 : 0,
                      }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{dayLabels[dow]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 전환 지표 */}
        <div className="p-5 rounded-2xl space-y-4" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>방문 → 예약 전환</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>오늘 방문자</span>
                <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)", fontVariantNumeric: "tabular-nums" }}>{today}명</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "var(--color-bg-base)" }}>
                <div className="h-2 rounded-full" style={{ width: "100%", background: "#333" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>오늘 예약</span>
                <span className="text-sm font-semibold" style={{ color: "var(--color-brand-accent)", fontVariantNumeric: "tabular-nums" }}>{todayBookings}명</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "var(--color-bg-base)" }}>
                <div
                  className="h-2 rounded-full"
                  style={{ width: today > 0 ? `${Math.min(Math.round((todayBookings / today) * 100), 100)}%` : "0%", background: "var(--color-brand-accent)" }}
                />
              </div>
            </div>
            <div className="pt-2" style={{ borderTop: "1px solid var(--color-border)" }}>
              <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>오늘 전환율</p>
              <p className="font-heading font-black text-3xl" style={{ color: convRate !== null ? "var(--color-brand-accent)" : "var(--color-text-muted)" }}>
                {convRate !== null ? `${convRate}%` : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 통계 탭 ──────────────────────────────────────────────────────
function StatsTab({ bookings }: { bookings: Booking[] }) {
  const [period, setPeriod] = useState<PeriodKey>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const PERIODS: { key: PeriodKey; label: string }[] = [
    { key: "week", label: "이번 주" },
    { key: "month", label: "이번 달" },
    { key: "quarter", label: "3개월" },
    { key: "year", label: "올해" },
    { key: "all", label: "전체" },
  ];

  const range = showCustom && customStart && customEnd
    ? { start: customStart, end: customEnd }
    : getPeriodRange(period);

  const filtered = bookings.filter((b) => {
    if (!range) return true;
    return b.selected_date >= range.start && b.selected_date <= range.end;
  });

  const confirmed = filtered.filter((b) => b.status !== "cancelled");
  const total = confirmed.length;
  const attended = confirmed.filter((b) => b.attended === "yes").length;
  const notAttended = confirmed.filter((b) => b.attended === "no").length;
  const pending = total - attended - notAttended;
  const registered = confirmed.filter((b) => b.outcome === "registered").length;
  const notRegistered = confirmed.filter((b) => b.outcome === "not_registered").length;

  const attendRate = total > 0 ? Math.round((attended / total) * 100) : 0;
  const convRate = attended > 0 ? Math.round((registered / attended) * 100) : 0;
  const totalConvRate = total > 0 ? Math.round((registered / total) * 100) : 0;

  // 비등록 사유 집계
  const reasonCounts: Record<string, number> = {};
  confirmed
    .filter((b) => b.outcome === "not_registered" && b.no_show_reason)
    .forEach((b) => {
      const r = b.no_show_reason!;
      reasonCounts[r] = (reasonCounts[r] ?? 0) + 1;
    });
  const reasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);

  const card = (label: string, value: string | number, sub?: string, accent?: boolean) => (
    <div
      className="p-5 rounded-2xl"
      style={{
        background: "var(--color-bg-surface)",
        border: `1px solid ${accent ? "rgba(200,255,0,0.3)" : "var(--color-border)"}`,
      }}
    >
      <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>{label}</p>
      <p className="font-heading font-black text-3xl" style={{ color: accent ? "var(--color-brand-accent)" : "var(--color-text-primary)" }}>
        {value}
        {typeof value === "number" && <span className="text-base font-normal ml-1" style={{ color: "var(--color-text-muted)" }}>명</span>}
      </p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{sub}</p>}
    </div>
  );

  const bar = (label: string, count: number, max: number, color: string) => (
    <div className="flex items-center gap-3">
      <span className="text-sm w-20 shrink-0" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      <div className="flex-1 h-2 rounded-full" style={{ background: "var(--color-bg-base)" }}>
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: max > 0 ? `${Math.round((count / max) * 100)}%` : "0%", background: color }}
        />
      </div>
      <span className="text-sm font-medium w-6 text-right" style={{ color: "var(--color-text-primary)", fontVariantNumeric: "tabular-nums" }}>{count}</span>
    </div>
  );

  // 전환 퍼널
  const funnelSteps = [
    { label: "전체 예약", count: total, color: "var(--color-text-muted)" },
    { label: "체험 참석", count: attended, color: "var(--color-brand-accent)" },
    { label: "등록 완료", count: registered, color: "var(--color-brand-accent)" },
  ];

  return (
    <div className="space-y-6">
      {/* 기간 필터 */}
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap items-center">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setPeriod(key); setShowCustom(false); }}
              className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
              style={{
                background: !showCustom && period === key ? "var(--color-brand-accent)" : "transparent",
                borderColor: !showCustom && period === key ? "var(--color-brand-accent)" : "var(--color-border)",
                color: !showCustom && period === key ? "#0A0A0A" : "var(--color-text-secondary)",
              }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setShowCustom((v) => !v)}
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
            style={{
              background: showCustom ? "var(--color-brand-accent)" : "transparent",
              borderColor: showCustom ? "var(--color-brand-accent)" : "var(--color-border)",
              color: showCustom ? "#0A0A0A" : "var(--color-text-secondary)",
            }}
          >
            기간 설정
          </button>
        </div>
        {showCustom && (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm border outline-none"
              style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
            />
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>~</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm border outline-none"
              style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
            />
          </div>
        )}
      </div>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {card("전체 예약", total)}
        {card("체험 참석", attended, `참석률 ${attendRate}%`)}
        {card("등록 완료", registered, `참석 후 전환율 ${convRate}%`, true)}
        {card("최종 전환율", `${totalConvRate}%`, `예약 → 등록`, registered > 0)}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 퍼널 */}
        <div
          className="p-5 rounded-2xl space-y-4"
          style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}
        >
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>전환 퍼널</h3>
          <div className="space-y-3">
            {funnelSteps.map((step, i) => (
              <div key={step.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{step.label}</span>
                  <span className="text-sm font-semibold" style={{ color: step.color, fontVariantNumeric: "tabular-nums" }}>{step.count}명</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "var(--color-bg-base)" }}>
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: total > 0 ? `${Math.round((step.count / total) * 100)}%` : "0%",
                      background: i === 0 ? "#333" : i === 1 ? "rgba(200,255,0,0.5)" : "var(--color-brand-accent)",
                    }}
                  />
                </div>
                {i < funnelSteps.length - 1 && (
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                    ↓ {funnelSteps[i + 1].count > 0 && step.count > 0
                      ? `${Math.round((funnelSteps[i + 1].count / step.count) * 100)}% 진행`
                      : "데이터 없음"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 비등록 사유 */}
        <div
          className="p-5 rounded-2xl space-y-4"
          style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>비등록 사유</h3>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>총 {notRegistered}명</span>
          </div>
          {reasons.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>데이터 없음</p>
          ) : (
            <div className="space-y-3">
              {reasons.map(([r, c]) => bar(r, c, notRegistered, "#ff9f43"))}
            </div>
          )}
        </div>
      </div>

      {/* 상태 미분류 안내 */}
      {pending > 0 && (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{ background: "rgba(200,255,0,0.06)", border: "1px solid rgba(200,255,0,0.2)", color: "var(--color-text-secondary)" }}
        >
          아직 참석 여부가 미입력된 예약이 <span style={{ color: "var(--color-brand-accent)", fontWeight: 600 }}>{pending}건</span> 있습니다. 예약 목록에서 업데이트해주세요.
        </div>
      )}
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingPeriod, setBookingPeriod] = useState<"today" | "week" | "month" | "range">("today");
  const [bookingRangeStart, setBookingRangeStart] = useState("");
  const [bookingRangeEnd, setBookingRangeEnd] = useState("");
  const [search, setSearch] = useState("");
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [settings, setSettings] = useState<Settings>({
    "max-per-slot": "3",
    "booking-range-days": "14",
    "booking-paused": "0",
    "notice-text": "",
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  const [holidays, setHolidays] = useState<string[]>([]);
  const [newHoliday, setNewHoliday] = useState(toLocalDateStr(new Date()));
  const [holidayMsg, setHolidayMsg] = useState("");

  const [slotDate, setSlotDate] = useState(toLocalDateStr(new Date()));
  const [slotData, setSlotData] = useState<{ time: string; count: number; max: number; isClosed: boolean; isManualClose: boolean }[]>([]);
  const [slotBookings, setSlotBookings] = useState<Booking[]>([]);

  const [todayCount, setTodayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const [monthConvRate, setMonthConvRate] = useState<number | null>(null);
  const [visitors, setVisitors] = useState<{ today: number; yesterday: number; total: number; week: number; month: number; trend: { date: string; count: number }[] } | null>(null);
  const [statsSubTab, setStatsSubTab] = useState<"visitors" | "bookings">("visitors");

  // ── 수동 예약 추가 모달 ───────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", contact: "", date: toLocalDateStr(new Date()), time: "19:00" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // ── 전체 예약 (통계용) ────────────────────────────────────────
  const [allBookings, setAllBookings] = useState<Booking[]>([]);

  const getBookingDateRange = useCallback((): { start: string; end: string } | null => {
    const today = toLocalDateStr(new Date());
    if (bookingPeriod === "today") return { start: today, end: today };
    if (bookingPeriod === "week") {
      const d = new Date();
      const mon = new Date(d);
      mon.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1));
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      return { start: toLocalDateStr(mon), end: toLocalDateStr(sun) };
    }
    if (bookingPeriod === "month") {
      const d = new Date();
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return { start: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`, end: toLocalDateStr(lastDay) };
    }
    if (bookingPeriod === "range" && bookingRangeStart && bookingRangeEnd) {
      return { start: bookingRangeStart, end: bookingRangeEnd };
    }
    return null;
  }, [bookingPeriod, bookingRangeStart, bookingRangeEnd]);

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    const res = await fetch("/api/admin/bookings");
    const data = await res.json();
    if (data.success) setBookings(data.bookings);
    setBookingsLoading(false);
  }, []);

  const loadAllBookings = useCallback(async () => {
    const [bookRes, visRes] = await Promise.all([
      fetch("/api/admin/bookings"),
      fetch("/api/admin/visitors"),
    ]);
    const [bookData, visData] = await Promise.all([bookRes.json(), visRes.json()]);
    if (bookData.success) setAllBookings(bookData.bookings);
    if (visData.success) setVisitors(visData);
  }, []);

  const loadSettings = useCallback(async () => {
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    if (data.success) setSettings(data.settings);
  }, []);

  const loadHolidays = useCallback(async () => {
    const res = await fetch("/api/admin/holidays");
    const data = await res.json();
    if (data.success) setHolidays(data.holidays);
  }, []);

  const loadSlots = useCallback(async () => {
    const [overrideRes, bookingsRes] = await Promise.all([
      fetch(`/api/admin/slots/override?date=${slotDate}`),
      fetch(`/api/admin/bookings?date=${slotDate}`),
    ]);
    const [overrideData, bookingsData] = await Promise.all([overrideRes.json(), bookingsRes.json()]);
    if (overrideData.success) setSlotData(overrideData.slots);
    if (bookingsData.success) setSlotBookings(bookingsData.bookings);
  }, [slotDate]);

  const loadOverview = useCallback(async () => {
    const today = toLocalDateStr(new Date());
    const d = new Date();
    const monthStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    const [todayRes, allRes, visitorsRes] = await Promise.all([
      fetch(`/api/admin/bookings?date=${today}`),
      fetch("/api/admin/bookings"),
      fetch("/api/admin/visitors"),
    ]);
    const [todayData, allData, visitorsData] = await Promise.all([todayRes.json(), allRes.json(), visitorsRes.json()]);
    if (todayData.success) setTodayCount(todayData.bookings.filter((b: Booking) => b.status !== "cancelled").length);
    if (allData.success) {
      const weekDates = new Set(getWeekDates());
      const all: Booking[] = allData.bookings;
      setWeekCount(all.filter((b) => weekDates.has(b.selected_date) && b.status !== "cancelled").length);
      setAllBookings(all);
      const monthConfirmed = all.filter((b) => b.status !== "cancelled" && b.selected_date >= monthStart && b.selected_date <= today);
      const monthRegistered = monthConfirmed.filter((b) => b.outcome === "registered").length;
      setMonthConvRate(monthConfirmed.length > 0 ? Math.round((monthRegistered / monthConfirmed.length) * 100) : null);
    }
    if (visitorsData.success) setVisitors(visitorsData);
  }, []);

  useEffect(() => {
    if (tab === "overview") loadOverview();
    if (tab === "bookings") loadBookings();
    if (tab === "stats") loadAllBookings();
    if (tab === "settings") loadSettings();
    if (tab === "holidays") loadHolidays();
    if (tab === "slots") loadSlots();
  }, [tab, loadBookings, loadAllBookings, loadSettings, loadHolidays, loadSlots, loadOverview]);

  useEffect(() => { if (tab === "slots") loadSlots(); }, [slotDate, tab, loadSlots]);

  // CRM 업데이트
  const handleCrmUpdate = async (id: string, fields: Record<string, string>) => {
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, ...fields } : b));
    setAllBookings((prev) => prev.map((b) => b.id === id ? { ...b, ...fields } : b));
  };

  const handleCancel = async (id: string) => {
    if (!confirm("이 예약을 취소하시겠습니까?")) return;
    await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
    await loadBookings();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 예약을 완전히 삭제하시겠습니까? 복구할 수 없습니다.")) return;
    await fetch(`/api/admin/bookings/${id}?permanent=1`, { method: "DELETE" });
    await loadBookings();
  };

  const handleAddBooking = async () => {
    setAddLoading(true);
    setAddError("");
    const res = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: addForm.name.trim(),
        contact: addForm.contact.trim(),
        selectedDate: addForm.date,
        selectedTime: addForm.time,
        consentAgreed: true,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setShowAddModal(false);
      setAddForm({ name: "", contact: "", date: toLocalDateStr(new Date()), time: "19:00" });
      await loadBookings();
    } else {
      setAddError(data.error ?? "예약 추가 실패");
    }
    setAddLoading(false);
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    setSettingsMsg(data.success ? "저장되었습니다." : "저장 실패");
    setSettingsSaving(false);
    setTimeout(() => setSettingsMsg(""), 2000);
  };

  const handleAddHoliday = async () => {
    if (!newHoliday) return;
    const res = await fetch("/api/admin/holidays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dates: [newHoliday] }),
    });
    const data = await res.json();
    if (data.success) { setNewHoliday(""); setHolidayMsg("추가되었습니다."); await loadHolidays(); }
    else setHolidayMsg("추가 실패");
    setTimeout(() => setHolidayMsg(""), 2000);
  };

  const handleDeleteHoliday = async (date: string) => {
    await fetch("/api/admin/holidays", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dates: [date] }),
    });
    await loadHolidays();
  };

  const handleSlotOverride = async (time: string, action: "close" | "open") => {
    await fetch("/api/admin/slots/override", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: slotDate, time, action }),
    });
    await loadSlots();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  const handleExportCSV = () => {
    const rows = [
      ["이름", "연락처", "날짜", "시간", "상태", "참석", "등록", "비등록사유", "메모", "예약일시"].join(","),
      ...filteredBookings.map((b) =>
        [b.name, b.contact, b.selected_date, b.selected_time, b.status,
          b.attended ?? "", b.outcome ?? "", b.no_show_reason ?? "", b.no_show_memo ?? "", b.created_at].join(",")
      ),
    ];
    const blob = new Blob(["﻿" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `예약목록_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 최근 7일 이내 접수된 신규 예약 (접수 시각 기준, 최신순)
  const recentBookings = allBookings
    .filter((b) => {
      const t = new Date(b.created_at).getTime();
      return !isNaN(t) && Date.now() - t < 7 * 86400000;
    })
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  const filteredBookings = bookings.filter((b) => {
    const range = getBookingDateRange();
    if (range) {
      if (b.selected_date < range.start || b.selected_date > range.end) return false;
    }
    if (!search) return true;
    const q = search.toLowerCase();
    return b.name.includes(q) || b.contact.includes(q);
  });

  // ── 스타일 헬퍼 ────────────────────────────────────────────────
  const tabBtn = (t: Tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
      style={{
        background: tab === t ? "var(--color-brand-accent)" : "transparent",
        color: tab === t ? "#0A0A0A" : "var(--color-text-secondary)",
      }}
    >
      {label}
    </button>
  );

  const outcomeChip = (b: Booking) => {
    if (b.attended === "no") return <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,100,100,0.12)", color: "#ff6464" }}>미참석</span>;
    if (b.outcome === "registered") return <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(200,255,0,0.12)", color: "var(--color-brand-accent)" }}>등록</span>;
    if (b.outcome === "not_registered") return <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,159,67,0.12)", color: "#ff9f43" }}>비등록</span>;
    if (b.attended === "yes") return <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,159,67,0.12)", color: "#ff9f43" }}>등록 미입력</span>;
    return <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>—</span>;
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-base)" }}>
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: "var(--color-border)", background: "var(--color-bg-surface)" }}>
        <div className="flex items-center gap-3">
          <span className="text-accent font-bold text-sm tracking-widest uppercase">Admin</span>
          <span className="text-text-muted text-sm">|</span>
          <span className="text-text-primary font-semibold text-sm">하이프트레이닝클럽</span>
        </div>
        <button onClick={handleLogout} className="text-text-muted text-sm hover:text-text-secondary transition-colors">로그아웃</button>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <nav className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: "var(--color-bg-surface)" }}>
          {tabBtn("overview", "현황")}
          {tabBtn("bookings", "예약 목록")}
          {tabBtn("stats", "통계")}
          {tabBtn("slots", "슬롯 관리")}
          {tabBtn("holidays", "휴일 관리")}
          {tabBtn("settings", "설정")}
        </nav>

        {/* ─── 현황 ─────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* 최근 7일 신규 예약 */}
            <div
              className="p-5 rounded-2xl"
              style={{
                background: "var(--color-bg-surface)",
                border: `1px solid ${recentBookings.length > 0 ? "rgba(200,255,0,0.35)" : "var(--color-border)"}`,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-text-primary font-semibold">최근 7일 신규 예약</h2>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: recentBookings.length > 0 ? "rgba(200,255,0,0.12)" : "var(--color-bg-base)",
                    color: recentBookings.length > 0 ? "var(--color-brand-accent)" : "var(--color-text-muted)",
                  }}
                >
                  {recentBookings.length}건
                </span>
              </div>
              {recentBookings.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>최근 7일간 새로 들어온 예약이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {recentBookings.map((b) => {
                    const createdT = new Date(b.created_at).getTime();
                    const isNew = !isNaN(createdT) && Date.now() - createdT < 86400000;
                    return (
                      <div
                        key={b.id}
                        onClick={() => setTab("bookings")}
                        className="flex flex-col gap-2 px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors"
                        style={{ background: "var(--color-bg-base)", border: "1px solid var(--color-border)" }}
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          {isNew && (
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--color-brand-accent)", color: "#0A0A0A" }}>N</span>
                          )}
                          <span className="font-medium text-sm" style={{ color: "var(--color-text-primary)" }}>{b.name}</span>
                          <span className="font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>{maskContact(b.contact)}</span>
                          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            체험 {formatDate(b.selected_date)} {b.selected_time}
                          </span>
                          {b.status === "cancelled" && (
                            <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,100,100,0.12)", color: "#ff6464" }}>예약취소</span>
                          )}
                          <span className="text-xs ml-auto" style={{ color: "var(--color-text-muted)" }}>{formatRelativeTime(b.created_at)} 접수</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <CopyButton label="전화번호 복사" getText={() => b.contact} />
                          <CopyButton label="확정문자 복사" getText={() => buildConfirmMessage(b)} />
                          <CopyButton label="당일문자 복사" getText={() => buildReminderMessage(b)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 방문자 수 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl" style={{ background: "var(--color-bg-surface)", border: "1px solid rgba(200,255,0,0.2)" }}>
                <p className="text-text-muted text-xs mb-2">오늘 방문자</p>
                <p className="font-heading font-black text-3xl" style={{ color: "var(--color-brand-accent)" }}>
                  {visitors?.today ?? "—"}<span className="text-base font-normal text-text-muted ml-1">명</span>
                </p>
                {visitors && <p className="text-text-muted text-xs mt-1">어제 {visitors.yesterday}명</p>}
              </div>
              <div className="p-5 rounded-2xl" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}>
                <p className="text-text-muted text-xs mb-2">누적 방문자</p>
                <p className="font-heading font-black text-3xl text-text-primary">
                  {visitors?.total ?? "—"}<span className="text-base font-normal text-text-muted ml-1">명</span>
                </p>
              </div>
              <div className="p-5 rounded-2xl" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}>
                <p className="text-text-muted text-xs mb-2">방문→예약 전환</p>
                <p className="font-heading font-black text-3xl text-text-primary">
                  {visitors && visitors.total > 0 && todayCount > 0
                    ? `${Math.round((todayCount / visitors.today) * 100)}%`
                    : "—"}
                </p>
                <p className="text-text-muted text-xs mt-1">오늘 기준</p>
              </div>
            </div>

            {/* 예약 현황 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}>
                <p className="text-text-muted text-xs mb-2">오늘 예약</p>
                <p className="font-heading font-black text-3xl text-text-primary">{todayCount}<span className="text-base font-normal text-text-muted ml-1">건</span></p>
              </div>
              <div className="p-5 rounded-2xl" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}>
                <p className="text-text-muted text-xs mb-2">이번 주 예약</p>
                <p className="font-heading font-black text-3xl text-text-primary">{weekCount}<span className="text-base font-normal text-text-muted ml-1">건</span></p>
              </div>
              <div className="p-5 rounded-2xl" style={{ background: "var(--color-bg-surface)", border: `1px solid ${monthConvRate !== null && monthConvRate >= 50 ? "rgba(200,255,0,0.3)" : "var(--color-border)"}` }}>
                <p className="text-text-muted text-xs mb-2">이번 달 전환율</p>
                <p className="font-heading font-black text-3xl" style={{ color: monthConvRate !== null && monthConvRate >= 50 ? "var(--color-brand-accent)" : "var(--color-text-primary)" }}>
                  {monthConvRate !== null ? `${monthConvRate}%` : "—"}
                </p>
                <p className="text-text-muted text-xs mt-1">예약 → 등록</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}>
              <h2 className="text-text-primary font-semibold mb-4">빠른 액션</h2>
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => setTab("bookings")} className="px-4 py-2 rounded-xl text-sm font-medium border transition-all" style={{ background: "var(--color-bg-base)", borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>예약 목록 보기 →</button>
                <button onClick={() => setTab("stats")} className="px-4 py-2 rounded-xl text-sm font-medium border transition-all" style={{ background: "var(--color-bg-base)", borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>전환 통계 보기 →</button>
                <button
                  onClick={async () => {
                    const paused = settings["booking-paused"] === "1" ? "0" : "1";
                    await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ "booking-paused": paused }) });
                    setSettings((s) => ({ ...s, "booking-paused": paused }));
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                  style={{
                    background: settings["booking-paused"] === "1" ? "rgba(200,255,0,0.1)" : "rgba(255,100,100,0.1)",
                    borderColor: settings["booking-paused"] === "1" ? "var(--color-brand-accent)" : "#ff6464",
                    color: settings["booking-paused"] === "1" ? "var(--color-brand-accent)" : "#ff6464",
                  }}
                >
                  {settings["booking-paused"] === "1" ? "예약 재개하기" : "전체 예약 중단"}
                </button>
              </div>
              {settings["booking-paused"] === "1" && <p className="text-red-400 text-xs mt-3">⚠ 현재 전체 예약이 중단 상태입니다.</p>}
            </div>
          </div>
        )}

        {/* ─── 예약 목록 ────────────────────────────────────────── */}
        {tab === "bookings" && (
          <div className="space-y-4">
            {/* 기간 필터 */}
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap items-center">
                {(["today", "week", "month", "range"] as const).map((p) => {
                  const labels = { today: "오늘", week: "이번 주", month: "이번 달", range: "기간 선택" };
                  return (
                    <button
                      key={p}
                      onClick={() => setBookingPeriod(p)}
                      className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
                      style={{
                        background: bookingPeriod === p ? "var(--color-brand-accent)" : "transparent",
                        borderColor: bookingPeriod === p ? "var(--color-brand-accent)" : "var(--color-border)",
                        color: bookingPeriod === p ? "#0A0A0A" : "var(--color-text-secondary)",
                      }}
                    >
                      {labels[p]}
                    </button>
                  );
                })}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="ml-auto px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={{ background: "var(--color-brand-accent)", color: "#0A0A0A" }}
                >
                  + 예약 추가
                </button>
                <button onClick={handleExportCSV} className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
                  style={{ background: "transparent", borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>
                  CSV
                </button>
              </div>

              {/* 기간 선택 — 날짜 range 또는 하루 선택 */}
              {bookingPeriod === "range" && (
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="date"
                    value={bookingRangeStart}
                    onChange={(e) => setBookingRangeStart(e.target.value)}
                    className="rounded-xl px-3 py-2 text-sm border outline-none"
                    style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                  />
                  <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>~</span>
                  <input
                    type="date"
                    value={bookingRangeEnd}
                    min={bookingRangeStart}
                    onChange={(e) => setBookingRangeEnd(e.target.value)}
                    className="rounded-xl px-3 py-2 text-sm border outline-none"
                    style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                  />
                  {bookingRangeStart && (
                    <button
                      onClick={() => setBookingRangeEnd(bookingRangeStart)}
                      className="px-3 py-2 rounded-xl text-xs border transition-all"
                      style={{ background: "transparent", borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
                    >
                      하루만
                    </button>
                  )}
                </div>
              )}

              <input type="text" placeholder="이름 또는 연락처 검색" value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm border outline-none"
                style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }} />
            </div>

            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {filteredBookings.length}건 표시 · 행을 클릭하면 참석·등록 여부를 바로 입력할 수 있습니다.
            </p>

            {bookingsLoading ? (
              <p className="text-text-muted text-sm py-8 text-center">불러오는 중...</p>
            ) : filteredBookings.length === 0 ? (
              <p className="text-text-muted text-sm py-8 text-center">예약이 없습니다.</p>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
                <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
                  <thead>
                    <tr style={{ background: "var(--color-bg-surface)" }}>
                      {["이름", "연락처", "날짜", "시간", "예약상태", "체험결과", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-semibold text-text-muted text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b, i) => {
                      const isExpanded = expandedId === b.id;
                      const rowBg = i % 2 === 0 ? "var(--color-bg-base)" : "var(--color-bg-surface)";
                      return (
                        <>
                          <tr
                            key={b.id}
                            onClick={() => setExpandedId(isExpanded ? null : b.id)}
                            style={{ background: rowBg, borderTop: "1px solid var(--color-border)", cursor: "pointer" }}
                          >
                            <td className="px-4 py-3 font-medium" style={{ color: "var(--color-text-primary)" }}>{b.name}</td>
                            <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>{maskContact(b.contact)}</td>
                            <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>{formatDate(b.selected_date)}</td>
                            <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>{b.selected_time}</td>
                            <td className="px-4 py-3">
                              {b.status === "cancelled"
                                ? <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,100,100,0.12)", color: "#ff6464" }}>예약취소</span>
                                : <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(200,255,0,0.12)", color: "var(--color-brand-accent)" }}>확정</span>
                              }
                            </td>
                            <td className="px-4 py-3">{outcomeChip(b)}</td>
                            <td className="px-4 py-3">
                              {b.status === "confirmed" && (
                                <button onClick={(e) => { e.stopPropagation(); handleCancel(b.id); }} className="text-xs hover:text-red-300 transition-colors" style={{ color: "var(--color-text-muted)" }}>취소</button>
                              )}
                              {b.status === "cancelled" && (
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }} className="text-xs hover:text-red-400 transition-colors" style={{ color: "#ff6464" }}>삭제</button>
                              )}
                            </td>
                          </tr>
                          {isExpanded && b.status !== "cancelled" && (
                            <CrmRow key={`crm-${b.id}`} booking={b} onUpdate={handleCrmUpdate} />
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── 통계 ─────────────────────────────────────────────── */}
        {tab === "stats" && (
          <div className="space-y-6">
            {/* 서브탭 */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--color-bg-surface)" }}>
              {(["visitors", "bookings"] as const).map((st) => {
                const labels = { visitors: "방문자", bookings: "예약 현황" };
                return (
                  <button
                    key={st}
                    onClick={() => setStatsSubTab(st)}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: statsSubTab === st ? "var(--color-brand-accent)" : "transparent",
                      color: statsSubTab === st ? "#0A0A0A" : "var(--color-text-secondary)",
                    }}
                  >
                    {labels[st]}
                  </button>
                );
              })}
            </div>

            {statsSubTab === "visitors" && <VisitorsTab visitors={visitors} todayBookings={todayCount} />}
            {statsSubTab === "bookings" && <StatsTab bookings={allBookings} />}
          </div>
        )}

        {/* ─── 슬롯 관리 ───────────────────────────────────────── */}
        {tab === "slots" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { const d = new Date(slotDate); d.setDate(d.getDate() - 1); setSlotDate(toLocalDateStr(d)); }}
                className="rounded-xl px-3 py-2.5 text-sm border transition-colors"
                style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
              >{"<"}</button>
              <input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)}
                className="rounded-xl px-4 py-2.5 text-sm border outline-none"
                style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }} />
              <button
                onClick={() => { const d = new Date(slotDate); d.setDate(d.getDate() + 1); setSlotDate(toLocalDateStr(d)); }}
                className="rounded-xl px-3 py-2.5 text-sm border transition-colors"
                style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
              >{">"}</button>
              <span className="text-text-muted text-sm">{formatDate(slotDate)}</span>
            </div>
            <div className="grid gap-3">
              {slotData.length === 0 ? (
                <p className="text-text-muted text-sm py-8 text-center">슬롯 정보가 없습니다.</p>
              ) : slotData.map((slot) => {
                const names = slotBookings.filter((b) => b.selected_time === slot.time && b.status !== "cancelled");
                return (
                  <div key={slot.time} className="p-4 rounded-2xl space-y-3"
                    style={{ background: "var(--color-bg-surface)", border: `1px solid ${slot.isClosed ? "#ff6464" : "var(--color-border)"}` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-text-primary font-semibold w-14">{slot.time}</span>
                        <div className="h-2 rounded-full overflow-hidden" style={{ width: 120, background: "var(--color-bg-base)" }}>
                          <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min((slot.count / slot.max) * 100, 100)}%`, background: slot.isClosed ? "#ff6464" : "var(--color-brand-accent)" }} />
                        </div>
                        <span className="text-text-muted text-sm">{slot.count} / {slot.max}명</span>
                        {slot.isClosed && <span className="text-xs text-red-400">{slot.isManualClose ? "수동 마감" : "정원 마감"}</span>}
                      </div>
                      <button onClick={() => handleSlotOverride(slot.time, slot.isManualClose ? "open" : "close")}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                        style={{ background: "transparent", borderColor: slot.isManualClose ? "var(--color-brand-accent)" : "#ff6464", color: slot.isManualClose ? "var(--color-brand-accent)" : "#ff6464" }}>
                        {slot.isManualClose ? "재오픈" : "수동 마감"}
                      </button>
                    </div>
                    {names.length > 0 && (
                      <div className="flex flex-wrap gap-2 pl-[72px]">
                        {names.map((b) => (
                          <div key={b.id} className="flex flex-col gap-1.5 px-2.5 py-2 rounded-lg"
                            style={{ background: "var(--color-bg-base)" }}>
                            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                              {b.name} <span style={{ color: "var(--color-text-muted)" }}>· {maskContact(b.contact)}</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <CopyButton label="전화" getText={() => b.contact} />
                              <CopyButton label="확정문자" getText={() => buildConfirmMessage(b)} />
                              <CopyButton label="당일문자" getText={() => buildReminderMessage(b)} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── 휴일 관리 ───────────────────────────────────────── */}
        {tab === "holidays" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl space-y-4" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}>
              <h2 className="text-text-primary font-semibold">휴일 추가</h2>
              <div className="flex gap-3">
                <input type="date" value={newHoliday} onChange={(e) => setNewHoliday(e.target.value)}
                  className="rounded-xl px-4 py-2.5 text-sm border outline-none flex-1"
                  style={{ background: "var(--color-bg-base)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }} />
                <button onClick={handleAddHoliday} className="btn-cta px-5 py-2.5 text-sm">추가</button>
              </div>
              {holidayMsg && <p className="text-accent text-sm">{holidayMsg}</p>}
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
              {holidays.length === 0 ? (
                <p className="text-text-muted text-sm py-8 text-center">등록된 휴일이 없습니다.</p>
              ) : holidays.map((date, i) => (
                <div key={date} className="flex items-center justify-between px-5 py-3"
                  style={{ background: i % 2 === 0 ? "var(--color-bg-base)" : "var(--color-bg-surface)", borderTop: i > 0 ? "1px solid var(--color-border)" : undefined }}>
                  <span className="text-text-primary text-sm">{formatDate(date)}</span>
                  <button onClick={() => handleDeleteHoliday(date)} className="text-xs hover:text-red-300 transition-colors" style={{ color: "var(--color-text-muted)" }}>삭제</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── 설정 ─────────────────────────────────────────────── */}
        {tab === "settings" && (
          <div className="p-6 rounded-2xl space-y-6" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-text-primary font-semibold">예약 설정</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-text-secondary text-sm mb-2">슬롯당 최대 인원</label>
                <div className="flex items-center gap-3">
                  <input type="number" min={1} max={20} value={settings["max-per-slot"]}
                    onChange={(e) => setSettings((s) => ({ ...s, "max-per-slot": e.target.value }))}
                    className="w-24 rounded-xl px-4 py-2.5 text-sm border outline-none text-center"
                    style={{ background: "var(--color-bg-base)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }} />
                  <span className="text-text-muted text-sm">명</span>
                </div>
              </div>
              <div>
                <label className="block text-text-secondary text-sm mb-2">예약 가능 기간</label>
                <div className="flex items-center gap-3">
                  <span className="text-text-muted text-sm">오늘 기준</span>
                  <input type="number" min={1} max={60} value={settings["booking-range-days"]}
                    onChange={(e) => setSettings((s) => ({ ...s, "booking-range-days": e.target.value }))}
                    className="w-24 rounded-xl px-4 py-2.5 text-sm border outline-none text-center"
                    style={{ background: "var(--color-bg-base)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }} />
                  <span className="text-text-muted text-sm">일 후까지</span>
                </div>
              </div>
              <div>
                <label className="block text-text-secondary text-sm mb-2">안내 문구</label>
                <input type="text" value={settings["notice-text"]}
                  onChange={(e) => setSettings((s) => ({ ...s, "notice-text": e.target.value }))}
                  placeholder="빈칸이면 표시 안 함"
                  className="w-full rounded-xl px-4 py-2.5 text-sm border outline-none"
                  style={{ background: "var(--color-bg-base)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }} />
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings["booking-paused"] === "1"}
                    onChange={(e) => setSettings((s) => ({ ...s, "booking-paused": e.target.checked ? "1" : "0" }))}
                    className="sr-only peer" />
                  <div className="w-11 h-6 rounded-full transition-all peer-checked:bg-red-500" style={{ background: "var(--color-border)" }} />
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5" />
                </label>
                <span className="text-text-secondary text-sm">전체 예약 중단</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSaveSettings} disabled={settingsSaving} className="btn-cta px-6 py-2.5 text-sm disabled:opacity-40">
                {settingsSaving ? "저장 중..." : "저장"}
              </button>
              {settingsMsg && <p className="text-accent text-sm">{settingsMsg}</p>}
            </div>
          </div>
        )}
      </div>

      {/* ─── 수동 예약 추가 모달 ──────────────────────────────── */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-5"
            style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading font-bold text-lg" style={{ color: "var(--color-text-primary)" }}>예약 추가</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>이름</label>
                <input
                  type="text"
                  placeholder="홍길동"
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl px-4 py-2.5 text-sm border outline-none"
                  style={{ background: "var(--color-bg-base)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>연락처</label>
                <input
                  type="text"
                  placeholder="010-0000-0000"
                  value={addForm.contact}
                  onChange={(e) => setAddForm((f) => ({ ...f, contact: e.target.value }))}
                  className="w-full rounded-xl px-4 py-2.5 text-sm border outline-none"
                  style={{ background: "var(--color-bg-base)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>날짜</label>
                  <input
                    type="date"
                    value={addForm.date}
                    onChange={(e) => setAddForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
                    style={{ background: "var(--color-bg-base)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>시간</label>
                  <select
                    value={addForm.time}
                    onChange={(e) => setAddForm((f) => ({ ...f, time: e.target.value }))}
                    className="rounded-xl px-3 py-2.5 text-sm border outline-none"
                    style={{ background: "var(--color-bg-base)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                  >
                    <option>19:00</option>
                    <option>20:00</option>
                    <option>21:00</option>
                  </select>
                </div>
              </div>
            </div>

            {addError && <p className="text-xs text-red-400">{addError}</p>}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-full text-sm font-medium border transition-all"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
              >
                취소
              </button>
              <button
                onClick={handleAddBooking}
                disabled={addLoading || !addForm.name || !addForm.contact || !addForm.date}
                className="flex-1 btn-cta py-2.5 text-sm disabled:opacity-40"
              >
                {addLoading ? "추가 중..." : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
