#!/usr/bin/env node
// แปลงไฟล์ response ดิบจาก F12 (data/graphql_courses*.json) เป็น src/data/catalog.json
// - รวมทุกไฟล์ ข้าม response ที่มี errors (data เป็น null)
// - ตัดฟิลด์ที่เว็บไม่ใช้ (เช่น __typename) ให้ไฟล์เล็กลง
// - ตัดวิชาซ้ำ (รหัสวิชา + ปีการศึกษา + ภาค + หลักสูตร เดียวกัน) เก็บอันที่มี section มากกว่า
// - ไม่แปลงวัน/เวลาเป็นตัวเลข (ค่า AR/IA ยังอยู่ตามต้นฉบับ) ส่วนนั้นทำใน src/lib/courses.ts
//
// ใช้: node scripts/build-data.mjs        (หรือ npm run build:data)
// ต้องใช้ Node 18+ ไม่ต้องติดตั้งแพ็กเกจเพิ่ม

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE_RE = /^graphql_courses.*\.json$/;
const CODE_RE = /^\d{7}$/;

const str = (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null);
const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

function exam(e) {
  if (!e || typeof e !== "object") return null;
  // date มาในรูป ISO แต่ปีเป็น พ.ศ. (เช่น 2570-04-29T00:00:00.000Z) จึงเก็บแค่ส่วนวันที่ ห้ามแปลงด้วย Date
  const date = typeof e.date === "string" ? e.date.slice(0, 10) : null;
  const start = str(e.period?.start);
  const end = str(e.period?.end);
  if (!date && !start && !end) return null;
  return { date, start, end };
}

function meeting(c) {
  return {
    type: str(c.type),
    day: str(c.dayOfWeek),
    start: str(c.period?.start),
    end: str(c.period?.end),
    room: str(c.room),
    building: str(c.building),
    teachers: Array.isArray(c.teachers) ? c.teachers.filter((t) => typeof t === "string") : [],
  };
}

function section(s) {
  return {
    sec: String(s.sectionNo ?? ""),
    closed: s.closed === true,
    enrolled: num(s.capacity?.current) ?? 0, // ข้อมูลบอกว่าเป็นจำนวนที่ลงแล้ว ไม่ใช่ที่นั่งว่าง
    max: num(s.capacity?.max) ?? 0,
    note: str(s.note),
    genEd: str(s.genEdType),
    classes: (s.classes ?? []).map(meeting),
  };
}

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
  const byKey = new Map();
  const stats = { files: files.length, errorResponses: 0, skippedInvalid: 0, duplicates: 0 };

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
      const offering = {
        year: Number(raw.academicYear),
        sem: String(raw.semester),
        program: String(raw.studyProgram ?? "S"),
        midterm: exam(raw.midterm),
        final: exam(raw.final),
        sections: (raw.sections ?? []).map(section),
      };
      const course = {
        code,
        abbr: str(raw.abbrName),
        nameTh: str(raw.courseNameTh),
        nameEn: str(raw.courseNameEn),
        faculty: str(raw.faculty),
        dept: str(raw.department),
        credits: num(raw.credit) ?? 0,
        creditHours: str(raw.creditHours),
        condition: str(raw.courseCondition),
        genEd: str(raw.genEdType) ?? "NO",
        descTh: str(raw.courseDescTh),
        descEn: str(raw.courseDescEn),
      };
      const key = `${code}|${offering.year}|${offering.sem}|${offering.program}`;
      const prev = byKey.get(key);
      if (prev) {
        stats.duplicates++;
        if (prev.offering.sections.length > offering.sections.length) continue; // เก็บอันที่ section มากกว่า
      }
      byKey.set(key, { course, offering });
    }
  }

  /** @type {Map<string, any>} */
  const courses = new Map();
  for (const { course, offering } of byKey.values()) {
    const cur = courses.get(course.code);
    if (!cur) {
      courses.set(course.code, { ...course, offerings: [offering] });
      continue;
    }
    cur.offerings.push(offering);
    // ข้อมูลระดับวิชาใช้ของภาคล่าสุด
    const latest = cur.offerings.reduce((a, b) => (b.year * 10 + Number(b.sem) > a.year * 10 + Number(a.sem) ? b : a));
    if (latest === offering) Object.assign(cur, course);
  }

  const list = [...courses.values()]
    .map((c) => ({
      ...c,
      offerings: c.offerings
        .sort((a, b) => a.year - b.year || Number(a.sem) - Number(b.sem))
        .map(({ program, ...rest }) => ({ ...rest, ...(program !== "S" ? { program } : {}) })),
    }))
    .sort((a, b) => a.code.localeCompare(b.code));

  const terms = [...new Set(list.flatMap((c) => c.offerings.map((o) => `${o.year}/${o.sem}`)))].sort();
  return { catalog: { terms, courses: list }, stats };
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
      `ตัดซ้ำ ${stats.duplicates}, response ที่ error ${stats.errorResponses}, ข้ามรหัสผิดรูปแบบ ${stats.skippedInvalid}\n` +
      `เขียน ${path.relative(ROOT, out)} (${(text.length / 1024).toFixed(0)} KB)`,
  );
}
