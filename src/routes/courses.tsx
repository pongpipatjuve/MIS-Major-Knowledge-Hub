import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronRight, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { allCourses, isMis, regStore, useRegs } from "@/lib/courses";
import { CATEGORIES } from "@/lib/curriculum";
import { CategoryBadge, NoData, SampleBadge } from "@/components/Labels";

export const Route = createFileRoute("/courses")({
  validateSearch: (search: Record<string, unknown>) => ({
    search: typeof search.search === "string" ? search.search : "",
  }),
  head: () => ({
    meta: [
      { title: "ค้นหารายวิชา MIS — MIS Major Knowledge Hub" },
      {
        name: "description",
        content:
          "ค้นหารายวิชาสาขา MIS พร้อมป้ายหมวด GenEd วิชาแกน วิชาบังคับสาขา วิชาเลือกสาขา และวิชาเลือกเสรี",
      },
      { property: "og:title", content: "ค้นหารายวิชา MIS" },
      { property: "og:description", content: "ค้นหารายวิชาตามหมวดของหลักสูตร MIS" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Courses,
});

function Courses() {
  const { search } = Route.useSearch();
  const [q, setQ] = useState(search);
  const [cat, setCat] = useState("ทั้งหมด");
  const [showOther, setShowOther] = useState(false);
  const regs = useRegs();
  const terms = [...new Set(allCourses.map((c) => c.term).filter(Boolean))];
  const [term, setTerm] = useState("ทั้งหมด");
  const list = allCourses.filter(
    (c) =>
      (showOther || isMis(c)) &&
      (cat === "ทั้งหมด" || c.category === cat) &&
      (term === "ทั้งหมด" || c.term === term) &&
      `${c.code} ${c.nameEn} ${c.nameTh}`.toLowerCase().includes(q.toLowerCase()),
  );
  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${on ? "border-primary bg-primary-soft text-primary" : "bg-card"}`;
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-bold">ค้นหารายวิชา MIS</h1>
      <div className="flex overflow-hidden rounded-xl border bg-card focus-within:ring-2 focus-within:ring-ring">
        <Search className="m-3 h-5 w-5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="รหัสวิชา หรือชื่อรายวิชา..."
          className="flex-1 bg-transparent outline-none"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {["ทั้งหมด", ...CATEGORIES.map((c) => c.key)].map((x) => (
          <button
            key={x}
            title={CATEGORIES.find((c) => c.key === x)?.desc}
            onClick={() => setCat(x)}
            className={chip(cat === x)}
          >
            {x}
          </button>
        ))}
      </div>
      {terms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {["ทั้งหมด", ...terms].map((t) => (
            <button key={t} onClick={() => setTerm(t!)} className={chip(term === t)}>
              {t === "ทั้งหมด" ? "ทุกเทอม" : `เทอม${t}`}
            </button>
          ))}
        </div>
      )}
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={showOther}
          onChange={(e) => setShowOther(e.target.checked)}
        />{" "}
        แสดงวิชาตัวอย่างอื่นที่ไม่อยู่ในรายการหลักสูตร MIS
      </label>
      <p className="text-sm text-muted-foreground">
        ผลการค้นหา {list.length} รายการ · วิชาที่ไม่มีชื่อคือรหัสตามหลักสูตรที่ยังไม่มีรายละเอียด
      </p>
      <div className="space-y-3">
        {list.map((c) => (
          <div
            key={c.code}
            className="flex items-center gap-4 rounded-xl border bg-card p-4 transition hover:border-primary hover:shadow-card"
          >
            <Link to="/course/$code" params={{ code: c.code }} className="min-w-0 flex-1">
              <div className="text-lg font-bold">{c.code}</div>
              {c.stub ? (
                <div className="text-sm">
                  <NoData>ยังไม่มีข้อมูลชื่อวิชา</NoData>
                </div>
              ) : (
                <>
                  <div className="font-medium">{c.nameEn}</div>
                  <div className="text-sm text-muted-foreground">{c.nameTh}</div>
                </>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <CategoryBadge cat={c.category} />
                {c.term && (
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs">เทอม{c.term}</span>
                )}
                {c.isSample && <SampleBadge />}
              </div>
            </Link>
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
            <CourseScheduleButton
              code={c.code}
              active={regs.some((r) => r.code === c.code)}
              disabled={c.sections.length === 0}
            />
            <ChevronRight className="shrink-0 text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseScheduleButton({
  code,
  active,
  disabled,
}: {
  code: string;
  active: boolean;
  disabled: boolean;
}) {
  const course = allCourses.find((c) => c.code === code);
  const section = course?.sections[0];

  const handleClick = () => {
    if (!section) return;
    if (active) {
      regStore.remove(code);
      toast.success(`ถอนวิชา ${code} (SEC ${section.sec}) ออกจากตารางเรียนแล้ว`);
      return;
    }
    regStore.add(code, section.sec);
    toast.success(`เพิ่มวิชา ${code} (SEC ${section.sec}) ลงในตารางเรียนเรียบร้อยแล้ว`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active
          ? "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          : "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
      }`}
      aria-label={active ? `ถอน ${code} ออกจากตาราง` : `เพิ่ม ${code} ลงตาราง`}
    >
      {active ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      <span className="hidden sm:inline">{active ? "อยู่ในตารางแล้ว" : "เพิ่มลงตาราง"}</span>
    </button>
  );
}
