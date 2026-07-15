import scheduleConfig from "@/config/schedule.json";

export interface TimeSlot {
  value: string;
  label: string;
}

export interface DateChip {
  date: string;       // YYYY-MM-DD
  dayLabel: string;   // 월, 화, 수, 목, 금
  dateLabel: string;  // M/D
  disabled: boolean;
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function toLocalDateString(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** config 기준으로 예약 가능한 날짜 칩 목록을 반환 */
export function getAvailableDates(): DateChip[] {
  const { startOffsetDays, endOffsetDays } = scheduleConfig.bookingRange;
  const holidays = new Set(scheduleConfig.holidays.dates);
  const chips: DateChip[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = startOffsetDays; i <= endOffsetDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dow = d.getDay(); // 0=일, 6=토
    const dateStr = toLocalDateString(d);

    const isWeekend = dow === 0 || dow === 6;
    const isHoliday = holidays.has(dateStr);
    const disabled = isWeekend || isHoliday;

    chips.push({
      date: dateStr,
      dayLabel: DAY_LABELS[dow],
      dateLabel: `${d.getMonth() + 1}/${d.getDate()}`,
      disabled,
    });
  }

  return chips;
}

/** 선택한 날짜의 요일에 맞는 시간 슬롯을 반환 */
export function getTimeSlotsForDate(dateStr: string): TimeSlot[] {
  const d = new Date(dateStr + "T00:00:00");
  const dow = d.getDay(); // 1=월 ... 5=금
  const slots = (scheduleConfig.timeSlots as unknown as Record<string, TimeSlot[]>)[String(dow)];
  return slots ?? [];
}
