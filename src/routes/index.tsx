import handbookUrl from '/public/handbook.pdf?url'
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, CalendarDays, ChevronRight, FileText, Megaphone, Search, GraduationCap } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { NoData } from "@/components/Labels";
import { allCourses } from "@/lib/courses";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MIS Major Knowledge Hub — ศูนย์รวมข้อมูลนิสิต MIS จุฬาฯ" },
      { name: "description", content: "ศูนย์รวมเอกสาร คู่มือ ปฏิทินการศึกษา ข่าวสาร และข้อมูลรายวิชาสำหรับนิสิตสาขาระบบสารสนเทศทางการจัดการ" },
      { property: "og:title", content: "MIS Major Knowledge Hub" },
      { property: "og:description", content: "เอกสาร คู่มือ ปฏิทิน ข่าวสาร และหลักสูตรสำหรับนิสิต MIS คณะพาณิชยศาสตร์และการบัญชี จุฬาฯ" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

const DOCS: { title: string; icon: typeof FileText; url?: string }[] = [
  { title: "คู่มือการลงทะเบียนเรียน", icon: FileText },
  { title: "คู่มือประจำภาคการศึกษา", icon: BookOpen, url: "/handbook.pdf" },
  { title: "ปฏิทินการศึกษา", icon: CalendarDays },
];

function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const suggestions = search.trim()
    ? allCourses
        .filter((course) => `${course.code} ${course.nameEn} ${course.nameTh}`.toLowerCase().includes(search.trim().toLowerCase()))
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
      search: query ? { search: query } : {},
    });
  };

  const handleSuggestionSelect = (code: string) => {
    setShowSuggestions(false);
    void navigate({ to: "/course/$code", params: { code } });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <section className="rounded-2xl bg-hero p-6 text-primary-foreground shadow-card md:p-8">
        <h1 className="text-2xl font-bold md:text-3xl">MIS Major Knowledge Hub</h1>
        <p className="mt-2 opacity-90">ศูนย์รวมข้อมูลสำหรับนิสิตสาขาระบบสารสนเทศทางการจัดการ (MIS) คณะพาณิชยศาสตร์และการบัญชี จุฬาฯ</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <div ref={searchBoxRef} className="relative min-w-0 flex-1 basis-full sm:basis-auto">
            <form onSubmit={handleSearch}>
              <div className="flex min-w-0 overflow-hidden rounded-lg bg-card text-foreground shadow-sm focus-within:ring-2 focus-within:ring-primary-foreground/80">
                <button type="submit" aria-label="ค้นหารายวิชา" className="px-3 text-primary transition hover:text-primary/80">
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
              <ul id="course-search-suggestions" role="listbox" className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg bg-white text-foreground shadow-xl">
                {suggestions.map((course) => (
                  <li key={course.code} role="option">
                    <button
                      type="button"
                      onClick={() => handleSuggestionSelect(course.code)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-primary-soft"
                    >
                      <span className="shrink-0 font-semibold text-primary">{course.code}</span>
                      <span className="min-w-0 truncate text-sm">
                        {course.nameTh || course.nameEn || "ยังไม่มีชื่อวิชา"}
                        {course.nameTh && course.nameEn && <span className="ml-2 text-muted-foreground">{course.nameEn}</span>}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link to="/curriculum" className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/60 px-4 py-2 text-sm font-medium"><GraduationCap className="h-4 w-4" /> โครงสร้างหลักสูตร</Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">เอกสารและคู่มือ</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {DOCS.map((d) => (
            <div key={d.title} className="flex items-start gap-3 rounded-xl border bg-card p-4">
              <d.icon className="h-6 w-6 shrink-0 text-primary" />
              <div className="text-sm">
                <div className="font-semibold">{d.title}</div>
                {d.url ? (
                  <a href={handbookUrl} target="_blank" rel="noopener noreferrer" className="text-primary">
                    เปิดเอกสาร
                  </a>
                ) : <NoData>ยังไม่มีเอกสาร — รอลิงก์ทางการ</NoData>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-xl font-bold"><Megaphone className="h-5 w-5 text-primary" /> ข่าวสารและประกาศ</h2>
        <p className="text-sm"><NoData>ยังไม่มีประกาศ — ข่าวสารจะแสดงที่นี่เมื่อได้รับข้อมูลจากแหล่งทางการ</NoData></p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link to="/curriculum" className="flex items-center gap-3 rounded-xl border bg-card p-4 transition hover:border-primary">
          <div className="flex-1"><div className="font-semibold">หลักสูตรอย่างน้อย 138 หน่วยกิต</div><div className="text-sm text-muted-foreground">ดูเงื่อนไขแต่ละหมวดแบบอ่านง่าย</div></div>
          <ChevronRight className="text-muted-foreground" />
        </Link>
        <Link to="/schedule" className="flex items-center gap-3 rounded-xl border bg-card p-4 transition hover:border-primary">
          <div className="flex-1"><div className="font-semibold">จำลองตารางเรียน</div><div className="text-sm text-muted-foreground">ตรวจเวลาเรียนและวันสอบชนกัน</div></div>
          <ChevronRight className="text-muted-foreground" />
        </Link>
      </section>
    </div>
  );
}
