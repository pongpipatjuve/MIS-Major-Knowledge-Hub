import { describe, expect, it } from "vitest";
import { examConflicts, missingExam, timeConflicts, toMinutes, type Exam, type Slot } from "@/lib/conflicts";
import { CREDITS } from "@/lib/curriculum";
import { ACTIVE_TERM, allCourses, findCourse, slotsFor } from "@/lib/courses";

const t = (hhmm: string) => toMinutes(hhmm)!;
const ex = (date: string, start: string, end: string): Exam => ({ date, start, end });
const s = (code: string, day: number, start: string, end: string, midterm?: Exam, final?: Exam): Slot => ({
  code,
  sec: "1",
  day,
  start: t(start),
  end: t(end),
  midterm,
  final,
});

describe("conflicts", () => {
  it("detects overlapping class times", () => {
    expect(timeConflicts([s("A", 0, "09:00", "12:00"), s("B", 0, "11:00", "14:00")])).toHaveLength(1);
  });
  it("back-to-back classes do not conflict", () => {
    expect(timeConflicts([s("A", 0, "09:00", "12:00"), s("B", 0, "12:00", "15:00")])).toHaveLength(0);
  });
  it("handles half-hour times", () => {
    expect(timeConflicts([s("A", 1, "09:30", "11:00"), s("B", 1, "10:30", "12:00")])).toHaveLength(1);
    expect(timeConflicts([s("A", 1, "09:30", "10:30"), s("B", 1, "10:30", "12:00")])).toHaveLength(0);
  });
  it("different days never conflict", () => {
    expect(timeConflicts([s("A", 0, "09:00", "12:00"), s("B", 1, "09:00", "12:00")])).toHaveLength(0);
  });
  it("a course's own two meetings are not reported as a conflict", () => {
    expect(timeConflicts([s("A", 0, "09:00", "12:00"), s("A", 0, "10:00", "11:00")])).toHaveLength(0);
  });
  it("detects overlapping exams on the same date", () => {
    const a = s("A", 0, "09:00", "10:00", ex("2569-09-24", "09:00", "12:00"));
    const b = s("B", 1, "09:00", "10:00", ex("2569-09-24", "11:00", "13:00"));
    expect(examConflicts([a, b], "midterm")).toHaveLength(1);
  });
  it("same-day exams that do not overlap are fine; different dates are fine", () => {
    const a = s("A", 0, "09:00", "10:00", ex("2569-09-24", "09:00", "11:00"));
    const b = s("B", 1, "09:00", "10:00", ex("2569-09-24", "13:00", "15:00"));
    const c = s("C", 1, "09:00", "10:00", ex("2569-09-25", "09:00", "11:00"));
    expect(examConflicts([a, b, c], "midterm")).toHaveLength(0);
  });
  it("reports missing exam data", () => {
    expect(missingExam([s("A", 0, "09:00", "10:00")])).toHaveLength(1);
  });
});

describe("real catalog", () => {
  it("loads real courses and has no leftover sample flag", () => {
    expect(allCourses.length).toBeGreaterThan(500);
    expect(allCourses.some((c) => "isSample" in c)).toBe(false);
  });
  it("2602313 is a MIS core course with sections in the active term", () => {
    const c = findCourse("2602313");
    expect(ACTIVE_TERM).toBe("2569/2");
    expect(c?.category).toBe("วิชาแกน");
    expect(c?.sections.length).toBeGreaterThan(0);
  });
  it("untimed (AR/IA) meetings produce no slots", () => {
    for (const c of allCourses)
      for (const sec of c.sections)
        for (const m of sec.meetings)
          if (!m.timed) expect(slotsFor(c, sec.sec).some((x) => x.day === m.day && x.start === m.start)).toBe(false);
  });
  it("every timed meeting has a valid day and start < end", () => {
    for (const c of allCourses)
      for (const sec of c.sections)
        for (const m of sec.meetings)
          if (m.timed) {
            expect(m.day).toBeGreaterThanOrEqual(0);
            expect(m.day).toBeLessThanOrEqual(6);
            expect(m.start).toBeLessThan(m.end);
          }
  });
  it("missing core codes stay as stubs, not invented", () => {
    const stub = allCourses.find((c) => c.code === "2301115");
    expect(stub?.stub).toBe(true);
    expect(stub?.sections).toHaveLength(0);
  });
});

describe("curriculum credits", () => {
  it("adds up to 138", () => {
    expect(CREDITS.genEd + CREDITS.specific + CREDITS.free).toBe(138);
    expect(CREDITS.core + CREDITS.majorRequired + CREDITS.majorElective + CREDITS.otherElective).toBe(99);
  });
});
