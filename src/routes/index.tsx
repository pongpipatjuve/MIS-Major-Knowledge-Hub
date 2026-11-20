import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  FileText,
  ListChecks,
  Search,
  GraduationCap,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { allCourses, searchText } from "@/lib/courses";
import { CUGETREG_URL, PETRA_URL, REG_CHULA_URL } from "@/lib/config";
import { Collapsible, MinorCallout } from "@/components/Labels";
import { CREDITS } from "@/lib/curriculum";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MIS Hub CBS — คู่มือวางแผนวิชาเลือกนิสิต MIS จุฬาฯ" },
      {
        name: "description",
        content:
          "คู่มือวางแผนหน่วยกิตและค้นหาวิชาเลือก วิชาโท สำหรับนิสิต MIS คณะพาณิชยศาสตร์และการบัญชี จุฬาฯ (เว็บของนิสิต)",
      },
      { property: "og:title", content: "MIS Hub CBS" },
      {
        property: "og:description",
        content:
          "คู่มือวางแผนหน่วยกิตและค้นหาวิชาเลือก วิชาโท สำหรับนิสิต MIS คณะพาณิชยศาสตร์และการบัญชี จุฬาฯ (เว็บของนิสิต)",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

const DOCS: { title: string; icon: typeof FileText; url: string }[] = [
  { title: "แผนการศึกษา รหัส 66 (MIS)", icon: ListChecks, url: "/studyplan_66_MIS.pdf" },
  { title: "คู่มือการลงทะเบียนเรียน", icon: FileText, url: "/registrationmanual_TH_240704.pdf" },
  { title: "คู่มือประจำภาคการศึกษา", icon: BookOpen, url: "/handbook.pdf" },
  {
    title: "ตารางลงทะเบียนเรียนเทอม 2 ปีการศึกษา 2569",
    icon: CalendarDays,
    url: "/ScheduleReg269.pdf",
  },
];

/** ขั้นตอนลงทะเบียนตามลำดับใช้งานจริง (เว็บภายนอกไม่ได้ดูแลโดยทีมเรา) */
const STEPS: { title: string; desc: string; site: string; url: string; inSite?: boolean }[] = [
  {
    title: "ตรวจหน่วยกิตที่ยังขาด",
    desc: "ดูใน Petra ว่าแต่ละหมวดขาดอีกกี่หน่วยกิต",
    site: "Petra",
    url: PETRA_URL,
  },
  {
    title: "เลือกวิชาและลองจัดตาราง",
    desc: "หาวิชาในเว็บนี้ แล้วลองจัดตารางใน CU Get Reg",
    site: "CU Get Reg",
    url: CUGETREG_URL,
    inSite: true,
  },
  {
    title: "ลงทะเบียนจริง",
    desc: "ลงทะเบียนใน Reg Chula ตามกำหนดการของมหาวิทยาลัย",
    site: "Reg Chula",
    url: REG_CHULA_URL,
  },
];

const CARD = "flex items-start gap-3 rounded-xl border bg-card p-4 transition hover:border-primary hover:shadow-card";

function GoalBody({ icon: Icon, title, desc }: { icon: typeof FileText; title: string; desc: string }) {
  return (
    <>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-muted-foreground">{desc}</span>
      </span>
      <ChevronRight className="mt-1 shrink-0 text-muted-foreground" />
    </>
  );
}

function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const suggestions = search.trim()
    ? allCourses
        .filter((course) => searchText(course).includes(search.trim().toLowerCase()))
        .slice(0, 6)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    setShowSuggestions(false);

    void navigate({
      to: "/courses",
      search: { search: query },
    });
  };

  const handleSuggestionSelect = (code: string) => {
    setShowSuggestions(false);
    void navigate({ to: "/course/$code", params: { code } });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <section className="rounded-2xl bg-hero p-6 text-primary-foreground shadow-card md:p-8">
        <h1 className="text-2xl font-bold md:text-3xl">MIS Hub CBS</h1>
        <p className="mt-2 max-w-2xl opacity-95">
          คู่มือวางแผนวิชาเลือกและวิชาโท สำหรับนิสิต MIS CBS จุฬาฯ
        </p>
        <p className="mt-1 text-xs opacity-80">เว็บของนิสิต โปรดตรวจสอบกับคณะก่อนลงทะเบียน</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <div ref={searchBoxRef} className="relative min-w-0 flex-1 basis-full sm:basis-auto">
            <form onSubmit={handleSearch}>
              <div className="flex min-w-0 overflow-hidden rounded-lg bg-card text-foreground shadow-sm focus-within:ring-2 focus-within:ring-primary-foreground/80">
                <button
                  type="submit"
                  aria-label="ค้นหารายวิชา"
                  className="px-3 text-primary transition hover:text-primary/80"
                >
                  <Search className="h-5 w-5" />
                </button>
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="รหัสวิชา หรือชื่อรายวิชา..."
                  aria-label="ค้นหารายวิชา"
                  aria-expanded={showSuggestions && suggestions.length > 0}
                  aria-controls="course-search-suggestions"
                  className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <ul
                id="course-search-suggestions"
                role="listbox"
                className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg bg-white text-foreground shadow-xl"
              >
                {suggestions.map((course) => (
                  <li key={course.code} role="option">
                    <button
                      type="button"
                      onClick={() => handleSuggestionSelect(course.code)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-primary-soft"
                    >
                      <span className="shrink-0 font-semibold text-primary">{course.code}</span>
                      <span className="min-w-0 truncate text-sm">
                        {course.nameTh || course.nameEn || (course.shortName ? `${course.shortName} (ชื่อย่อ)` : "ยังไม่มีชื่อวิชา")}
                        {course.nameTh && course.nameEn && (
                          <span className="ml-2 text-muted-foreground">{course.nameEn}</span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="goals-h" className="space-y-3">
        <h2 id="goals-h" className="text-xl font-bold">อยากทำอะไรวันนี้?</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link to="/courses" search={{ search: "" }} className={CARD}>
            <GoalBody icon={Search} title="หาวิชาเลือก / วิชาโท" desc="ค้นตามหมวดและภาคเรียน ดูรีวิวรุ่นพี่" />
          </Link>
          <Link to="/curriculum" className={CARD}>
            <GoalBody
              icon={GraduationCap}
              title="เข้าใจหลักสูตร"
              desc={`${CREDITS.total} หน่วยกิต แบ่งเป็นหมวดอะไรบ้าง`}
            />
          </Link>
          <a href="#steps" className={CARD}>
            <GoalBody icon={ClipboardCheck} title="ขั้นตอนลงทะเบียน" desc="ตรวจ → ลองจัดตาราง → ลงจริง" />
          </a>
        </div>
      </section>

      <section id="steps" aria-labelledby="steps-h" className="scroll-mt-20 space-y-3">
        <div>
          <h2 id="steps-h" className="text-xl font-bold">ลงทะเบียนใน 3 ขั้นตอน</h2>
          <p className="text-sm text-muted-foreground">ทำตามลำดับนี้ทุกเทอม เว็บภายนอกเปิดในแท็บใหม่ และไม่ได้ดูแลโดยทีมเรา</p>
        </div>
        <ol className="grid gap-3 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.site} className="relative flex flex-col gap-2 rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="font-semibold">{step.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-1">
                {step.inSite && (
                  <Link
                    to="/courses"
                    search={{ search: "" }}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                  >
                    <Search className="h-4 w-4" /> ค้นหาวิชาในเว็บนี้
                  </Link>
                )}
                <a
                  href={step.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary-soft"
                >
                  เปิด {step.site} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              {i < STEPS.length - 1 && (
                <ArrowRight
                  aria-hidden="true"
                  className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 rounded-full border bg-card p-1 text-primary md:block"
                />
              )}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="faq-h" className="space-y-3">
        <div>
          <h2 id="faq-h" className="text-xl font-bold">คำถามที่พบบ่อยและเอกสาร</h2>
          <p className="text-sm text-muted-foreground">กดที่หัวข้อเพื่อเปิดอ่าน</p>
        </div>
        <Collapsible title="อยากลงวิชาโทนอกคณะ ต้องถามใคร">
          <MinorCallout />
        </Collapsible>
        <Collapsible title="วิชาเลือก กับ วิชาเลือกเสรี ต่างกันยังไง">
          วิชาเลือก ({CREDITS.otherElective} หน่วยกิต) ต้องมาจาก 3 แหล่งที่หลักสูตรกำหนด คือ วิชาเลือกสาขา MIS ส่วนที่เกิน{" "}
          {CREDITS.majorElective} หน่วยกิต วิชาของคณะรหัส 3 ตัวหลังตั้งแต่ 300 ขึ้นไป และวิชาโทนอกคณะ ส่วนวิชาเลือกเสรี ({CREDITS.free}{" "}
          หน่วยกิต) ลงวิชาอะไรของมหาวิทยาลัยก็ได้ (รวม GenEd) ยกเว้นวิชาบังคับที่ต้องเรียนอยู่แล้ว{" "}
          <Link to="/curriculum" className="text-primary underline">
            ดูรายละเอียดในหน้าหลักสูตร
          </Link>
        </Collapsible>
        <Collapsible title="PRER และ C.F. ในเงื่อนไขรายวิชาคืออะไร">
          PRER คือวิชาที่ต้องผ่านมาก่อน ส่วน C.F. (Consent of Faculty) คือต้องได้รับอนุญาตจากอาจารย์หรือคณะ เช่น "PRER 2202224 OR C.F."
          หมายถึงต้องผ่านวิชา 2202224 มาก่อน หรือได้รับอนุญาต
        </Collapsible>
        <Collapsible title="วิชา GenEd นับเป็นวิชาเลือกได้ไหม">
          ไม่ได้ นิสิตตั้งแต่ปีการศึกษา 2566 ได้ผล GenEd เป็น S/U จึงนับเป็นวิชาเลือกหรือวิชาโทไม่ได้ แต่ลงเป็นวิชาเลือกเสรีได้
        </Collapsible>
        <Collapsible title="เอกสารและคู่มือ (แผนการศึกษา คู่มือ ตารางลงทะเบียน)">
          <div className="grid gap-2 sm:grid-cols-2">
            {DOCS.map((d) => (
              <a
                key={d.title}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border bg-card p-3 text-foreground transition hover:border-primary"
              >
                <d.icon className="h-5 w-5 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 font-medium">{d.title}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </a>
            ))}
          </div>
        </Collapsible>
      </section>
    </div>
  );
}
