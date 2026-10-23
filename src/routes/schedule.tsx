import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, X } from "lucide-react";
import { DAYS, findCourse, regStore, useRegs } from "@/lib/courses";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "ตารางเรียน — MIS Major Knowledge Hub" },
      { name: "description", content: "วางแผนตารางเรียนประจำภาคและดูวิชาที่อยู่ในตาราง" },
      { property: "og:title", content: "ตารางเรียน — MIS Major Knowledge Hub" },
      {
        property: "og:description",
        content: "ตารางเรียนรายสัปดาห์และวิชาที่อยู่ในตารางของนิสิต CBS",
      },
    ],
  }),
  component: Schedule,
});

const HOURS = Array.from({ length: 10 }, (_, i) => 8 + i);
const BLOCKS = ["bg-block-1", "bg-block-2", "bg-block-3", "bg-block-4", "bg-block-5"];

function Schedule() {
  const regs = useRegs();
  const credits = regs.reduce((s, r) => s + (findCourse(r.code)?.credits ?? 0), 0);
  const isReg = (code: string) => regs.some((r) => r.code === code);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <section className="rounded-2xl border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">ตารางเรียนประจำภาคเรียน 1/2567</h1>
          <span className="rounded-full bg-primary-soft px-3 py-1 text-sm text-primary">
            {credits} หน่วยกิต
          </span>
        </div>
        <div className="overflow-x-auto">
          <div
            className="relative grid min-w-[640px]"
            style={{
              gridTemplateColumns: "56px repeat(5, 1fr)",
              gridTemplateRows: `32px repeat(${HOURS.length}, 48px)`,
            }}
          >
            <div />
            {DAYS.map((d) => (
              <div key={d} className="text-center text-sm font-semibold">
                {d}
              </div>
            ))}
            {HOURS.map((h, i) => (
              <div key={h} className="contents">
                <div
                  className="pr-2 text-right text-xs text-muted-foreground"
                  style={{ gridRow: i + 2, gridColumn: 1 }}
                >
                  {String(h).padStart(2, "0")}:00
                </div>
                {DAYS.map((_, d) => (
                  <div
                    key={d}
                    className="border-l border-t"
                    style={{ gridRow: i + 2, gridColumn: d + 2 }}
                  />
                ))}
              </div>
            ))}
            {regs.map((r, idx) => {
              const c = findCourse(r.code)!;
              const s = c.sections.find((x) => x.sec === r.sec)!;
              return (
                <Link
                  key={r.code}
                  to="/course/$code"
                  params={{ code: c.code }}
                  className={`${BLOCKS[idx % 5]} m-0.5 rounded-lg p-2 text-xs text-foreground transition hover:scale-[1.02]`}
                  style={{
                    gridColumn: s.day + 2,
                    gridRow: `${s.start - 8 + 2} / ${s.end - 8 + 2}`,
                  }}
                >
                  <div className="font-bold">{c.code}</div>
                  <div>SEC {s.sec}</div>
                  <div>
                    {s.start}:00 - {s.end}:00
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-4">
        <h2 className="mb-3 text-lg font-bold">วิชาที่อยู่ในตาราง</h2>
        {regs.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            ยังไม่มีวิชาที่อยู่ในตาราง
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {regs.map((r, idx) => {
              const c = findCourse(r.code)!;
              const section = c.sections.find((s) => s.sec === r.sec) ?? c.sections[0]!;
              return (
                <li key={r.code} className="flex items-start gap-3 rounded-xl border p-3">
                  <div className={`h-2 w-2 shrink-0 rounded-full ${BLOCKS[idx % BLOCKS.length]}`} />
                  <div className="min-w-0 flex-1 text-sm">
                    <Link
                      to="/course/$code"
                      params={{ code: c.code }}
                      className="font-semibold hover:text-primary"
                    >
                      {c.code}
                    </Link>
                    <div className="truncate">{c.nameTh}</div>
                    <div className="text-xs text-muted-foreground">
                      {DAYS[section.day]} {section.start}:00-{section.end}:00 · SEC {section.sec}
                    </div>
                  </div>
                  <RegButton code={c.code} active={isReg(c.code)} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function RegButton({ code, active }: { code: string; active: boolean }) {
  return active ? (
    <button
      aria-label="ถอนรายวิชา"
      onClick={() => regStore.remove(code)}
      className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground hover:text-destructive"
    >
      <X className="h-4 w-4" />
    </button>
  ) : (
    <button
      aria-label="เพิ่มรายวิชา"
      onClick={() => regStore.add(code, findCourse(code)!.sections[0]!.sec)}
      className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground hover:opacity-90"
    >
      <Plus className="h-4 w-4" />
    </button>
  );
}
