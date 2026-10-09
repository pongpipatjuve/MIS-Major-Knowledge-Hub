import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, FileText, Search } from "lucide-react";
import { courses } from "@/lib/courses";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "REG-CBS — ค้นหารายวิชา คณะพาณิชยศาสตร์และการบัญชี จุฬาฯ" },
      { name: "description", content: "ระบบค้นหารายวิชาและลงทะเบียนเรียนสำหรับนิสิต CBS จุฬาลงกรณ์มหาวิทยาลัย" },
      { property: "og:title", content: "REG-CBS — ค้นหารายวิชา" },
      { property: "og:description", content: "ค้นหารายวิชา CBS ดูหน่วยกิต และเข้าถึงคู่มือการลงทะเบียน" },
    ],
  }),
  component: Home,
});

const filters = ["ทั้งหมด", "บัญชี", "บริหารธุรกิจ", "สถิติ"];

function Home() {
  const [q, setQ] = useState("");
  const [f, setF] = useState("ทั้งหมด");
  const list = courses.filter(
    (c) =>
      (f === "ทั้งหมด" || c.dept === f) &&
      `${c.code} ${c.nameEn} ${c.nameTh}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">เอกสารและคู่มือ</h2>
        {["คู่มือการลงทะเบียนเรียน", "คู่มือประจำภาคการศึกษา", "ปฏิทินการศึกษา"].map((d) => (
          <a key={d} href="#" className="flex items-center gap-3 rounded-xl border bg-card p-3 text-sm transition hover:border-primary hover:text-primary">
            <FileText className="h-5 w-5 text-primary" /> {d}
          </a>
        ))}
      </aside>
      <main className="space-y-6">
        <section className="rounded-2xl bg-hero p-8 text-primary-foreground shadow-card">
          <h1 className="text-3xl font-bold">REG-CBS</h1>
          <p className="mt-2 opacity-90">ระบบลงทะเบียนเรียน คณะพาณิชยศาสตร์และการบัญชี จุฬาลงกรณ์มหาวิทยาลัย</p>
        </section>
        <section>
          <h2 className="mb-3 text-2xl font-bold">ค้นหารายวิชา</h2>
          <div className="flex overflow-hidden rounded-xl border bg-card focus-within:ring-2 focus-within:ring-ring">
            <Search className="m-3 h-5 w-5 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="รหัสวิชา หรือชื่อรายวิชา..." className="flex-1 bg-transparent outline-none" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.map((x) => (
              <button key={x} onClick={() => setF(x)} className={`rounded-full border px-3 py-1 text-sm ${f === x ? "border-primary bg-primary-soft text-primary" : "bg-card"}`}>{x}</button>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">ผลการค้นหา {list.length} รายการ</p>
          <div className="mt-2 space-y-3">
            {list.map((c) => (
              <Link key={c.code} to="/course/$code" params={{ code: c.code }} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition hover:border-primary hover:shadow-card">
                <div className="flex-1">
                  <div className="text-lg font-bold">{c.code}</div>
                  <div className="font-medium">{c.nameEn}</div>
                  <div className="text-sm text-muted-foreground">{c.nameTh}</div>
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="rounded-md bg-primary-soft px-2 py-0.5 text-primary">{c.dept}</span>
                    <span className="rounded-md bg-muted px-2 py-0.5">{c.type}</span>
                  </div>
                </div>
                <div className="text-center"><div className="text-2xl font-bold">{c.credits}</div><div className="text-xs text-muted-foreground">หน่วยกิต</div></div>
                <ChevronRight className="text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
