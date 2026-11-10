#!/usr/bin/env node
// แปลงไฟล์ response ดิบจาก F12 (data/graphql_courses*.json) เป็น src/data/catalog.json แบบเบา
// เก็บเฉพาะข้อเท็จจริงพื้นฐานของรายวิชา: รหัส ชื่อ หน่วยกิต เงื่อนไขรายวิชา หมวด GenEd ภาควิชา และภาคที่เปิดสอน
// ไม่เก็บกลุ่มเรียน เวลาเรียน ที่นั่ง ผู้สอน วันสอบ หรือคำอธิบายรายวิชา (ดูรายละเอียดเหล่านี้ได้ที่ CU Get Reg)
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

function* iterCourses(node) {
  if (Array.isArray(node)) {
    for (const v of node) yield* iterCourses(v);
  } else if (node && typeof node === "object") {
    if ("courseNo" in node && "sections" in node) yield node;
    else for (const v of Object.values(node)) yield* iterCourses(v);
  }
}

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
      };
      if (!cur) {
        byCode.set(code, info);
        continue;
      }
      cur.genEdNote ||= genEdByNote;
      if (!cur.terms.includes(term)) cur.terms.push(term);
      // ข้อมูลระดับวิชาใช้ของภาคล่าสุด
      if (term > cur._latest) {
        Object.assign(cur, { ...info, terms: cur.terms, genEdNote: cur.genEdNote, _latest: term });
      }
    }
  }

  const courses = [...byCode.values()]
    .map(({ _latest, ...c }) => ({ ...c, terms: c.terms.sort() }))
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
