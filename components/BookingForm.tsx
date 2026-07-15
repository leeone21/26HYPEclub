"use client";

import { useState, useRef, useMemo } from "react";
import { getAvailableDates, getTimeSlotsForDate } from "@/lib/schedule";

interface FormState {
  name: string;
  contact: string;
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
    contact: "",
    selectedDate: "",
    selectedTime: "",
    consentAgreed: false,
  });
  const [phoneMiddle, setPhoneMiddle] = useState("");
  const [phoneLast, setPhoneLast] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const hasStarted = useRef(false);

  const dateChips = useMemo(() => getAvailableDates(), []);
  const timeSlots = useMemo(
    () => (form.selectedDate ? getTimeSlotsForDate(form.selectedDate) : []),
    [form.selectedDate]
  );

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    part: "middle" | "last"
  ) => {
    triggerFormStart();
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (part === "middle") {
      setPhoneMiddle(digits);
      setForm((prev) => ({ ...prev, contact: `010-${digits}-${phoneLast}` }));
    } else {
      setPhoneLast(digits);
      setForm((prev) => ({ ...prev, contact: `010-${phoneMiddle}-${digits}` }));
    }
  };

  const triggerFormStart = () => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      onFormStart?.();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    triggerFormStart();
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    triggerFormStart();
    setForm((prev) => ({ ...prev, consentAgreed: e.target.checked }));
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
          contact: form.contact,
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
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{
              background: "var(--color-brand-accent-muted)",
              border: "1px solid var(--color-brand-accent)",
            }}
          >
            <span className="text-2xl text-accent">✓</span>
          </div>
          <h2 className="font-heading font-black text-display-md text-text-primary mb-3">
            예약 완료!
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed">
            예약 완료. 확인 연락드리겠습니다.
          </p>
          <p className="text-text-muted text-sm mt-4">
            {form.selectedDate} {form.selectedTime}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="section-padding bg-bg-base">
      <div className="max-w-md mx-auto">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3">
          Free Trial
        </p>
        <h2 className="font-heading font-black text-display-md text-text-primary mb-2 text-balance">
          1회 무료체험 예약
        </h2>
        <p className="text-text-secondary text-lg mb-8 leading-relaxed">
          원하는 날짜와 시간을 선택하세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* 이름 */}
          <div>
            <label className="block text-text-secondary text-sm mb-2" htmlFor="name">
              이름 <span className="text-accent">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleTextChange}
              placeholder="홍길동"
              required
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
              {/* 010 고정 */}
              <div
                className="rounded-xl px-4 py-3.5 text-text-muted border text-base select-none shrink-0"
                style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border)" }}
              >
                010
              </div>
              <span className="text-text-muted">-</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={4}
                value={phoneMiddle}
                onChange={(e) => handlePhoneChange(e, "middle")}
                placeholder="0000"
                required
                className="w-full rounded-xl px-4 py-3.5 text-text-primary placeholder:text-text-muted border outline-none transition-all text-base text-center"
                style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-brand-accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
              />
              <span className="text-text-muted">-</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={4}
                value={phoneLast}
                onChange={(e) => handlePhoneChange(e, "last")}
                placeholder="0000"
                required
                className="w-full rounded-xl px-4 py-3.5 text-text-primary placeholder:text-text-muted border outline-none transition-all text-base text-center"
                style={{ background: "var(--color-bg-surface)", borderColor: "var(--color-border)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-brand-accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
              />
            </div>
          </div>

          {/* 날짜 선택 — 가로 스크롤 칩 */}
          <div>
            <label className="block text-text-secondary text-sm mb-3">
              체험 날짜 <span className="text-accent">*</span>
              <span className="text-text-muted ml-2 text-xs">(평일만 선택 가능)</span>
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {dateChips.map((chip) => {
                const isSelected = form.selectedDate === chip.date;
                return (
                  <button
                    key={chip.date}
                    type="button"
                    disabled={chip.disabled}
                    onClick={() => handleDateSelect(chip.date)}
                    className="flex flex-col items-center shrink-0 w-14 py-3 rounded-xl border transition-all text-center"
                    style={{
                      background: isSelected
                        ? "var(--color-brand-accent)"
                        : chip.disabled
                        ? "var(--color-bg-surface)"
                        : "var(--color-bg-surface)",
                      borderColor: isSelected
                        ? "var(--color-brand-accent)"
                        : "var(--color-border)",
                      opacity: chip.disabled ? 0.35 : 1,
                      cursor: chip.disabled ? "not-allowed" : "pointer",
                    }}
                  >
                    <span
                      className="text-xs font-semibold mb-0.5"
                      style={{ color: isSelected ? "#0A0A0A" : "var(--color-text-secondary)" }}
                    >
                      {chip.dayLabel}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: isSelected ? "#0A0A0A" : "var(--color-text-primary)" }}
                    >
                      {chip.dateLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 시간 선택 */}
          <div>
            <label className="block text-text-secondary text-sm mb-3">
              체험 시간 <span className="text-accent">*</span>
              {!form.selectedDate && (
                <span className="text-text-muted ml-2 text-xs">(날짜 먼저 선택)</span>
              )}
            </label>
            <div className="flex gap-2 flex-wrap">
              {form.selectedDate === "" ? (
                // 날짜 미선택 — 비활성 플레이스홀더
                ["저녁 7시", "저녁 8시", "저녁 9시"].map((label) => (
                  <div
                    key={label}
                    className="px-5 py-3 rounded-xl border text-sm font-medium"
                    style={{
                      background: "var(--color-bg-surface)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-muted)",
                      opacity: 0.4,
                    }}
                  >
                    {label}
                  </div>
                ))
              ) : (
                timeSlots.map((slot) => {
                  const isSelected = form.selectedTime === slot.value;
                  return (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => handleTimeSelect(slot.value)}
                      className="px-5 py-3 rounded-xl border text-sm font-medium transition-all active:scale-95"
                      style={{
                        background: isSelected
                          ? "var(--color-brand-accent)"
                          : "var(--color-bg-surface)",
                        borderColor: isSelected
                          ? "var(--color-brand-accent)"
                          : "var(--color-border)",
                        color: isSelected ? "#0A0A0A" : "var(--color-text-primary)",
                      }}
                    >
                      {slot.label}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 개인정보 동의 */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: "var(--color-bg-surface)" }}
          >
            <input
              id="consentAgreed"
              name="consentAgreed"
              type="checkbox"
              checked={form.consentAgreed}
              onChange={handleConsentChange}
              className="mt-0.5 w-5 h-5 shrink-0 cursor-pointer"
              style={{ accentColor: "var(--color-brand-accent)" }}
            />
            <label
              htmlFor="consentAgreed"
              className="text-text-secondary text-sm leading-relaxed cursor-pointer"
            >
              <span className="text-accent font-semibold">[필수]</span> 개인정보 수집·이용에 동의합니다.
              <br />
              <span className="text-text-muted text-xs">
                이름, 연락처를 무료체험 예약 안내 목적으로 수집하며, 목적 달성 후 즉시 파기합니다.
              </span>
            </label>
          </div>

          {/* 에러 메시지 */}
          {status === "error" && (
            <p className="text-red-400 text-sm">{errorMsg}</p>
          )}

          {/* 제출 버튼 */}
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
