// ตรวจเวลาเรียนและวันสอบชนกัน
// เวลาเก็บเป็น "นาทีนับจากเที่ยงคืน" (เช่น 09:30 = 570) เพื่อรองรับครึ่งชั่วโมง
// คาบที่ไม่มีเวลาจริง (AR/IA) จะไม่ถูกแปลงเป็น Slot จึงไม่ถูกนำมาตรวจชน

export type Exam = { date: string | null; start: string | null; end: string | null };

export type Slot = {
  code: string;
  sec: string;
  day: number; // 0=จันทร์ ... 6=อาทิตย์
  start: number;
  end: number;
  midterm?: Exam | null | undefined;
  final?: Exam | null | undefined;
};

export const toMinutes = (hhmm: string | null | undefined): number | null => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm ?? "");
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h > 23 || min > 59 ? null : h * 60 + min;
};

export const fmtMinutes = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export const overlaps = (a: Slot, b: Slot) => a.day === b.day && a.start < b.end && b.start < a.end;

export function timeConflicts(slots: Slot[]) {
  const out: [Slot, Slot][] = [];
  for (let i = 0; i < slots.length; i++)
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i]!;
      const b = slots[j]!;
      if (a.code !== b.code && overlaps(a, b)) out.push([a, b]);
    }
  return out;
}

const examOverlap = (a: Exam, b: Exam) => {
  if (!a.date || !b.date || a.date !== b.date) return false;
  const as = toMinutes(a.start);
  const ae = toMinutes(a.end);
  const bs = toMinutes(b.start);
  const be = toMinutes(b.end);
  // ไม่มีเวลาสอบ แต่วันเดียวกัน -> ถือว่าอาจชน (ปลอดภัยไว้ก่อน)
  if (as === null || ae === null || bs === null || be === null) return true;
  return as < be && bs < ae;
};

/** รวม slot ของวิชาเดียวกันให้เหลือแถวเดียวต่อวิชา เพื่อไม่ให้รายงานชนซ้ำ */
const uniqueByCourse = (slots: Slot[]) => [...new Map(slots.map((s) => [s.code, s])).values()];

export function examConflicts(slots: Slot[], kind: "midterm" | "final") {
  const list = uniqueByCourse(slots);
  const out: [Slot, Slot][] = [];
  for (let i = 0; i < list.length; i++)
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i]![kind];
      const b = list[j]![kind];
      if (a && b && examOverlap(a, b)) out.push([list[i]!, list[j]!]);
    }
  return out;
}

/** วิชาที่ไม่มีข้อมูลวันสอบ (กลางภาคหรือปลายภาค) — ตรวจชนไม่ได้ ต้องบอกผู้ใช้ */
export const missingExam = (slots: Slot[]) =>
  uniqueByCourse(slots).filter((s) => !s.midterm?.date || !s.final?.date);
