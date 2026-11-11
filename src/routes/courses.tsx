import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { ACTIVE_TERM_LABEL, GENED_LABELS, MINOR_CODE_COUNT, allCourses, isMis, accessNote, searchText } from "@/lib/courses";
import { CATEGORIES } from "@/lib/curriculum";
import { CategoryBadge, GenEdTag, MinorTag, NoData, Notice, ShortName } from "@/components/Labels";

export const Route = createFileRoute("/courses")({
  validateSearch: (search: Record<string, unknown>) => ({
    search: typeof search["search"] === "string" ? search["search"] : "",
  }),
  head: () => ({
    meta: [
      { title: "ค้นหารายวิชา MIS — MIS Major Knowledge Hub" },
      {
        name: "description",
        content:
          "ค้นหารายวิชาสาขา MIS วิชาโทนอกคณะ วิชาระดับปริญญาตรีรหัส 300 ขึ้นไป และ GenEd พร้อมเงื่อนไขรายวิชาและลิงก์ดูรีวิว",
      },
      { property: "og:title", content: "ค้นหารายวิชา MIS" },
      { property: "og:description", content: "ค้นหาวิชาเลือก วิชาโทนอกคณะ และ GenEd สำหรับนิสิต MIS" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Courses,
});

// ตัวกรองย่อยของหมวด "วิชาเลือก" (3 แหล่งตามหลักสูตร)
const ELECTIVE_SUBS = [
  "ทั้งหมด",
  "วิชาเลือกสาขา MIS",
  "วิชาระดับปริญญาตรี รหัส 3 ตัวหลังตั้งแต่ 300 ขึ้นไป",
  "วิชาโทนอกคณะ",
] as const;
type ElectiveSub = (typeof ELECTIVE_SUBS)[number];

function Courses() {
  const { search } = Route.useSearch();
  const [q, setQ] = useState(search);
  const [cat, setCat] = useState("ทั้งหมด");
  const [gened, setGened] = useState("ทั้งหมด");
  const [sub, setSub] = useState<ElectiveSub>("ทั้งหมด");
  const [showOther, setShowOther] = useState(false);
  const [onlyOffered, setOnlyOffered] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [limit, setLimit] = useState(50);
  const query = q.trim().toLowerCase();

  const matchesCategory = (c: (typeof allCourses)[number]) => {
    if (cat === "ทั้งหมด") return true;
    if (cat === "วิชาเลือก") {
      if (sub === "วิชาเลือกสาขา MIS") return c.category === "วิชาเลือกสาขา";
      if (sub === "วิชาโทนอกคณะ") return c.isMinor;
      if (sub === "วิชาระดับปริญญาตรี รหัส 3 ตัวหลังตั้งแต่ 300 ขึ้นไป") return c.isCbs300;
      return c.category === "วิชาเลือก" || c.category === "วิชาเลือกสาขา";
    }
    if (cat === "วิชาเลือกเสรี") return false; // วิชาเลือกเสรีคือวิชาอะไรก็ได้ จึงไม่แสดงเป็นรายการ
    if (cat === "GenEd") {
      if (c.category !== "GenEd") return false;
      if (gened === "ทั้งหมด") return true;
      return gened === "ไม่ระบุหมวด" ? !c.genEdLabel : c.genEdLabel === gened;
    }
    return c.category === cat;
  };

  const list = allCourses.filter(
    (c) =>
      (showOther || query !== "" || cat !== "ทั้งหมด" || isMis(c)) &&
      matchesCategory(c) &&
      (!onlyOffered || c.offeredNow) &&
      // วิชา 300+ ที่กลุ่มเรียนเปิดเฉพาะสาขาอื่น ซ่อนไว้ก่อน (เปิดดูได้ด้วยตัวเลือกด้านล่าง) ถ้าค้นหาด้วยชื่อ/รหัสจะแสดงพร้อมหมายเหตุ
      (showBlocked || query !== "" || !(c.isCbs300 && c.access === "blocked")) &&
      searchText(c).includes(query),
  );
  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${on ? "border-primary bg-primary-soft text-primary" : "bg-card"}`;
  const reset = () => setLimit(50);

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-bold">ค้นหารายวิชา MIS</h1>
      <div className="flex overflow-hidden rounded-xl border bg-card focus-within:ring-2 focus-within:ring-ring">
        <Search className="m-3 h-5 w-5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            reset();
          }}
          placeholder="รหัสวิชา หรือชื่อรายวิชา..."
          className="flex-1 bg-transparent outline-none"
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">หมวดในหลักสูตร</div>
        <div className="flex flex-wrap gap-2">
          {["ทั้งหมด", ...CATEGORIES.map((c) => c.key)].map((x) => (
            <button
              key={x}
              title={CATEGORIES.find((c) => c.key === x)?.desc}
              onClick={() => {
                setCat(x);
                reset();
              }}
              className={chip(cat === x)}
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      {cat === "GenEd" && (
        <>
          <div className="flex flex-wrap gap-2">
            {["ทั้งหมด", ...Object.values(GENED_LABELS), "ไม่ระบุหมวด"].map((g) => (
              <button
                key={g}
                onClick={() => {
                  setGened(g);
                  reset();
                }}
                className={chip(gened === g)}
              >
                {g}
              </button>
            ))}
          </div>
          <Notice>
            นิสิตตั้งแต่ปีการศึกษา 2566 ได้ผลวิชา GenEd เป็น <b>S/U (ไม่มีเกรด)</b> วิชา GenEd จึงนับเป็นวิชาเลือกหรือวิชาโทไม่ได้
            แต่ลงเป็นวิชาเลือกเสรีได้ โปรดตรวจสอบกับประกาศของคณะ
          </Notice>
        </>
      )}

      {cat === "วิชาเลือก" && (
        <>
          <div className="flex flex-wrap gap-2">
            {ELECTIVE_SUBS.map((x) => (
              <button
                key={x}
                onClick={() => {
                  setSub(x);
                  reset();
                }}
                className={chip(sub === x)}
              >
                {x}
              </button>
            ))}
          </div>
          {sub === "ทั้งหมด" && (
            <Notice>
              วิชาเลือกต้องเรียนอย่างน้อย 15 หน่วยกิต เลือกได้จาก 3 แหล่ง: วิชาเลือกสาขา MIS (ต้องเรียนครบ 12 หน่วยกิตก่อน ส่วนที่เกินนับเป็นวิชาเลือกได้),
              วิชาระดับปริญญาตรีของคณะฯ ที่รหัส 3 ตัวหลังตั้งแต่ 300 ขึ้นไป และวิชาโทนอกคณะ ไม่รวมวิชา GenEd
            </Notice>
          )}
          {sub === "วิชาเลือกสาขา MIS" && (
            <Notice>ต้องเรียนวิชาเลือกสาขาให้ครบ 12 หน่วยกิตก่อน หน่วยกิตส่วนที่เกินจึงนับเป็นวิชาเลือกได้</Notice>
          )}
          {sub === "วิชาระดับปริญญาตรี รหัส 3 ตัวหลังตั้งแต่ 300 ขึ้นไป" && (
            <Notice>
              วิชาระดับปริญญาตรีของคณะฯ ที่มีรหัส 3 ตัวหลังตั้งแต่ 300 ขึ้นไป ตามข้อความหลักสูตร ตอนนี้เราแสดงวิชาของ CBS (รหัสขึ้นต้น 26) ที่รหัส 3 ตัวหลัง 300-499
              โดยถือว่ารหัส 500 ขึ้นไปเป็นระดับบัณฑิตศึกษา ไม่รวมวิชา GenEd วิชาแกน และวิชาบังคับสาขา ข้อมูลอาจไม่ครบทุกวิชา โปรดตรวจสอบกับคณะ
              เราซ่อนวิชาที่หมายเหตุกลุ่มเรียนใน CU Get Reg (ภาค 2569/1–2) ระบุว่าเปิดเฉพาะสาขาอื่นทุกกลุ่ม (เช่น บัญชี การเงิน การตลาด โลจิสติกส์) ส่วนวิชาที่มีเงื่อนไขจะแสดงพร้อมหมายเหตุ
              การสรุปนี้เป็นการประมาณจากข้อความหมายเหตุ ไม่ใช่ข้อมูลทางการ โปรดตรวจที่ CU Get Reg หรือถามอาจารย์ผู้สอนก่อนลง
            </Notice>
          )}
          {sub === "วิชาโทนอกคณะ" && (
            <Notice>
              รายการวิชาโทนอกคณะ ({MINOR_CODE_COUNT} รหัส) ได้จากการสอบถามหน่วยงานโดยตรงโดยสมาชิกกลุ่ม ไม่ใช่ประกาศทางการ โปรดยืนยันกับภาควิชาเจ้าของวิชาก่อนลงทะเบียน
              วิชาที่ยังไม่มีชื่อเต็มในเว็บจะแสดง "ชื่อย่อ" ซึ่งไม่ใช่ชื่อทางการ (ดูชื่อเต็มได้ที่ CU Get Reg) และบางวิชาอาจไม่เปิดสอนในภาคเรียนนี้ โปรดตรวจที่ CU Get Reg
              วิชาที่ CU Get Reg ระบุเป็น GenEd (ตอนนี้ 14 วิชา ยังรอยืนยันกับภาควิชา) จะไม่แสดงในหมวดนี้ เพราะวิชา GenEd นับเป็นวิชาโทไม่ได้
            </Notice>
          )}
        </>
      )}

      {cat === "วิชาเลือกเสรี" && (
        <Notice>
          วิชาเลือกเสรี 6 หน่วยกิต คือลงวิชาอะไรของมหาวิทยาลัยก็ได้ ผลจะเป็นเกรดหรือ S/U ก็ได้ รวมวิชา GenEd (ได้ผล S/U แต่ยังนับเป็นวิชาเลือกเสรี) ยกเว้นวิชาบังคับที่ต้องเรียนอยู่แล้ว (รวมวิชาภาษาต่างประเทศ)
          และวิชาที่มีเงื่อนไขพิเศษ เช่น เปิดเฉพาะบางคณะหรือต้องผ่านวิชาก่อนหน้า ถ้าไม่มีเงื่อนไขเหล่านี้ลงได้ทุกวิชา จึงไม่แสดงเป็นรายการ ค้นหาวิชาที่สนใจได้ที่ CU Get Reg
          หรือพิมพ์ชื่อ/รหัสในช่องค้นหาด้านบนเพื่อดูวิชาที่เรามีข้อมูล
        </Notice>
      )}

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={onlyOffered}
          onChange={(e) => {
            setOnlyOffered(e.target.checked);
            reset();
          }}
        />{" "}
        เฉพาะวิชาที่พบว่าเปิดสอนใน{ACTIVE_TERM_LABEL}
      </label>
      {cat === "วิชาเลือก" && (
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showBlocked}
            onChange={(e) => {
              setShowBlocked(e.target.checked);
              reset();
            }}
          />{" "}
          แสดงวิชา 300+ ที่กลุ่มเรียนเปิดเฉพาะสาขาอื่น (ต้องขออนุญาตอาจารย์ผู้สอน)
        </label>
      )}
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" checked={showOther} onChange={(e) => setShowOther(e.target.checked)} />{" "}
        แสดงวิชาอื่นที่ไม่อยู่ในรายการวิชาของหลักสูตร MIS (พิมพ์ค้นหาแล้วจะค้นทุกวิชาอยู่แล้ว)
      </label>
      <p className="text-sm text-muted-foreground">
        ผลการค้นหา {list.length} รายการ · วิชาที่มีแค่ "ชื่อย่อ" หรือไม่มีชื่อ คือวิชาที่ยังไม่มีข้อมูลจาก CU Get Reg ในเว็บนี้ ซึ่งยังไม่ทราบว่าเปิดสอนภาคนี้หรือไม่
      </p>

      <div className="space-y-3">
        {list.slice(0, limit).map((c) => (
          <Link
            key={c.code}
            to="/course/$code"
            params={{ code: c.code }}
            className="flex items-center gap-4 rounded-xl border bg-card p-4 transition hover:border-primary hover:shadow-card"
          >
            <div className="min-w-0 flex-1">
              <div className="text-lg font-bold">{c.code}</div>
              {c.stub || (!c.nameEn && !c.nameTh) ? (
                <div className="text-sm">
                  {c.shortName ? <ShortName name={c.shortName} /> : <NoData>ยังไม่มีข้อมูลชื่อวิชา</NoData>}
                </div>
              ) : (
                <>
                  <div className="font-medium">{c.nameEn}</div>
                  <div className="text-sm text-muted-foreground">{c.nameTh}</div>
                </>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <CategoryBadge cat={c.category} />
                <GenEdTag label={c.genEdLabel} />
                <MinorTag show={c.isMinor} />
                {c.isCbs300 && (
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs">ปริญญาตรี รหัส 300 ขึ้นไป</span>
                )}
              </div>
              {c.isCbs300 && accessNote(c) && (
                <div className="mt-2 text-xs text-amber-700 dark:text-amber-400">⚠ {accessNote(c)}</div>
              )}
            </div>
            <div className="text-center">
              {c.stub ? (
                <div className="text-xs">
                  <NoData>— </NoData>
                </div>
              ) : (
                <div className="text-2xl font-bold">{c.credits}</div>
              )}
              <div className="text-xs text-muted-foreground">หน่วยกิต</div>
            </div>
            <ChevronRight className="shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
      {list.length > limit && (
        <button
          type="button"
          onClick={() => setLimit(limit + 50)}
          className="w-full rounded-xl border bg-card py-2 text-sm font-medium hover:border-primary"
        >
          แสดงเพิ่ม (เหลืออีก {list.length - limit} รายการ)
        </button>
      )}
    </div>
  );
}
