import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { courses, DAYS, findCourse, regStore, useRegs } from "@/lib/courses";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "ตารางเรียน — MIS Major Knowledge Hub" },
      { name: "description", content: "วางแผนตารางเรียนประจำภาคและเลือกรายวิชาที่ลงทะเบียนได้" },
      { property: "og:title", content: "ตารางเรียน — MIS Major Knowledge Hub" },
      { property: "og:description", content: "ตารางเรียนรายสัปดาห์และรายวิชาที่ลงทะเบียนได้ของนิสิต CBS" },
    ],
  }),
  component: Schedule,
});

const HOURS = Array.from({ length: 10 }, (_, i) => 8 + i);
const BLOCKS = ["bg-block-1", "bg-block-2", "bg-block-3", "bg-block-4", "bg-block-5"];
const DEPTS = ["บัญชี", "บริหารธุรกิจ", "สถิติ"] as const;

function Schedule() {
  const regs = useRegs();
  const [dept, setDept] = useState<string>("บริหารธุรกิจ");
  const [q, setQ] = useState("");
  const credits = regs.reduce((s, r) => s + (findCourse(r.code)?.credits ?? 0), 0);
  const isReg = (code: string) => regs.some((r) => r.code === code);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-xl font-bold">ตารางเรียนประจำภาคเรียน 1/2567</h1>
            <span className="rounded-full bg-primary-soft px-3 py-1 text-sm text-primary">{credits} หน่วยกิต</span>
          </div>
          <div className="overflow-x-auto">
            <div className="relative grid min-w-[640px]" style={{ gridTemplateColumns: "56px repeat(5, 1fr)", gridTemplateRows: `32px repeat(${HOURS.length}, 48px)` }}>
              <div />
              {DAYS.map((d) => <div key={d} className="text-center text-sm font-semibold">{d}</div>)}
              {HOURS.map((h, i) => (
                <div key={h} className="contents">
                  <div className="pr-2 text-right text-xs text-muted-foreground" style={{ gridRow: i + 2, gridColumn: 1 }}>{String(h).padStart(2, "0")}:00</div>
                  {DAYS.map((_, d) => <div key={d} className="border-l border-t" style={{ gridRow: i + 2, gridColumn: d + 2 }} />)}
                </div>
              ))}
              {regs.map((r, idx) => {
                const c = findCourse(r.code)!;
                const s = c.sections.find((x) => x.sec === r.sec)!;
                return (
                  <Link key={r.code} to="/course/$code" params={{ code: c.code }}
                    className={`${BLOCKS[idx % 5]} m-0.5 rounded-lg p-2 text-xs text-foreground transition hover:scale-[1.02]`}
                    style={{ gridColumn: s.day + 2, gridRow: `${s.start - 8 + 2} / ${s.end - 8 + 2}` }}>
                    <div className="font-bold">{c.code}</div>
                    <div>SEC {s.sec}</div>
                    <div>{s.start}:00 - {s.end}:00</div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border bg-card p-4">
          <h2 className="mb-3 text-lg font-bold">รายวิชาที่ลงทะเบียนได้</h2>
          <select value={dept} onChange={(e) => setDept(e.target.value)} className="mb-3 w-full rounded-lg border bg-background p-2 text-sm">
            <option value="บัญชี">บัญชี</option>
            <option value="บริหารธุรกิจ">บริหารธุรกิจ - 6 สาขา</option>
            <option value="สถิติ">สถิติ</option>
          </select>
          <ul className="space-y-2">
            {courses.filter((c) => c.dept === dept).map((c) => (
              <li key={c.code} className="flex items-center gap-2 rounded-lg border p-2">
                <div className="flex-1 text-sm">
                  <div className="font-semibold">{c.code}</div>
                  <div className="text-xs text-muted-foreground">{c.nameTh} · {c.major}</div>
                </div>
                <RegButton code={c.code} active={isReg(c.code)} />
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <section className="rounded-2xl border bg-card p-4">
        <h2 className="mb-3 text-lg font-bold">ค้นหารายวิชาทั้งหมดในระบบ</h2>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ชื่อรายวิชา รหัสวิชา หรือคำสำคัญ..." className="mb-3 w-full rounded-lg border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-muted-foreground">
              <tr><th className="p-2">รหัสวิชา</th><th>ชื่อรายวิชา</th><th>หน่วยกิต</th><th>วัน-เวลา</th><th>ข้อจำกัด</th><th /></tr>
            </thead>
            <tbody>
              {courses.filter((c) => `${c.code} ${c.nameEn} ${c.nameTh}`.toLowerCase().includes(q.toLowerCase())).map((c) => (
                <tr key={c.code} className="border-t">
                  <td className="p-2 font-semibold"><Link to="/course/$code" params={{ code: c.code }} className="hover:text-primary">{c.code}</Link></td>
                  <td>{c.nameEn}</td>
                  <td>{c.credits}</td>
                  <td>{DAYS[c.sections[0]!.day]} {c.sections[0]!.start}:00-{c.sections[0]!.end}:00</td>
                  <td className={c.restriction === "ไม่มีข้อจำกัด" ? "" : "text-destructive"}>{c.restriction}</td>
                  <td className="p-2 text-right"><RegButton code={c.code} active={isReg(c.code)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function RegButton({ code, active }: { code: string; active: boolean }) {
  return active ? (
    <button aria-label="ถอนรายวิชา" onClick={() => regStore.remove(code)} className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
  ) : (
    <button aria-label="เพิ่มรายวิชา" onClick={() => regStore.add(code, findCourse(code)!.sections[0]!.sec)} className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4" /></button>
  );
}
