import { describe, expect, it } from "vitest";
import minorCodes from "@/data/minor-codes.json";
import { CREDITS } from "@/lib/curriculum";
import { ACTIVE_TERM, allCourses, isCbs300, reviewsFor , accessNote } from "@/lib/courses";

describe("real catalog", () => {
  it("loads real courses from the data files", () => {
    expect(allCourses.filter((c) => !c.stub).length).toBeGreaterThan(500);
  });
  it("2602313 is a MIS core course and is offered in the active term", () => {
    const c = allCourses.find((x) => x.code === "2602313");
    expect(c?.category).toBe("วิชาแกน");
    expect(c?.credits).toBe(3);
    expect(c?.offeredNow).toBe(c?.terms.includes(ACTIVE_TERM));
  });
  it("keeps no timetable, seat or instructor data in the catalog", async () => {
    const raw = JSON.stringify((await import("@/data/catalog.json")).default);
    expect(raw).not.toMatch(/"sections"|"capacity"|"teachers"|"midterm"|"final"/);
  });
  it("curriculum codes missing from the data stay as empty stubs, not invented", () => {
    const stubs = allCourses.filter((c) => c.stub);
    const real = new Set(allCourses.filter((c) => !c.stub).map((c) => c.code));
    for (const c of stubs) {
      expect(c.nameEn).toBe("");
      expect(c.nameTh).toBe("");
      expect(c.credits).toBe(0);
      expect(real.has(c.code)).toBe(false);
    }
  });
});

describe("tags and filters", () => {
  it("tags as minor only listed codes that are not GenEd, and keeps every listed code in the catalog", () => {
    const codes = minorCodes as string[];
    expect(new Set(codes).size).toBe(codes.length);
    for (const c of allCourses) {
      expect(c.inMinorList).toBe(codes.includes(c.code));
      expect(c.isMinor).toBe(c.inMinorList && !c.isGenEd);
    }
    for (const code of codes) expect(allCourses.some((c) => c.code === code)).toBe(true);
  });
  it("GenEd courses are never elective candidates (minor or 300+)", () => {
    for (const c of allCourses.filter((x) => x.isGenEd)) {
      expect(c.isMinor).toBe(false);
      expect(c.isCbs300).toBe(false);
      expect(c.category).toBe("GenEd");
    }
  });
  it("MIS curriculum courses are not tagged as GenEd even if CU Get Reg also offers them as GenEd", () => {
    const c = allCourses.find((x) => x.code === "2605311");
    expect(c?.category).toBe("วิชาแกน");
    expect(c?.isGenEd).toBe(false);
    expect(c?.genEdLabel).toBeUndefined();
  });
  it("elective candidates get the วิชาเลือก category unless they have a fixed MIS category", () => {
    for (const c of allCourses.filter((x) => (x.isMinor || x.isCbs300) && !x.isGenEd)) {
      expect(["วิชาเลือก", "วิชาเลือกสาขา"]).toContain(c.category);
    }
  });
  it("CBS 300-499 rule uses the faculty prefix and the last three digits", () => {
    expect(isCbs300("2602344")).toBe(true);
    expect(isCbs300("2602299")).toBe(false);
    expect(isCbs300("2601511")).toBe(false); // รหัส 500 ขึ้นไป
    expect(isCbs300("2301315")).toBe(false); // ไม่ใช่ CBS
    expect(isCbs300("260234")).toBe(false);
  });
  it("does not tag core or required MIS courses as 300+ elective candidates", () => {
    for (const c of allCourses)
      if (c.category === "วิชาแกน" || c.category === "วิชาบังคับสาขา") expect(c.isCbs300).toBe(false);
    expect(allCourses.find((c) => c.code === "2602313")?.isCbs300).toBe(false);
  });
  it("returns an empty list when a course has no curated reviews", () => {
    expect(reviewsFor("0000000")).toEqual([]);
  });
});

describe("curriculum credits", () => {
  it("adds up to 138", () => {
    expect(CREDITS.genEd + CREDITS.specific + CREDITS.free).toBe(138);
    expect(CREDITS.core + CREDITS.majorRequired + CREDITS.majorElective + CREDITS.otherElective).toBe(99);
  });

  it("สรุปว่านิสิต MIS ลงวิชา 300+ ได้ไหมจากหมายเหตุกลุ่มเรียน", () => {
    const get = (code: string) => allCourses.find((c) => c.code === code);
    expect(get("2601415")?.access).toBe("blocked"); // ADVANCED AUDITING เฉพาะสาขาบัญชี
    expect(get("2601415")?.onlyFor).toContain("บัญชี");
    for (const k of ["2601352", "2601354", "2601361", "2601421"]) expect(get(k)?.access).toBe("blocked"); // วิชาภาควิชาบัญชี 300+
    expect(get("2602374")?.access).toBe("blocked"); // โลจิสติกส์
    expect(accessNote(get("2601415")!)).toContain("อาจารย์");
    expect(get("2604361")?.access).not.toBe("blocked"); // BUSINESS FINANCE เปิดให้ BUS ADMIN
    expect(allCourses.some((c) => c.isCbs300 && c.access === "open")).toBe(true);
    // ต้องผ่านวิชาของสาขาอื่นก่อน -> ลงไม่ได้ตามไปด้วย
    expect(get("2603313")?.access).toBe("blocked");
    expect(get("2603313")?.blockedBy).toContain("2603312");
    expect(get("2603373")?.consent).toBe(true); // PRER ... OR C.F.
    // วิชาแกน/บังคับของ MIS ไม่ถูกซ่อนแม้กลุ่มเรียนจะเขียนสาขาอื่น
    expect(get("2602313")?.access).not.toBe("blocked");
    expect(get("2602344")?.access).not.toBe("blocked");
  });
});
