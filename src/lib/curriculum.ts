// ข้อมูลตามหลักสูตรที่ผู้ใช้ให้มา — ต้องตรวจทานกับประกาศทางการก่อนใช้จริง
export type Category = "GenEd" | "วิชาแกน" | "วิชาบังคับสาขา" | "วิชาเลือกสาขา" | "วิชาเลือก" | "วิชาเลือกเสรี";

export const CATEGORIES: { key: Category; desc: string }[] = [
  { key: "GenEd", desc: "หมวดวิชาศึกษาทั่วไป 33 หน่วยกิต แบ่งเป็น 2 ส่วน: (1) GenEd 12 หน่วยกิต เลือกรายวิชาที่ศูนย์การศึกษาทั่วไปประกาศ (ต้องเป็นวิชานอกคณะฯ) นิสิตตั้งแต่ปีการศึกษา 2566 ได้ผลเป็น S/U (ไม่มีเกรด) และนับเป็นวิชาเลือกหรือวิชาโทไม่ได้ (2) ภาษาต่างประเทศ 21 หน่วยกิต เป็นวิชาบังคับ 7 วิชา ได้ผลเป็นเกรด ยกเว้น 5500415 ที่บังคับเรียนแต่ได้ผลเป็น S/U" },
  { key: "วิชาแกน", desc: "วิชาที่นิสิตคณะฯ ทุกคนต้องเรียน (51 หน่วยกิต)" },
  { key: "วิชาบังคับสาขา", desc: "วิชาบังคับของสาขา MIS (21 หน่วยกิต)" },
  { key: "วิชาเลือกสาขา", desc: "วิชาเลือกของสาขา MIS ต้องเรียนอย่างน้อย 12 หน่วยกิต ถ้าเรียนครบ 12 หน่วยกิตแล้วยังเรียนวิชาเลือกสาขาเพิ่ม หน่วยกิตส่วนที่เกินจะนับเป็นวิชาเลือกได้ ไม่จำเป็นต้องเรียนตามปีในตารางแผนการเรียน แต่แต่ละวิชาเปิดเฉพาะบางภาคเรียน (ภาคต้น = เทอม 1, ภาคปลาย = เทอม 2) จึงเลื่อนไปเรียนปีอื่นได้เฉพาะในเทอมที่วิชานั้นเปิด" },
  { key: "วิชาเลือก", desc: "ต้องเรียนอย่างน้อย 15 หน่วยกิต เลือกได้จาก 3 แหล่ง: วิชาเลือกของสาขา MIS (ส่วนที่เกิน 12 หน่วยกิต), วิชาระดับปริญญาตรีของคณะฯ ที่รหัส 3 ตัวหลังตั้งแต่ 300 ขึ้นไป, และวิชาโทนอกคณะ ไม่รวมวิชา GenEd" },
  { key: "วิชาเลือกเสรี", desc: "6 หน่วยกิต ลงวิชาอะไรของมหาวิทยาลัยก็ได้ ผลจะเป็นเกรดหรือ S/U ก็ได้ รวมวิชา GenEd (ได้ผล S/U แต่ยังนับเป็นวิชาเลือกเสรี) ยกเว้นวิชาบังคับที่ต้องเรียนอยู่แล้ว (รวมวิชาภาษาต่างประเทศ 21 หน่วยกิต) และวิชาที่มีเงื่อนไขพิเศษ เช่น เปิดเฉพาะบางคณะหรือต้องผ่านวิชาก่อนหน้า วิชา 1 หน่วยกิตบางวิชาที่ไม่ใช่ GenEd อาจไม่อยู่ในข้อมูลของเว็บนี้ ให้ค้นที่ CU Get Reg" },
];

export const CREDITS = {
  total: 138,
  genEd: 33, // หมวดศึกษาทั่วไปทั้งหมด = genEdOnly + foreignLanguage
  genEdOnly: 12,
  foreignLanguage: 21,
  maxPerTerm: 22,
  specific: 99,
  core: 51,
  majorRequired: 21,
  majorElective: 12,
  otherElective: 15,
  free: 6,
};

