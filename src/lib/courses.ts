import { useSyncExternalStore } from "react";
import catalogJson from "@/data/catalog.json";
import { CORE_CODES, MAJOR_ELECTIVE_CODES, MAJOR_REQUIRED_CODES, categoryOf, type Category } from "./curriculum";
import { toMinutes, type Exam, type Slot } from "./conflicts";

// ข้อมูลมาจาก data/*.json (response ดิบของ CU Get Reg) ผ่าน scripts/build-data.mjs -> src/data/catalog.json
// รัน `node scripts/build-data.mjs` ใหม่ทุกครั้งที่เพิ่ม/เปลี่ยนไฟล์ใน data/

/** ภาคเรียนที่ใช้วางแผน (ปีการศึกษา/ภาค) */
export const ACTIVE_TERM = "2569/2";
export const ACTIVE_TERM_LABEL = "ภาคเรียนที่ 2 ปีการศึกษา 2569";

export const DAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"] as const;
const DAY_CODES = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

type RawExam = { date: string | null; start: string | null; end: string | null } | null;
type RawClass = {
  type: string | null;
  day: string | null;
  start: string | null;
  end: string | null;
  room: string | null;
  building: string | null;
  teachers: string[];
};
type RawSection = {
  sec: string;
  closed: boolean;
  enrolled: number;
  max: number;
  note: string | null;
  genEd: string | null;
  classes: RawClass[];
};
type RawOffering = { year: number; sem: string; midterm: RawExam; final: RawExam; sections: RawSection[] };
type RawCourse = {
  code: string;
  abbr: string | null;
  nameTh: string | null;
  nameEn: string | null;
  dept: string | null;
  credits: number;
  creditHours: string | null;
  condition: string | null;
  genEd: string;
  descTh: string | null;
  descEn: string | null;
  offerings: RawOffering[];
};
const catalog = catalogJson as unknown as { terms: string[]; courses: RawCourse[] };

/** คาบเรียนหนึ่งช่วง: timed=false คือไม่มีวัน/เวลาจริง (AR/IA) เช่น นัดกันเอง */
export type Meeting = {
  type: string;
  timed: boolean;
  day: number; // -1 ถ้าไม่มีเวลาจริง
  start: number; // นาที; -1 ถ้าไม่มีเวลาจริง
  end: number;
  dayRaw: string;
  startRaw: string;
  endRaw: string;
  room: string;
  teachers: string[];
};
export type Section = {
  sec: string;
  closed: boolean;
  enrolled: number;
  max: number;
  note: string | null;
  meetings: Meeting[];
};
export type Course = {
  code: string;
  nameEn: string;
  nameTh: string;
  credits: number;
  dept: string;
  condition: string | null;
  creditHours: string | null;
  descTh: string | null;
  descEn: string | null;
  genEdType: string; // ค่าจาก CU Get Reg: NO/SC/SO/HU/IN
  isGenEd: boolean;
  genEdLabel?: string | undefined; // หมวดย่อยของ GenEd ถ้าทราบ
  category?: Category | undefined;
  offeredTerms: string[]; // เช่น ["2569/1","2569/2"]
  sections: Section[]; // ของ ACTIVE_TERM เท่านั้น
  midterm: Exam | null;
  final: Exam | null;
  stub?: boolean;
};

/** ชื่อหมวด GenEd ตามรหัสของ CU Get Reg; ถ้าเป็น GenEd แต่ไม่ทราบหมวด (เช่น ระบุแค่ในหมายเหตุ) จะไม่มีป้ายย่อย */
export const GENED_LABELS: Record<string, string> = {
  SC: "หมวดวิทย์",
  SO: "หมวดสังคม",
  HU: "หมวดมนุษย์",
  IN: "หมวดสหฯ",
};

const GENED_NOTE_NEG = /\b(NO|NON|NOT)[\s-]*GEN[\s-]*ED/i;
const GENED_NOTE = /GEN[\s-]*ED/i;

function toMeeting(c: RawClass): Meeting {
  const di = DAY_CODES.indexOf(c.day ?? "");
  const s = toMinutes(c.start);
  const e = toMinutes(c.end);
  const timed = di >= 0 && s !== null && e !== null && e > s;
  return {
    type: c.type ?? "",
    timed,
    day: timed ? di : -1,
    start: timed ? s : -1,
    end: timed ? e : -1,
    dayRaw: c.day ?? "",
    startRaw: c.start ?? "",
    endRaw: c.end ?? "",
    room: [c.building, c.room].filter((x) => x && x !== "IA" && x !== "AR").join(" ") || "",
    teachers: c.teachers,
  };
}

