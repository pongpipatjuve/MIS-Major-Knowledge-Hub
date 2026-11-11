import catalogJson from "@/data/catalog.json";
import minorCodesJson from "@/data/minor-codes.json";
import reviewsJson from "@/data/reviews.json";
import shortNamesJson from "@/data/short-names.json";
import reviewLinksJson from "@/data/review-links.json";
import { PADLET_ARTS_URL } from "@/lib/config";
import { CORE_CODES, MAJOR_ELECTIVE_CODES, MAJOR_REQUIRED_CODES, categoryOf, type Category } from "./curriculum";

// ข้อมูลรายวิชามาจาก data/*.json (response ที่บันทึกจาก CU Get Reg) ผ่าน scripts/build-data.mjs -> src/data/catalog.json
// เก็บเฉพาะข้อเท็จจริงพื้นฐาน (รหัส ชื่อ หน่วยกิต เงื่อนไข ภาคที่เปิด) รัน `npm run build:data` ใหม่เมื่อเพิ่ม/เปลี่ยนไฟล์ใน data/

/** ภาคเรียนที่ใช้ตรวจว่าวิชา "เปิดสอน" (ปีการศึกษา/ภาค) */
export const ACTIVE_TERM = "2569/2";
export const ACTIVE_TERM_LABEL = "ภาคเรียนที่ 2 ปีการศึกษา 2569";

type RawCourse = {
  code: string;
  nameTh: string | null;
  nameEn: string | null;
  credits: number;
  condition: string | null;
  genEd: string;
  genEdNote: boolean;
  dept: string | null;
  terms: string[];
  access?: "open" | "cond" | "blocked" | "unknown";
  onlyFor?: string[];
  years?: number[];
  blockedBy?: string[];
  consent?: boolean;
};
const catalog = catalogJson as unknown as { terms: string[]; courses: RawCourse[] };

/** ชื่อหมวด GenEd ตามรหัสของ CU Get Reg; ถ้าเป็น GenEd แต่ไม่ทราบหมวด (ระบุแค่ในหมายเหตุ) จะไม่มีป้ายย่อย */
export const GENED_LABELS: Record<string, string> = {
  SC: "หมวดวิทย์",
  SO: "หมวดสังคม",
  HU: "หมวดมนุษย์",
  IN: "หมวดสหฯ",
};

/** รหัสวิชาที่อยู่ในรายการวิชาโทนอกคณะ (src/data/minor-codes.json) — ใช้ติดป้าย ไม่ได้บอกว่าเป็นวิชาโทของสาขาไหน */
const MINOR_CODES = new Set<string>(minorCodesJson as string[]);
export const MINOR_CODE_COUNT = MINOR_CODES.size;

/** ชื่อย่อรายวิชา (จากไฟล์ที่เพื่อนในกลุ่มรวบรวม src/data/short-names.json) ใช้เมื่อยังไม่มีชื่อเต็มจาก CU Get Reg ไม่ใช่ชื่อทางการ */
const SHORT_NAMES = shortNamesJson as unknown as Record<string, string>;

/**
 * วิชาระดับปริญญาตรีของคณะ CBS (รหัสขึ้นต้น 26) ที่รหัส 3 ตัวหลังตั้งแต่ 300 ขึ้นไป
 * ข้อสมมติ: "คณะฯ" ในข้อความหลักสูตรหมายถึง CBS และรหัส 3 ตัวหลังตั้งแต่ 500 ขึ้นไปเป็นระดับบัณฑิตศึกษา
 */
export const isCbs300 = (code: string) => {
  if (!/^26\d{5}$/.test(code)) return false;
  const n = Number(code.slice(4));
  return n >= 300 && n < 500;
};

/**
 * ตัวเลือกวิชาเลือก (วิชาระดับปริญญาตรีของคณะ รหัสตั้งแต่ 300 / วิชาโทนอกคณะ) ต้องไม่ใช่
 * - วิชา GenEd (นิสิตตั้งแต่ปีการศึกษา 2566 ได้ผล S/U นับเป็นวิชาเลือกหรือวิชาโทไม่ได้ แต่ลงเป็นวิชาเลือกเสรีได้)
 * - วิชาแกนหรือวิชาบังคับสาขา (ต้องเรียนอยู่แล้ว)
 */
const canBeElective = (category: Category | undefined, isGenEd: boolean) =>
  !isGenEd && category !== "วิชาแกน" && category !== "วิชาบังคับสาขา";

export type Review = { text: string; year?: string; tags?: string[] };
/** รีวิวที่ทีมคัดมาใส่เองใน src/data/reviews.json รูปแบบ { "2602313": [{ "text": "..." }] } */
const REVIEWS = reviewsJson as unknown as Record<string, Review[]>;
export const reviewsFor = (code: string): Review[] => REVIEWS[code] ?? [];