export const CORE_CODES = ["2301115", "2601115", "2601116", "2601255", "2602122", "2602313", "2602327", "2602344", "2602416", "2603245", "2603330", "2604161", "2604271", "2604361", "2605311", "2900111", "3401255", "3401256"];
export const MAJOR_REQUIRED_CODES = ["2602355", "2602359", "2602363", "2602429", "2602432", "2602446", "2602478"];
export const MAJOR_ELECTIVE_CODES = ["2602349", "2602364", "2602365", "2602367", "2602368", "2602441", "2602449"];

export const OTHER_ELECTIVE_RULES = [
  "วิชาเลือกของสาขาวิชาระบบสารสนเทศทางการจัดการ",
  "วิชาระดับปริญญาตรีของคณะฯ ที่รหัส 3 ตัวหลังตั้งแต่ 300 ขึ้นไป",
  "วิชาโทนอกคณะฯ",
];

export const GENED_GROUPS = ["สังคมศาสตร์", "มนุษยศาสตร์", "วิทยาศาสตร์และคณิตศาสตร์", "สหศาสตร์", "ภาษาต่างประเทศ"];

/** วิชาภาษาต่างประเทศ 21 หน่วยกิต (บังคับ ได้เกรด ยกเว้น 5500415 เป็น S/U) แสดงในหน้าหลักสูตรเท่านั้น ไม่ใช้ตัดสินหมวดวิชา */
export const FOREIGN_LANGUAGE_COURSES: { code: string; en: string; th: string; prereq?: string; term: 1 | 2; su?: boolean }[] = [
  { code: "5500111", en: "EXP ENG I", th: "ภาษาอังกฤษเพื่อการเรียนรู้ในชีวิตจริง 1", term: 1 },
  { code: "5500112", en: "EXP ENG II", th: "ภาษาอังกฤษเพื่อการเรียนรู้ในชีวิตจริง 2", prereq: "5500111", term: 2 },
  { code: "5500215", en: "BAS BUS ENG WRIT", th: "การเขียนภาษาอังกฤษธุรกิจขั้นพื้นฐาน", prereq: "5500112", term: 1 },
  { code: "5500225", en: "BUS ENG CORRESP", th: "การเขียนจดหมายภาษาอังกฤษธุรกิจ", prereq: "5500215", term: 2 },
  { code: "5500313", en: "BUS ENG ORAL COMM", th: "การสนทนาภาษาอังกฤษธุรกิจ", prereq: "5500225", term: 1 },
  { code: "5500315", en: "ADV BUS ORAL COM", th: "การสนทนาภาษาอังกฤษธุรกิจขั้นสูง", prereq: "5500313", term: 2 },
  { code: "5500415", en: "EFF BUS COM", th: "ภาษาอังกฤษเพื่อการสื่อสารทางธุรกิจอย่างมีประสิทธิภาพ", prereq: "5500315", term: 1, su: true },
];

