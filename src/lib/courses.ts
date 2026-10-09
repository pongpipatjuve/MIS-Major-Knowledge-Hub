import { useSyncExternalStore } from "react";

export type Section = {
  sec: string;
  day: number; // 0=Mon..4=Fri
  start: number;
  end: number;
  room: string;
  instructor: string;
  seats: number;
  left: number;
};

export type Course = {
  code: string;
  nameEn: string;
  nameTh: string;
  credits: number;
  dept: "บัญชี" | "บริหารธุรกิจ" | "สถิติ";
  major: string;
  type: "วิชาบังคับ" | "วิชาเลือก";
  restriction: string;
  sections: Section[];
  grades: number[]; // A,B+,B,C+,C,D+,D,F
  rating: number;
  reviews: { name: string; year: string; stars: number; text: string; tags: string[] }[];
};

export const DAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];
export const GRADES = ["A", "B+", "B", "C+", "C", "D+", "D", "F"];

export const courses: Course[] = [
  {
    code: "2602313", nameEn: "MANAGEMENT AND ORGANIZATION", nameTh: "การจัดการและองค์การ", credits: 3,
    dept: "บริหารธุรกิจ", major: "การจัดการ", type: "วิชาบังคับ", restriction: "ไม่มีข้อจำกัด",
    sections: [
      { sec: "01", day: 0, start: 9, end: 12, room: "ห้อง 2301 อาคารคณะพาณิชย์ฯ", instructor: "รศ. ดร.สมชาย ใจดี", seats: 40, left: 18 },
      { sec: "02", day: 2, start: 13, end: 16, room: "ห้อง 2205 อาคารคณะพาณิชย์ฯ", instructor: "ผศ. ดร.กนกวรรณ ศรีสวัสดิ์", seats: 40, left: 5 },
    ],
    grades: [28, 24, 20, 18, 6, 3, 1, 0], rating: 4.6,
    reviews: [
      { name: "นิสิตปี 3", year: "1/2566", stars: 5, text: "วิชานี้ช่วยให้เข้าใจภาพรวมขององค์การ อาจารย์สอนดีมาก มีกรณีศึกษาจากธุรกิจจริง แนะนำเลยครับ", tags: ["เนื้อหาแน่น", "อาจารย์สอนดี"] },
      { name: "นิสิตปี 2", year: "2/2566", stars: 4, text: "งานกลุ่มเยอะหน่อยแต่ได้ฝึกนำเสนอ เหมาะกับคนที่อยากเรียนการจัดการ", tags: ["งานกลุ่ม", "ได้ความรู้จริง"] },
    ],
  },
  {
    code: "2602314", nameEn: "ORGANIZATIONAL BEHAVIOR", nameTh: "พฤติกรรมองค์การ", credits: 3,
    dept: "บริหารธุรกิจ", major: "การจัดการ", type: "วิชาเลือก", restriction: "ปี 2 ขึ้นไป",
    sections: [{ sec: "01", day: 1, start: 13, end: 16, room: "ห้อง 3102", instructor: "อ. ดร.พิมพ์ชนก วงศ์ทอง", seats: 50, left: 22 }],
    grades: [22, 26, 22, 14, 10, 4, 2, 0], rating: 4.3,
    reviews: [{ name: "นิสิตปี 3", year: "1/2566", stars: 4, text: "สนุก ได้เข้าใจคนในที่ทำงาน", tags: ["งานไม่หนัก"] }],
  },
  {
    code: "2602355", nameEn: "HUMAN RESOURCE MANAGEMENT", nameTh: "การจัดการทรัพยากรมนุษย์", credits: 3,
    dept: "บริหารธุรกิจ", major: "การจัดการทรัพยากรมนุษย์", type: "วิชาเลือก", restriction: "ไม่มีข้อจำกัด",
    sections: [{ sec: "01", day: 3, start: 9, end: 12, room: "ห้อง 2204", instructor: "รศ. ดร.วิไล ทองดี", seats: 40, left: 12 }],
    grades: [20, 25, 25, 15, 10, 3, 2, 0], rating: 4.4, reviews: [],
  },
  {
    code: "2603201", nameEn: "PRINCIPLES OF MARKETING", nameTh: "หลักการตลาด", credits: 3,
    dept: "บริหารธุรกิจ", major: "การตลาด", type: "วิชาบังคับ", restriction: "ไม่มีข้อจำกัด",
    sections: [{ sec: "01", day: 1, start: 9, end: 12, room: "ห้อง 4201", instructor: "ผศ. ดร.ธนา รุ่งเรือง", seats: 60, left: 30 }],
    grades: [25, 25, 20, 15, 8, 4, 3, 0], rating: 4.5, reviews: [],
  },
  {
    code: "2604210", nameEn: "CORPORATE FINANCE", nameTh: "การเงินธุรกิจ", credits: 3,
    dept: "บริหารธุรกิจ", major: "การเงิน", type: "วิชาบังคับ", restriction: "ต้องผ่าน 2601101",
    sections: [{ sec: "01", day: 4, start: 9, end: 12, room: "ห้อง 2304", instructor: "รศ. ดร.ปิยะ มั่นคง", seats: 45, left: 8 }],
    grades: [18, 20, 24, 18, 12, 5, 3, 0], rating: 4.1, reviews: [],
  },
  {
    code: "2601201", nameEn: "INTERMEDIATE ACCOUNTING I", nameTh: "การบัญชีขั้นกลาง 1", credits: 3,
    dept: "บัญชี", major: "การบัญชี", type: "วิชาบังคับ", restriction: "เฉพาะนิสิตบัญชี",
    sections: [{ sec: "01", day: 2, start: 9, end: 12, room: "ห้อง 2101", instructor: "ศ. ดร.สุนีย์ บุญมา", seats: 80, left: 20 }],
    grades: [15, 20, 25, 20, 12, 5, 3, 0], rating: 4.0, reviews: [],
  },
  {
    code: "2603330", nameEn: "BUSINESS STATISTICS", nameTh: "สถิติธุรกิจ", credits: 3,
    dept: "สถิติ", major: "สถิติ", type: "วิชาบังคับ", restriction: "ไม่มีข้อจำกัด",
    sections: [{ sec: "01", day: 3, start: 13, end: 16, room: "ห้อง 2201", instructor: "อ. ดร.ณัฐ แสงทอง", seats: 60, left: 25 }],
    grades: [20, 18, 22, 18, 12, 6, 4, 0], rating: 4.2, reviews: [],
  },
];

export const findCourse = (code: string) => courses.find((c) => c.code === code);

// simple in-memory registration store
type Reg = { code: string; sec: string };
let regs: Reg[] = [{ code: "2602313", sec: "01" }];
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
