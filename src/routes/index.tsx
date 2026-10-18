import handbookUrl from '/public/handbook.pdf?url'
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarDays, ChevronRight, FileText, Megaphone, Search, GraduationCap } from "lucide-react";
import { NoData } from "@/components/Labels";

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
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <section className="rounded-2xl bg-hero p-6 text-primary-foreground shadow-card md:p-8">
        <h1 className="text-2xl font-bold md:text-3xl">MIS Major Knowledge Hub</h1>
        <p className="mt-2 opacity-90">ศูนย์รวมข้อมูลสำหรับนิสิตสาขาระบบสารสนเทศทางการจัดการ (MIS) คณะพาณิชยศาสตร์และการบัญชี จุฬาฯ</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/courses" className="inline-flex items-center gap-2 rounded-lg bg-card px-4 py-2 text-sm font-medium text-foreground"><Search className="h-4 w-4" /> ค้นหารายวิชา</Link>
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
