#!/usr/bin/env node
// แปลงไฟล์ response ดิบจาก F12 (data/graphql_courses*.json) เป็น src/data/catalog.json แบบเบา
// เก็บเฉพาะข้อเท็จจริงพื้นฐานของรายวิชา: รหัส ชื่อ หน่วยกิต เงื่อนไขรายวิชา หมวด GenEd ภาควิชา และภาคที่เปิดสอน
// ไม่เก็บกลุ่มเรียน เวลาเรียน ที่นั่ง ผู้สอน วันสอบ หรือคำอธิบายรายวิชา (ดูรายละเอียดเหล่านี้ได้ที่ CU Get Reg)
// เก็บเฉพาะ "ผลสรุป" ว่าลงได้ไหม (access/onlyFor/years) ที่คำนวณจากหมายเหตุกลุ่มเรียน ไม่เก็บข้อความหมายเหตุดิบ
//
// ใช้: node scripts/build-data.mjs        (หรือ npm run build:data)
// ต้องใช้ Node 18+ ไม่ต้องติดตั้งแพ็กเกจเพิ่ม

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE_RE = /^graphql_courses.*\.json$/;
const CODE_RE = /^\d{7}$/;
// หมายเหตุกลุ่มเรียนที่บอกว่าเป็น GenEd (และไม่ใช่ "NO GEN-ED" / "NON-GEN ED")
const GENED_NOTE = /GEN[\s-]*ED/i;
const GENED_NOTE_NEG = /\b(NO|NON|NOT)[\s-]*GEN[\s-]*ED/i;

const str = (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null);
const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

// ---------- สรุปว่านิสิต MIS ลงได้ไหม จากหมายเหตุของกลุ่มเรียน (ใช้สรุปเท่านั้น ไม่เก็บข้อความหมายเหตุดิบ) ----------
// หมายเหตุเป็นข้อความอิสระ (เช่น "ACCOUNTING ONLY", "MIS YEAR 3 ONLY") จึงเป็นการประมาณ
// หลักการ: ถ้าไม่แน่ใจ ให้ถือว่า "ลงได้แบบมีเงื่อนไข" ไม่ซ่อนวิชา
const MAJOR_PATTERNS = [
  ["บัญชี", /\bACC(OU?NTING|TG)?\b|\bAIS\b|AUDITING|MNGL TRACK|\bTRACK\b/],
  ["การเงิน", /FINANCE/],
  ["การตลาด", /MARKET|\bMKT\b/],
  ["โลจิสติกส์", /LOGIS/],
  ["ผู้ประกอบการ", /ENTRE/],
  ["สถิติ/ประกันภัย/BIT", /\bSTAT|\bBIT\b|\bINS\b|DATASCI/],
  ["สาขาอื่น", /\bBUS-?ED\b|\bSAR\b/],
];
const MIS_INCLUDED = /\bMIS\b|BUS\s*ADMIN|\bBBA\b|COMMERCE|\bCBS\b|\bCOMM\b/;
const OTHER_PROGRAM = /\bBSD\b|CHULA LGO|HKUST|\bEXEC|\bLGO\b/;
const IGNORABLE = /GENED|GEN-ED|S\/U|TAUGH?T IN ENG|TEACH IN ENG|\bKCM\b/;