export type Course = {
  code: string;
  nameEn: string;
  nameTh: string;
  /** ชื่อย่อ (ไม่ใช่ชื่อทางการ) ว่างถ้าไม่มี แสดงเฉพาะเมื่อไม่มีชื่อเต็ม */
  shortName: string;
  credits: number;
  dept: string;
  condition: string | null;
  genEdType: string; // ค่าจาก CU Get Reg: NO/SC/SO/HU/IN
  isGenEd: boolean;
  genEdLabel?: string | undefined;
  isMinor: boolean; // อยู่ในรายการวิชาโทนอกคณะ และไม่ใช่วิชา GenEd
  inMinorList: boolean; // รหัสอยู่ในรายการที่สอบถามมา (รวมวิชาที่เป็น GenEd ซึ่งไม่นับเป็นวิชาโท)
  isCbs300: boolean; // วิชาระดับปริญญาตรีของคณะ รหัส 3 ตัวหลังตั้งแต่ 300 ขึ้นไป ที่ไม่ใช่ GenEd/แกน/บังคับ
  category?: Category | undefined;
  terms: string[]; // ภาคที่พบในข้อมูล เช่น ["2569/1","2569/2"]
  offeredNow: boolean;
  /** นิสิต MIS ลงได้ไหม สรุปจากหมายเหตุกลุ่มเรียน 2569/1–2 (ประมาณการ): open ไม่พบข้อจำกัด / cond มีเงื่อนไข (ชั้นปี ฯลฯ) / blocked ทุกกลุ่มเปิดเฉพาะสาขาอื่น / unknown ไม่มีข้อมูลกลุ่มเรียน */
  access: "open" | "cond" | "blocked" | "unknown";
  onlyFor: string[]; // สาขา/หลักสูตรที่กลุ่มเรียนเปิดให้เฉพาะ
  years: number[]; // ชั้นปีที่กลุ่มเรียนสำหรับ MIS/BUS ADMIN จำกัดไว้
  blockedBy: string[]; // วิชาก่อนหน้าที่ MIS ลงไม่ได้ ทำให้วิชานี้ลงไม่ได้ตามไปด้วย
  consent: boolean; // เงื่อนไขมี C.F. (ขออนุญาตได้)
  stub?: boolean;
};

/** ข้อความอธิบายข้อจำกัด (ว่างถ้าไม่มี) */
export function accessNote(c: Pick<Course, "access" | "onlyFor" | "years" | "blockedBy" | "consent">): string {
  if (c.access === "blocked" && c.blockedBy.length)
    return `ต้องผ่านวิชา ${c.blockedBy.join(", ")} ก่อน ซึ่งเป็นวิชาที่เปิดเฉพาะสาขาอื่น นิสิต MIS จึงลงไม่ได้${c.consent ? " เว้นแต่ได้รับอนุญาตจากอาจารย์/คณะ (C.F.)" : ""}`;
  if (c.access === "blocked")
    return `กลุ่มเรียนที่พบเปิดเฉพาะ ${c.onlyFor.join("/")} นิสิต MIS ลงไม่ได้ เว้นแต่ได้รับอนุญาตจากอาจารย์ผู้สอน`;
  if (c.access === "cond") {
    const parts: string[] = [];
    if (c.years.length) parts.push(`กลุ่มเรียนที่เปิดให้ MIS/บริหารธุรกิจจำกัดชั้นปี ${c.years.join(", ")}`);
    if (c.onlyFor.length) parts.push(`บางกลุ่มเปิดเฉพาะ ${c.onlyFor.join("/")}`);
    return parts.length ? parts.join(" · ") : "มีเงื่อนไขในหมายเหตุกลุ่มเรียน ตรวจสอบที่ CU Get Reg";
  }
  return "";
}