function toCourse(raw: RawCourse): Course {
  const active = raw.offerings.find((o) => `${o.year}/${o.sem}` === ACTIVE_TERM);
  const sections: Section[] = (active?.sections ?? []).map((s) => ({
    sec: s.sec,
    closed: s.closed,
    enrolled: s.enrolled,
    max: s.max,
    note: s.note,
    meetings: s.classes.map(toMeeting),
  }));
  // วิชาเป็น GenEd ถ้าระดับวิชาไม่ใช่ NO หรือ section ใดระบุ GenEd ใน note (และไม่ใช่ NO GEN-ED)
  const isGenEd =
    raw.genEd !== "NO" ||
    sections.some((s) => s.note && GENED_NOTE.test(s.note) && !GENED_NOTE_NEG.test(s.note));
  return {
    code: raw.code,
    nameEn: raw.nameEn ?? "",
    nameTh: raw.nameTh ?? "",
    credits: raw.credits,
    dept: raw.dept ?? "",
    condition: raw.condition && raw.condition !== "-" ? raw.condition : null,
    creditHours: raw.creditHours,
    descTh: raw.descTh,
    descEn: raw.descEn,
    genEdType: raw.genEd,
    isGenEd,
    genEdLabel: GENED_LABELS[raw.genEd],
    category: categoryOf(raw.code) ?? (isGenEd ? "GenEd" : undefined),
    offeredTerms: raw.offerings.map((o) => `${o.year}/${o.sem}`),
    sections,
    midterm: active?.midterm ?? null,
    final: active?.final ?? null,
  };
}

const courses: Course[] = catalog.courses.map(toCourse);

// รหัสตามหลักสูตร MIS ที่ยังไม่มีในข้อมูลที่ดึงมา: แสดงเป็นรหัสเปล่า ๆ ไม่แต่งข้อมูลเอง
const stub = (code: string): Course => ({
  code,
  nameEn: "",
  nameTh: "",
  credits: 0,
  dept: "",
  condition: null,
  creditHours: null,
  descTh: null,
  descEn: null,
  genEdType: "NO",
  isGenEd: false,
  category: categoryOf(code),
  offeredTerms: [],
  sections: [],
  midterm: null,
  final: null,
  stub: true,
});
export const curriculumStubs: Course[] = [...CORE_CODES, ...MAJOR_REQUIRED_CODES, ...MAJOR_ELECTIVE_CODES]
  .filter((code) => !courses.some((c) => c.code === code))
  .map(stub);

export const allCourses: Course[] = [...courses, ...curriculumStubs];
/** วิชาที่อยู่ในรายการหลักสูตร MIS (แกน/บังคับ/เลือกสาขา) */
export const isMis = (c: Course) => c.category !== undefined && c.category !== "GenEd";
export const isOfferedNow = (c: Course) => c.sections.length > 0;

export const findCourse = (code: string) => courses.find((c) => c.code === code);
export const findAnyCourse = (code: string) => allCourses.find((c) => c.code === code);

export const dataTerms = catalog.terms;

/** ข้อความสั้น ๆ ของคาบเรียน เช่น "จันทร์ 09:30-12:30" หรือ "ไม่ระบุเวลา (AR)" */
export const fmtMeeting = (m: Meeting) =>
  m.timed
    ? `${DAYS[m.day]} ${m.startRaw}-${m.endRaw}`
    : `ไม่ระบุวัน/เวลา${m.dayRaw ? ` (${m.dayRaw})` : ""}`;

/** แปลงวันที่สอบ "2569-09-24" เป็น "24/09/2569" */
export const fmtExamDate = (e: Exam | null) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e?.date ?? "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : null;
};

/** แปลง section ที่ลงทะเบียนไว้เป็น Slot สำหรับตรวจชน (เฉพาะคาบที่มีเวลาจริง) */
export function slotsFor(course: Course, sec: string): Slot[] {
  const s = course.sections.find((x) => x.sec === sec);
  if (!s) return [];
  return s.meetings
    .filter((m) => m.timed)
    .map((m) => ({
      code: course.code,
      sec: s.sec,
      day: m.day,
      start: m.start,
      end: m.end,
      midterm: course.midterm,
      final: course.final,
    }));
}

// ที่เก็บรายวิชาที่เลือกในตาราง (ในหน่วยความจำ — รีเฟรชแล้วหาย)
type Reg = { code: string; sec: string };
let regs: Reg[] = [];
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
export const regStore = {
  add(code: string, sec: string) {
    regs = [...regs.filter((r) => r.code !== code), { code, sec }];
    emit();
  },
  remove(code: string) {
    regs = regs.filter((r) => r.code !== code);
    emit();
  },
};
export function useRegs() {
  return useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => regs,
    () => regs,
  );
}