/** หลักการวางแผนลงทะเบียน (สรุปจากความเข้าใจของกลุ่ม ไม่ใช่ประกาศทางการ) */
export const REGISTRATION_TIPS = [
  `ลงทะเบียนได้ไม่เกิน ${CREDITS.maxPerTerm} หน่วยกิตต่อภาคเรียนปกติ (ภาคฤดูร้อนมีเพดานต่างจากนี้ โปรดตรวจประกาศ)`,
  "วิชาเลือกและวิชาเลือกเสรีไม่จำเป็นต้องลงตามตารางแผนการเรียนเสมอ ถ้าเทอมไหนมีวิชาบังคับไม่ถึงเพดาน เช่น 18 หน่วยกิต จะลงเพิ่มอีก 1 วิชา (3 หน่วยกิต) หรือหลายวิชา เช่น 3 หน่วยกิต 1 วิชา กับ 1 หน่วยกิต 1 วิชา ก็ได้ ตราบใดที่รวมไม่เกินเพดาน",
  "วิชาเลือกสาขาไม่จำเป็นต้องเรียนตามปีในตาราง แต่แต่ละวิชาเปิดเฉพาะบางเทอม เช่น ในข้อมูลปีการศึกษา 2569 วิชา 2602365, 2602367 และ 2602364 เปิดเฉพาะภาคปลาย (เทอม 2) จึงเลื่อนไปเรียนปีอื่นได้เฉพาะในเทอม 2 เท่านั้น และเทอมที่เปิดอาจเปลี่ยนในปีอื่น โปรดตรวจ CU Get Reg",
  "ก่อนลงวิชาเลือกสาขาให้ตรวจวิชาที่ต้องเรียนก่อน (เช่น Machine Learning กับ Python) ที่ Reg Chula และสอบถามอาจารย์ผู้สอน เพราะข้อมูลที่เรามีจาก CU Get Reg ไม่ระบุเงื่อนไขวิชานี้ และเงื่อนไขอาจเปลี่ยนตามปีหรือขออนุญาตได้",
  "วิชา 1 หน่วยกิตที่ลงเป็นวิชาเลือกเสรีอาจไม่อยู่ในข้อมูลของเว็บนี้ ให้ค้นที่ CU Get Reg",
];

/** หมายเหตุเฉพาะรายวิชา แสดงในหน้าวิชา */
export const COURSE_NOTES: Record<string, string> = {
  "2602449":
    "วิชา Workshop in MIS เป็นวิชาฝึกงานที่ไม่มีหน่วยกิต ลงเพื่อให้ปรากฏใน transcript (ไปเล่าให้อาจารย์ฟังว่าฝึกงานเป็นอย่างไร) อยู่ในกลุ่มวิชาเลือกสาขา แต่ไม่ได้ช่วยนับหน่วยกิตวิชาเลือกสาขาครบ 12 หน่วยกิต",
};

export type PlanKind = "วิชาแกน" | "วิชาบังคับสาขา" | "วิชาเลือกสาขา" | "ภาษาต่างประเทศ" | "GenEd" | "วิชาเลือก" | "วิชาเลือกเสรี";
export type PlanRow = { code?: string; name: string; nameTh?: string; credits: number; kind: PlanKind; note?: string; uncounted?: boolean };
export type PlanTerm = { year: number; term: "ต้น" | "ปลาย"; total: number; rows: PlanRow[] };

const gened: PlanRow = { name: "วิชาเลือกหมวดวิชาศึกษาทั่วไป (GenEd)", credits: 3, kind: "GenEd" };
const elective: PlanRow = { name: "วิชาเลือก", credits: 3, kind: "วิชาเลือก" };
const free: PlanRow = { name: "วิชาเลือกเสรี", credits: 3, kind: "วิชาเลือกเสรี" };
const core = (code: string, name: string, credits = 3): PlanRow => ({ code, name, credits, kind: "วิชาแกน" });
const req = (code: string, name: string): PlanRow => ({ code, name, credits: 3, kind: "วิชาบังคับสาขา" });
const majorElective = (code: string, name: string, extra: Partial<PlanRow> = {}): PlanRow => ({ code, name, credits: 3, kind: "วิชาเลือกสาขา", ...extra });
const lang = (code: string): PlanRow => {
  const c = FOREIGN_LANGUAGE_COURSES.find((x) => x.code === code)!;
  return { code, name: c.en, nameTh: c.th, credits: 3, kind: "ภาษาต่างประเทศ", ...(c.su ? { note: "ผล S/U" } : {}) };
};