function classifyNote(note) {
  const n = (note ?? "").toUpperCase().trim();
  if (n === "") return { kind: "open", only: [], years: [] };
  const years = [...n.matchAll(/(?:YEAR|YR\.?)\s*(\d)|(\d)\s*(?:ST|ND|RD|TH)?\s*(?:YEAR|YR)|'\s*(\d)\b/g)].map((m) => Number(m[1] ?? m[2] ?? m[3]));
  const range = n.match(/\b(\d)\s*-\s*(\d)\b/);
  if (range) for (let y = Number(range[1]); y <= Number(range[2]); y++) years.push(y);
  const only = MAJOR_PATTERNS.filter(([, re]) => re.test(n)).map(([label]) => label);
  if (OTHER_PROGRAM.test(n) && !/\bMIS\b|BUS\s*ADMIN/.test(n)) return { kind: "other", only: ["หลักสูตรพิเศษ/นานาชาติ"], years: [] };
  if (MIS_INCLUDED.test(n)) return years.length ? { kind: "mis", only: [], years } : { kind: "open", only: [], years: [] };
  if (only.length > 0) return { kind: "other", only, years };
  const rest = n.replace(IGNORABLE, "").replace(/[^A-Z0-9]/g, "");
  if (rest === "") return { kind: "open", only: [], years: [] };
  if (years.length > 0 && /^(YEAR|YR|\d|-|ONLY|AND|TO|\s|,|ST|ND|RD|TH|'|\.)+$/i.test(n.replace(IGNORABLE, "").trim())) return { kind: "mis", only: [], years };
  return { kind: "unknown", only: [], years };
}

/** สรุประดับวิชา: open = มีกลุ่มที่ไม่จำกัด, cond = ลงได้แต่มีเงื่อนไข/จำกัดบางอย่าง, blocked = ทุกกลุ่มจำกัดเฉพาะสาขาอื่น, unknown = ไม่มีข้อมูลกลุ่มเรียน */
function summarizeAccess(sections) {
  if (!sections || sections.length === 0) return { access: "unknown", onlyFor: [], years: [] };
  const cls = sections.map((s) => classifyNote(s.note));
  const onlyFor = [...new Set(cls.flatMap((c) => c.only))];
  const years = [...new Set(cls.filter((c) => c.kind === "mis").flatMap((c) => c.years))].sort();
  if (cls.some((c) => c.kind === "open")) return { access: "open", onlyFor, years: [] };
  if (cls.every((c) => c.kind === "other")) return { access: "blocked", onlyFor, years: [] };
  return { access: "cond", onlyFor, years };
}

function* iterCourses(node) {
  if (Array.isArray(node)) {
    for (const v of node) yield* iterCourses(v);
  } else if (node && typeof node === "object") {
    if ("courseNo" in node && "sections" in node) yield node;
    else for (const v of Object.values(node)) yield* iterCourses(v);
  }
}

export { classifyNote, summarizeAccess };

export function buildCatalog(dataDir = path.join(ROOT, "data")) {
  const files = readdirSync(dataDir).filter((f) => FILE_RE.test(f)).sort();
  /** @type {Map<string, any>} */
  const byCode = new Map();
  const stats = { files: files.length, errorResponses: 0, skippedInvalid: 0 };

  for (const file of files) {
    const data = JSON.parse(readFileSync(path.join(dataDir, file), "utf8").replace(/^﻿/, ""));
    for (const entry of Array.isArray(data) ? data : [data]) {
      if (entry?.errors) stats.errorResponses++;
    }
    for (const raw of iterCourses(data)) {
      const code = String(raw.courseNo);
      if (!CODE_RE.test(code)) {
        stats.skippedInvalid++;
        continue;
      }
      const term = `${Number(raw.academicYear)}/${String(raw.semester)}`;
      const genEdByNote = (raw.sections ?? []).some(
        (s) => typeof s.note === "string" && GENED_NOTE.test(s.note) && !GENED_NOTE_NEG.test(s.note),
      );
      const cur = byCode.get(code);
      const info = {
        code,
        nameTh: str(raw.courseNameTh),
        nameEn: str(raw.courseNameEn),
        credits: num(raw.credit) ?? 0,
        condition: str(raw.courseCondition) && str(raw.courseCondition) !== "-" ? str(raw.courseCondition) : null,
        genEd: str(raw.genEdType) ?? "NO",
        genEdNote: genEdByNote,
        dept: str(raw.department),
        terms: [term],
        _latest: term,
        _acc: { term, ...summarizeAccess(raw.sections) },
      };
      if (!cur) {
        byCode.set(code, info);
        continue;
      }
      cur.genEdNote ||= genEdByNote;
      if (!cur.terms.includes(term)) cur.terms.push(term);
      // เก็บผลสรุปการลงได้ของภาคล่าสุดที่มีข้อมูลกลุ่มเรียน
      if (info._acc.access !== "unknown" && (cur._acc.access === "unknown" || term > cur._acc.term)) cur._acc = info._acc;
      // ข้อมูลระดับวิชาใช้ของภาคล่าสุด
      if (term > cur._latest) {
        Object.assign(cur, { ...info, terms: cur.terms, genEdNote: cur.genEdNote, _latest: term, _acc: cur._acc });
      }
    }
  }

  const courses = [...byCode.values()]
    .map(({ _latest, _acc, ...c }) => {
      // วิชาระดับ 300-499 ของภาควิชาการบัญชี (2601) ถือเป็นวิชาของสาขาบัญชี: หมายเหตุกลุ่มเรียนมักว่าง
      // แต่ต้องผ่านวิชาบัญชีก่อนหน้า นิสิต MIS ลงไม่ได้ในทางปฏิบัติ (ตามข้อมูลจากสมาชิกกลุ่ม) จึงไม่ถือว่า "ลงได้"
      const acctDept = /^2601[34]\d\d$/.test(c.code) && _acc.access !== "cond";
      const acc = acctDept ? { access: "blocked", onlyFor: ["บัญชี"], years: [] } : _acc;
      return {
        ...c,
        terms: c.terms.sort(),
        access: acc.access,
        ...(acc.onlyFor.length ? { onlyFor: acc.onlyFor } : {}),
        ...(acc.years.length ? { years: acc.years } : {}),
      };
    })
    .sort((a, b) => a.code.localeCompare(b.code));
  const terms = [...new Set(courses.flatMap((c) => c.terms))].sort();
  return { catalog: { terms, courses }, stats };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const { catalog, stats } = buildCatalog();
  if (catalog.courses.length === 0) {
    console.error("ไม่พบวิชาในโฟลเดอร์ data/ (ต้องมีไฟล์ชื่อ graphql_courses*.json)");
    process.exit(1);
  }
  const out = path.join(ROOT, "src", "data", "catalog.json");
  mkdirSync(path.dirname(out), { recursive: true });
  const text = JSON.stringify(catalog);
  writeFileSync(out, text + "\n", "utf8");
  console.log(
    `อ่าน ${stats.files} ไฟล์ -> ${catalog.courses.length} วิชา (ภาค: ${catalog.terms.join(", ")}) ` +
      `response ที่ error ${stats.errorResponses}, ข้ามรหัสผิดรูปแบบ ${stats.skippedInvalid}\n` +
      `เขียน ${path.relative(ROOT, out)} (${(text.length / 1024).toFixed(0)} KB)`,
  );
}
