import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { GENED_LABELS, MINOR_CODE_COUNT, TERMS, allCourses, isMis, termsOf, accessNote, searchText } from "@/lib/courses";
import { CATEGORIES } from "@/lib/curriculum";
import { CategoryBadge, GenEdTag, MinorCallout, MinorTag, NoData, Notice, ShortName } from "@/components/Labels";

export const Route = createFileRoute("/courses")({
  validateSearch: (search: Record<string, unknown>) => ({
    search: typeof search["search"] === "string" ? search["search"] : "",
  }),
  head: () => ({
    meta: [
      { title: "ค้นหารายวิชา MIS — MIS Hub CBS" },
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

/** วิชาในรายการวิชาโทที่ CU Get Reg ระบุเป็น GenEd (ยังไม่แสดงเป็นวิชาโท) */
const MINOR_GENED_COUNT = allCourses.filter((c) => c.inMinorList && c.isGenEd).length;

type TermFilter = "ทั้งหมด" | (typeof TERMS)[number];
type Saved = {
  q: string;
  cat: string;
  gened: string;
  sub: ElectiveSub;
  showOther: boolean;
  term: TermFilter;
  showBlocked: boolean;
  limit: number;
  scroll: number;
};
/** จำตัวกรองและตำแหน่งที่เลื่อนไว้ เพื่อให้กดย้อนกลับจากหน้าวิชาแล้วกลับมาที่เดิม (เก็บในหน่วยความจำของหน้าเว็บ รีเฟรชแล้วรีเซ็ต) */
let saved: Saved | null = null;

function Courses() {
  const { search } = Route.useSearch();
  // ถ้าเข้ามาพร้อมคำค้นจากหน้าอื่น (search ใน URL) ให้เริ่มใหม่ ไม่ใช้ค่าที่จำไว้
  const init = search === "" ? saved : null;
  const [q, setQ] = useState(init?.q ?? search);
  const [cat, setCat] = useState(init?.cat ?? "ทั้งหมด");
  const [gened, setGened] = useState(init?.gened ?? "ทั้งหมด");
  const [sub, setSub] = useState<ElectiveSub>(init?.sub ?? "ทั้งหมด");
  const [showOther, setShowOther] = useState(init?.showOther ?? false);
  const [term, setTerm] = useState<TermFilter>(init?.term ?? "ทั้งหมด");
  const [showBlocked, setShowBlocked] = useState(init?.showBlocked ?? false);
  const [limit, setLimit] = useState(init?.limit ?? 50);
  const scrollRef = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = window.scrollY;
      if (saved) saved.scroll = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useLayoutEffect(() => {
    if (init) window.scrollTo(0, init.scroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    saved = { q, cat, gened, sub, showOther, term, showBlocked, limit, scroll: scrollRef.current };
  });
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
      (term === "ทั้งหมด" || termsOf(c).includes(term)) &&
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
          <Notice title="GenEd ได้ผล S/U นับเป็นวิชาเลือกหรือวิชาโทไม่ได้ แต่ลงเป็นวิชาเลือกเสรีได้">
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
            <Notice title="วิชาเลือกต้องเรียนอย่างน้อย 15 หน่วยกิต เลือกได้จาก 3 แหล่ง">
              วิชาเลือกต้องเรียนอย่างน้อย 15 หน่วยกิต เลือกได้จาก 3 แหล่ง: วิชาเลือกสาขา MIS (ต้องเรียนครบ 12 หน่วยกิตก่อน ส่วนที่เกินนับเป็นวิชาเลือกได้),
              วิชาระดับปริญญาตรีของคณะฯ ที่รหัส 3 ตัวหลังตั้งแต่ 300 ขึ้นไป และวิชาโทนอกคณะ ไม่รวมวิชา GenEd
            </Notice>
          )}
          {sub === "วิชาเลือกสาขา MIS" && (
            <Notice>ต้องเรียนวิชาเลือกสาขาให้ครบ 12 หน่วยกิตก่อน หน่วยกิตส่วนที่เกินจึงนับเป็นวิชาเลือกได้</Notice>
          )}
          {sub === "วิชาระดับปริญญาตรี รหัส 3 ตัวหลังตั้งแต่ 300 ขึ้นไป" && (
            <Notice title="วิชาของ CBS รหัส 3 ตัวหลัง 300–499 (ซ่อนวิชาที่เปิดเฉพาะสาขาอื่น)">
              วิชาระดับปริญญาตรีของคณะฯ ที่มีรหัส 3 ตัวหลังตั้งแต่ 300 ขึ้นไป ตามข้อความหลักสูตร ตอนนี้เราแสดงวิชาของ CBS (รหัสขึ้นต้น 26) ที่รหัส 3 ตัวหลัง 300-499
              โดยถือว่ารหัส 500 ขึ้นไปเป็นระดับบัณฑิตศึกษา ไม่รวมวิชา GenEd วิชาแกน และวิชาบังคับสาขา ข้อมูลอาจไม่ครบทุกวิชา โปรดตรวจสอบกับคณะ
              เราซ่อนวิชาที่หมายเหตุกลุ่มเรียนใน CU Get Reg (ภาค 2569/1–2) ระบุว่าเปิดเฉพาะสาขาอื่นทุกกลุ่ม (เช่น บัญชี การเงิน การตลาด โลจิสติกส์) ส่วนวิชาที่มีเงื่อนไขจะแสดงพร้อมหมายเหตุ
              การสรุปนี้เป็นการประมาณจากข้อความหมายเหตุ ไม่ใช่ข้อมูลทางการ โปรดตรวจที่ CU Get Reg หรือถามอาจารย์ผู้สอนก่อนลง
            </Notice>
          )}
          {sub === "วิชาโทนอกคณะ" && (
            <MinorCallout />
          )}
          {sub === "วิชาโทนอกคณะ" && (
            <Notice title={`ที่มาของรายการวิชาโท ${MINOR_CODE_COUNT} รหัส และข้อจำกัดของข้อมูล`}>
              รายการวิชาโทนอกคณะ ({MINOR_CODE_COUNT} รหัส) ได้จากการสอบถามหน่วยงานโดยตรงโดยสมาชิกกลุ่ม ไม่ใช่ประกาศทางการ โปรดยืนยันกับภาควิชาเจ้าของวิชาก่อนลงทะเบียน
              วิชาที่ยังไม่มีชื่อเต็มในเว็บจะแสดง "ชื่อย่อ" ซึ่งไม่ใช่ชื่อทางการ (ดูชื่อเต็มได้ที่ CU Get Reg) และบางวิชาอาจไม่เปิดสอนในภาคเรียนนี้ โปรดตรวจที่ CU Get Reg
              วิชาที่ CU Get Reg ระบุเป็น GenEd (ตอนนี้ {MINOR_GENED_COUNT} วิชา ยังรอยืนยันกับภาควิชา) จะไม่แสดงในหมวดนี้ เพราะวิชา GenEd นับเป็นวิชาโทไม่ได้
            </Notice>
          )}
        </>
      )}

      {cat === "วิชาเลือกเสรี" && (
        <Notice title="วิชาเลือกเสรี 6 หน่วยกิต ลงวิชาอะไรก็ได้ จึงไม่แสดงเป็นรายการ">
          วิชาเลือกเสรี 6 หน่วยกิต คือลงวิชาอะไรของมหาวิทยาลัยก็ได้ ผลจะเป็นเกรดหรือ S/U ก็ได้ รวมวิชา GenEd (ได้ผล S/U แต่ยังนับเป็นวิชาเลือกเสรี) ยกเว้นวิชาบังคับที่ต้องเรียนอยู่แล้ว (รวมวิชาภาษาต่างประเทศ)
          และวิชาที่มีเงื่อนไขพิเศษ เช่น เปิดเฉพาะบางคณะหรือต้องผ่านวิชาก่อนหน้า ถ้าไม่มีเงื่อนไขเหล่านี้ลงได้ทุกวิชา จึงไม่แสดงเป็นรายการ ค้นหาวิชาที่สนใจได้ที่ CU Get Reg
          หรือพิมพ์ชื่อ/รหัสในช่องค้นหาด้านบนเพื่อดูวิชาที่เรามีข้อมูล
        </Notice>
      )}

      <div className="space-y-2">
        <div className="text-sm font-medium">ภาคเรียน</div>
        <div className="flex flex-wrap gap-2">
          {(["ทั้งหมด", ...TERMS] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTerm(t);
                reset();
              }}
              className={chip(term === t)}
            >
              {t === "ทั้งหมด" ? "ทุกภาค" : `ภาค ${t}`}
            </button>
          ))}
        </div>
        {term !== "ทั้งหมด" && (
          <p className="text-xs text-muted-foreground">
            แสดงวิชาที่พบว่าเปิดสอนในภาค {term} จาก CU Get Reg และวิชาที่เพื่อนในกลุ่มแจ้งว่าลงได้ภาคนั้น (ไม่ใช่ข้อมูลทางการ) วิชาที่ไม่มีข้อมูลภาคเรียนเลยจะไม่แสดงเมื่อเลือกภาค โปรดตรวจที่ CU Get Reg
          </p>
        )}
      </div>
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
              {termsOf(c).length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {c.terms.length > 0 ? "เปิดสอน" : "เพื่อนแจ้งว่าลงได้"}: {[...termsOf(c)].sort().join(" · ")}
                </div>
              )}
              {c.isCbs300 && accessNote(c) && (
                <div className="mt-2 text-xs text-amber-700 dark:text-amber-400">⚠ {accessNote(c)}</div>
              )}
            </div>
            <div className="text-center">
              {c.stub && c.teamInfo ? (
                <div className="text-2xl font-bold">{c.teamInfo.credits}</div>
              ) : c.stub ? (
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
