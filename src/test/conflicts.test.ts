import { describe, expect, it } from "vitest";
import { examConflicts, missingExam, timeConflicts } from "@/lib/conflicts";
import { CREDITS } from "@/lib/curriculum";

const s = (code: string, day: number, start: number, end: number, midterm?: string, final?: string) => ({ code, sec: "01", day, start, end, midterm, final });

describe("conflicts", () => {
  it("detects overlapping class times", () => {
    expect(timeConflicts([s("A", 0, 9, 12), s("B", 0, 11, 14)])).toHaveLength(1);
  });
  it("back-to-back classes do not conflict", () => {
    expect(timeConflicts([s("A", 0, 9, 12), s("B", 0, 12, 15)])).toHaveLength(0);
  });
  it("detects same exam slot", () => {
    expect(examConflicts([s("A", 0, 9, 12, "2026-10-01 09:00"), s("B", 1, 9, 12, "2026-10-01 09:00")], "midterm")).toHaveLength(1);
  });
  it("reports missing exam data", () => {
    expect(missingExam([s("A", 0, 9, 12)])).toHaveLength(1);
  });
});

describe("curriculum credits", () => {
  it("adds up to 138", () => {
    expect(CREDITS.genEd + CREDITS.specific + CREDITS.free).toBe(138);
    expect(CREDITS.core + CREDITS.majorRequired + CREDITS.majorElective + CREDITS.otherElective).toBe(99);
  });
});