function toCourse(raw: RawCourse): Course {
  const fixed = categoryOf(raw.code);
  // วิชาในรายการหลักสูตร MIS (แกน/บังคับ/เลือกสาขา) ไม่ถือเป็น GenEd สำหรับนิสิต MIS แม้ CU Get Reg จะเปิดให้นิสิตคณะอื่นลงเป็น GenEd ด้วย (เช่น 2605311)
  const isGenEd = fixed === undefined && (raw.genEd !== "NO" || raw.genEdNote);
  const inMinorList = MINOR_CODES.has(raw.code);
  const minor = inMinorList && canBeElective(fixed, isGenEd);
  const cbs300 = isCbs300(raw.code) && canBeElective(fixed, isGenEd);
  const category: Category | undefined = fixed ?? (isGenEd ? "GenEd" : minor || cbs300 ? "วิชาเลือก" : undefined);
  return {
    code: raw.code,
    nameEn: raw.nameEn ?? "",
    nameTh: raw.nameTh ?? "",
    shortName: SHORT_NAMES[raw.code] ?? "",
    credits: raw.credits,
    dept: raw.dept ?? "",
    condition: raw.condition,
    genEdType: raw.genEd,
    isGenEd,
    genEdLabel: isGenEd ? GENED_LABELS[raw.genEd] : undefined,
    isMinor: minor,
    inMinorList,
    isCbs300: cbs300,
    category,
    terms: raw.terms,
    offeredNow: raw.terms.includes(ACTIVE_TERM),
    access: raw.access ?? "unknown",
    onlyFor: raw.onlyFor ?? [],
    years: raw.years ?? [],
    blockedBy: raw.blockedBy ?? [],
    consent: raw.consent ?? false,
  };
}

const courses: Course[] = catalog.courses.map(toCourse);

// รหัสที่ยังไม่มีในข้อมูล (รหัสตามหลักสูตร MIS และรหัสในรายการวิชาโทนอกคณะ) : แสดงเป็นรหัสเปล่า ๆ ไม่แต่งข้อมูลเอง
const stub = (code: string): Course => {
  const fixed = categoryOf(code);
  const inMinorList = MINOR_CODES.has(code);
  return {
    code,
    nameEn: "",
    nameTh: "",
    shortName: SHORT_NAMES[code] ?? "",
    credits: 0,
    dept: "",
    condition: null,
    genEdType: "NO",
    isGenEd: false,
    isMinor: inMinorList && canBeElective(fixed, false),
    inMinorList,
    isCbs300: isCbs300(code) && canBeElective(fixed, false),
    category: fixed ?? (inMinorList || isCbs300(code) ? "วิชาเลือก" : undefined),
    terms: [],
    offeredNow: false,
    access: "unknown",
    onlyFor: [],
    years: [],
    blockedBy: [],
    consent: false,
    stub: true,
  };
};
const known = new Set(courses.map((c) => c.code));
export const curriculumStubs: Course[] = [...new Set([...CORE_CODES, ...MAJOR_REQUIRED_CODES, ...MAJOR_ELECTIVE_CODES, ...MINOR_CODES])]
  .filter((code) => !known.has(code))
  .map(stub);

export const allCourses: Course[] = [...courses, ...curriculumStubs];
/** วิชาที่อยู่ในรายการวิชาของหลักสูตร MIS (แกน/บังคับ/เลือกสาขา) */
export const isMis = (c: Course) => c.category !== undefined && c.category !== "GenEd";

/** ข้อความสำหรับค้นหา: รหัส + ชื่อเต็ม + ชื่อย่อ */
export const searchText = (c: Pick<Course, "code" | "nameEn" | "nameTh" | "shortName">) =>
  `${c.code} ${c.nameEn} ${c.nameTh} ${c.shortName}`.toLowerCase();

export const findAnyCourse =(code: string) => allCourses.find((c) => c.code === code);

/** ลิงก์ไปหน้าวิชานั้นใน CU Get Reg (S = หลักสูตรปกติ) ส่วนรีวิวอยู่ด้านล่างของหน้านั้น */
const REVIEW_LINKS = reviewLinksJson as unknown as Record<string, string>;

export type ExternalReview = { label: string; hint: string; url: string };

/** ลิงก์รีวิวจากเว็บอื่นที่มีของวิชานี้จริง (ไม่ใช่ทุกวิชามี) ไม่รวม CU Get Reg ซึ่งมีหน้าวิชาแยกอยู่แล้ว */
export const externalReviewsFor = (code: string): ExternalReview[] => {
  const out: ExternalReview[] = [];
  const statx = REVIEW_LINKS[code];
  if (statx)
    out.push({
      label: "รีวิวจาก StatX Review (Google Sites)",
      hint: "เว็บรีวิววิชาเลือก 300+ ของรุ่นพี่ ปี 2567",
      url: statx,
    });
  if (PADLET_ARTS_URL && code.startsWith("22"))
    out.push({
      label: "Padlet รีวิวรวมวิชาคณะอักษรศาสตร์",
      hint: "รีวิวรวมหลายวิชาในหน้าเดียว ไม่มีหน้าแยกรายวิชา ใช้ค้นหาในหน้านั้น",
      url: PADLET_ARTS_URL,
    });
  return out;
};

export const cugetregUrl = (code: string) => `https://cugetreg.com/S/courses/${encodeURIComponent(code)}`;