/** แผนการเรียนตามไฟล์ "โปรแกรมการศึกษา สำหรับนิสิตรหัส 66_MIS" (รหัส 66 เป็นต้นไป) ภาคต้น = เทอม 1, ภาคปลาย = เทอม 2 ไม่ใช่ประกาศทางการ */
export const PLAN66: PlanTerm[] = [
  { year: 1, term: "ต้น", total: 18, rows: [core("2301115", "CALCULUS BUS I"), core("2601115", "FIN ACCTG"), core("2602122", "INTRO BUSINESS", 0), core("2603245", "INTRO BUS STAT"), core("2900111", "ECONOMICS I"), lang("5500111"), gened] },
  { year: 1, term: "ปลาย", total: 18, rows: [core("2601116", "INTMD ACCTG"), core("2602313", "MGT/ORGANIZATION"), core("2604161", "INTRO FIN"), core("2605311", "PRIN MKTG"), lang("5500112"), gened] },
  { year: 2, term: "ต้น", total: 18, rows: [core("2601255", "MNGL ACCTG"), req("2602359", "EXCEL BUS"), core("2604271", "BUS ECON"), core("2604361", "BUSINESS FINANCE"), lang("5500215"), gened] },
  { year: 2, term: "ปลาย", total: 21, rows: [core("2602327", "QUANT BUS ANAL"), req("2602446", "DATABASE APPLN MGT"), req("2602432", "ORG BEHAVIOR"), core("2603330", "BUSINESS STAT"), lang("5500225"), majorElective("2602365", "PYTHON BUS ANA"), gened] },
  { year: 3, term: "ต้น", total: 18, rows: [core("2602344", "PROD OPER MGT"), req("2602429", "BUS INFO SYS A/D"), core("3401255", "BUSINESS LAW I"), lang("5500313"), majorElective("2602349", "ERP"), elective] },
  { year: 3, term: "ปลาย", total: 21, rows: [req("2602355", "ENT IT GOV"), req("2602363", "MANAGERIAL COM"), core("3401256", "BUSINESS LAW II"), lang("5500315"), majorElective("2602367", "MACHINE LEARN BUS"), majorElective("2602364", "CON TOPIC MIS"), elective] },
  {
    year: 4,
    term: "ต้น",
    total: 18,
    rows: [
      core("2602416", "BUSINESS STRATEGY"),
      req("2602478", "SEM MIS"),
      lang("5500415"),
      majorElective("2602368", "DIGIT BUS"),
      majorElective("2602441", "INFO SYS PROJ MGT", { uncounted: true, note: "ในไฟล์พิมพ์ต่อใต้ 2602368 และไม่นับในยอดรวมของเทอม" }),
      majorElective("2602449", "WORKSHOP IN MIS", { credits: 0, uncounted: true, note: "ไม่มีหน่วยกิต ลงเพื่อให้ขึ้น transcript (ตารางในไฟล์พิมพ์รหัสเป็น 2602499 แต่หมายเหตุท้ายไฟล์และ CU Get Reg ใช้ 2602449)" }),
      elective,
      free,
    ],
  },
  { year: 4, term: "ปลาย", total: 9, rows: [elective, elective, free] },
];

export const PENDING_QUESTIONS = [
  "ข้อความ “ถ้าลงเกิน 12 จะกลายเป็นวิชาเลือก” หมายความว่าหน่วยกิตวิชาเลือกสาขาที่เกิน 12 นับรวมในวิชาเลือก (อย่างน้อย 15) ใช่หรือไม่",
  "วิชาเลือก 15 หน่วยกิต มีขั้นต่ำแยกตามแต่ละกลุ่ม (สาขา MIS / รหัส 300 ขึ้นไป / วิชาโทนอกคณะ) หรือไม่",
  "เพดานหน่วยกิตของภาคฤดูร้อน",
  "เทอมที่เปิดสอน (ต้น/ปลาย) ของวิชาเลือกสาขาในปีการศึกษาอื่น ๆ",
];

export function categoryOf(code: string): Category | undefined {
  if (CORE_CODES.includes(code)) return "วิชาแกน";
  if (MAJOR_REQUIRED_CODES.includes(code)) return "วิชาบังคับสาขา";
  if (MAJOR_ELECTIVE_CODES.includes(code)) return "วิชาเลือกสาขา";
  return undefined;
}
