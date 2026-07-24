"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { getAvailableDates, getTimeSlotsForDate } from "@/lib/schedule";

interface SlotStatus {
  time: string;
  isClosed: boolean;
}

interface FormState {
  name: string;
  selectedDate: string;
  selectedTime: string;
  consentAgreed: boolean;
}

interface BookingFormProps {
  onFormStart?: () => void;
  onFormSubmit?: () => void;
  onDateSelect?: (date: string) => void;
  onTimeSelect?: (date: string, time: string) => void;
}

export default function BookingForm({
  onFormStart,
  onFormSubmit,
  onDateSelect,
  onTimeSelect,
}: BookingFormProps) {
  const [form, setForm] = useState<FormState>({
    name: "",
    selectedDate: "",
    selectedTime: "",
    consentAgreed: false,
  });
  const [phoneMiddle, setPhoneMiddle] = useState("");
  const [phoneLast, setPhoneLast] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const hasStarted = useRef(false);
  const [slotStatuses, setSlotStatuses] = useState<SlotStatus[]>([]);
  const [noticeText, setNoticeText] = useState("");

  const dateChips = useMemo(() => getAvailableDates(), []);

  const weekGroups = useMemo(() => {
    const WEEK_LABELS = ["이번 주", "다음 주", "2주 후", "3주 후"];
    const groups: { label: string; key: string; chips: typeof dateChips }[] = [];
    dateChips.forEach((chip) => {
      const d = new Date(chip.date + "T00:00:00");
      const dow = d.getDay();
      const diff = dow === 0 ? -6 : 1 - dow;
      const monday = new Date(d);
      monday.setDate(d.getDate() + diff);
      const weekKey = `${monday.getFullYear()}-${monday.getMonth()}-${monday.getDate()}`;
      let group = groups.find((g) => g.key === weekKey);
      if (!group) {
        group = { label: WEEK_LABELS[groups.length] ?? `+${groups.length}주 후`, key: weekKey, chips: [] };
        groups.push(group);
      }
      group.chips.push(chip);
    });
    return groups;
  }, [dateChips]);

  const timeSlots = useMemo(
    () => (form.selectedDate ? getTimeSlotsForDate(form.selectedDate) : []),
    [form.selectedDate]
  );

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => { if (d.success) setNoticeText(d.settings["notice-text"] ?? ""); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.selectedDate) return;
    fetch(`/api/admin/slots/override?date=${form.selectedDate}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setSlotStatuses(d.slots); })
      .catch(() => {});
  }, [form.selectedDate]);

  const triggerFormStart = () => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      onFormStart?.();
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, part: "middle" | "last") => {
    triggerFormStart();
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (part === "middle") setPhoneMiddle(digits);
    else setPhoneLast(digits);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    triggerFormStart();
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDateSelect = (date: string) => {
    triggerFormStart();
    setForm((prev) => ({ ...prev, selectedDate: date, selectedTime: "" }));
    onDateSelect?.(date);
  };

  const handleTimeSelect = (time: string) => {
    setForm((prev) => ({ ...prev, selectedTime: time }));
    onTimeSelect?.(form.selectedDate, time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          contact: `010-${phoneMiddle}-${phoneLast}`,
          selectedDate: form.selectedDate,
          selectedTime: form.selectedTime,
          consentAgreed: form.consentAgreed,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        onFormSubmit?.();
      } else {
        setStatus("error");
        setErrorMsg(data.error || "오류가 발생했습니다. 다시 시도해주세요.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const isSubmittable =
    form.name.trim() !== "" &&
    phoneMiddle.length === 4 &&
    phoneLast.length === 4 &&
    form.selectedDate !== "" &&
    form.selectedTime !== "" &&
    form.consentAgreed;

  if (status === "success") {
    return (
      <section id="booking" className="section-padding bg-bg-base">
        <div className="max-w-md mx-auto text-center">
          {/* 체크 아이콘 */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "var(--color-brand-accent)" }}
          >
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <path d="M8 22L18 32L36 12" stroke="#0A0A0A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="font-heading font-black text-display-md text-text-primary mb-2">예약 신청이 완료되었습니다.</h2>
          <p className="text-text-secondary text-base leading-relaxed mb-6">
            담당자 확인 후 예약 확정 문자를 보내드려요.<br />
            <span className="text-text-muted text-sm">문자를 받으셔야 예약이 최종 확정됩니다.</span>
          </p>

          {/* 예약 정보 카드 */}
          <div
            className="rounded-2xl px-6 py-5 mb-6 text-left"
            style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-brand-accent)" }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--color-brand-accent)" }}>예약 정보</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-sm">이름</span>
                <span className="text-text-primary font-semibold text-sm">{form.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-sm">날짜</span>
                <span className="text-text-primary font-semibold text-sm">{form.selectedDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-sm">시간</span>
                <span className="font-black text-base" style={{ color: "var(--color-brand-accent)" }}>{form.selectedTime}</span>
              </div>
            </div>
          </div>

          {/* 안내 문구 */}
          <div className="rounded-xl px-5 py-4 text-left" style={{ background: "rgba(200,255,0,0.06)", border: "1px solid rgba(200,255,0,0.2)" }}>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              체험 당일 등록 시 <span style={{ color: "var(--color-brand-accent)" }} className="font-semibold">별도 혜택</span>을 안내해드려요.
            </p>
          </div>

          {/* 연락처 */}
          <a
            href="tel:01081324550"
            className="flex items-center justify-center gap-2 mt-5 py-3 rounded-xl transition-opacity active:opacity-70"
            style={{ background: "var(--color-bg-surface)" }}
          >
            <span className="text-text-muted text-sm">문의</span>
            <span className="font-bold text-xl" style={{ color: "var(--color-text-primary)" }}>010-8132-4550</span>
          </a>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="section-padding bg-bg-base">
      <div className="max-w-md mx-auto">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3">Free Trial</p>
        <h2 className="font-heading font-black text-display-md text-text-primary mb-2 text-balance">
          1회 무료체험 예약
        </h2>
        <p className="text-text-secondary text-lg mb-2 leading-relaxed">원하는 날짜와 시간을 선택하세요.</p>
        <p className="text-text-muted text-sm mb-8 leading-relaxed">체험 후 등록 여부는 그때 정하시면 됩니다.</p>

        {noticeText && (
          <div
            className="mb-6 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(200,255,0,0.08)", border: "1px solid rgba(200,255,0,0.3)", color: "var(--color-brand-accent)" }}
          >
            {noticeText}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* 이름 */}
          <div>
            <label className="block text-text-secondary text-sm mb-2" htmlFor="name">
              이름 <span className="text-accent">*</span>
            </label>
            <input
              id="name" name="name" type="text"
              value={form.name} onChange={handleTextChange}
              placeholder="홍길동" required
              className="w-full rounded-xl px-4 py-3.5 text-text-primary placeholder:text-text-muted border outline-none transition-all text-base"
              style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-brand-accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-text-secondary text-sm mb-2">
              연락처 <span className="text-accent">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-text-primary font-medium shrink-0 text-base">010</span>
              <span className="text-text-muted">-</span>
              <input
                type="tel" inputMode="numeric" maxLength={4}
                value={phoneMiddle} onChange={(e) => handlePhoneChange(e, "middle")}
                placeholder="0000" required
                className="w-full rounded-xl px-4 py-3.5 text-text-primary placeholder:text-text-muted border outline-none transition-all text-base text-center"
                style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-brand-accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
              />
              <span className="text-text-muted">-</span>
              <input
                type="tel" inputMode="numeric" maxLength={4}
                value={phoneLast} onChange={(e) => handlePhoneChange(e, "last")}
                placeholder="0000" required
                className="w-full rounded-xl px-4 py-3.5 text-text-primary placeholder:text-text-muted border outline-none transition-all text-base text-center"
                style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-brand-accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
              />
            </div>
          </div>

          {/* 날짜 선택 — 주차 그룹 */}
          <div>
            <label className="block text-text-secondary text-sm mb-3">
              체험 날짜 <span className="text-accent">*</span>
            </label>
            <div className="space-y-4">
              {weekGroups.map((group) => (
                <div key={group.key}>
                  <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>{group.label}</p>
                  <div className="flex gap-2 flex-wrap">
                    {group.chips.map((chip) => {
                      const isSelected = form.selectedDate === chip.date;
                      return (
                        <button
                          key={chip.date} type="button" disabled={chip.disabled}
                          onClick={() => handleDateSelect(chip.date)}
                          className="flex flex-col items-center w-14 py-3 rounded-xl border transition-all text-center"
                          style={{
                            background: isSelected ? "var(--color-brand-accent)" : "var(--color-bg-surface)",
                            borderColor: isSelected ? "var(--color-brand-accent)" : "var(--color-border)",
                            opacity: chip.disabled ? 0.35 : 1,
                            cursor: chip.disabled ? "not-allowed" : "pointer",
                          }}
                        >
                          <span className="text-xs font-semibold mb-0.5" style={{ color: isSelected ? "#0A0A0A" : "var(--color-text-secondary)" }}>
                            {chip.dayLabel}
                          </span>
                          <span className="text-sm font-bold" style={{ color: isSelected ? "#0A0A0A" : "var(--color-text-primary)" }}>
                            {chip.dateLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 시간 선택 */}
          <div>
            <label className="block text-text-secondary text-sm mb-3">
              체험 시간 <span className="text-accent">*</span>
              {!form.selectedDate && <span className="text-text-muted ml-2 text-xs">(날짜 먼저 선택)</span>}
            </label>
            <div className="flex gap-2 flex-wrap">
              {form.selectedDate === "" ? (
                ["저녁 7시", "저녁 8시", "저녁 9시"].map((label) => (
                  <div key={label} className="px-5 py-3 rounded-xl border text-sm font-medium"
                    style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border)", color: "var(--color-text-muted)", opacity: 0.4 }}>
                    {label}
                  </div>
                ))
              ) : (
                timeSlots.map((slot) => {
                  const isSelected = form.selectedTime === slot.value;
                  const isClosed = slotStatuses.find((s) => s.time === slot.value)?.isClosed ?? false;
                  return (
                    <button
                      key={slot.value} type="button" disabled={isClosed}
                      onClick={() => !isClosed && handleTimeSelect(slot.value)}
                      className="px-5 py-3 rounded-xl border text-sm font-medium transition-all active:scale-95 relative"
                      style={{
                        background: isClosed ? "var(--color-bg-surface)" : isSelected ? "var(--color-brand-accent)" : "var(--color-bg-surface)",
                        borderColor: isClosed ? "var(--color-border)" : isSelected ? "var(--color-brand-accent)" : "var(--color-border)",
                        color: isClosed ? "var(--color-text-muted)" : isSelected ? "#0A0A0A" : "var(--color-text-primary)",
                        opacity: isClosed ? 0.5 : 1,
                        cursor: isClosed ? "not-allowed" : "pointer",
                      }}
                    >
                      {slot.label}
                      {isClosed && <span className="block text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>마감</span>}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 개인정보 동의 */}
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "var(--color-bg-surface)" }}>
            <input
              id="consentAgreed" type="checkbox"
              checked={form.consentAgreed}
              onChange={(e) => { triggerFormStart(); setForm((prev) => ({ ...prev, consentAgreed: e.target.checked })); }}
              className="mt-0.5 w-5 h-5 shrink-0 cursor-pointer"
              style={{ accentColor: "var(--color-brand-accent)" }}
            />
            <label htmlFor="consentAgreed" className="text-text-secondary text-sm leading-relaxed cursor-pointer">
              <span className="text-accent font-semibold">[필수]</span> 개인정보 수집·이용에 동의합니다.
              <br />
              <span className="text-text-muted text-xs">이름, 연락처를 무료체험 예약 안내 목적으로 수집하며, 목적 달성 후 즉시 파기합니다.</span>
            </label>
          </div>

          {status === "error" && <p className="text-red-400 text-sm">{errorMsg}</p>}

          <button
            type="submit"
            disabled={!isSubmittable || status === "loading"}
            className="btn-cta w-full py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "처리 중..." : "무료체험 예약하기 →"}
          </button>
        </form>
      </div>
    </section>
  );
}
