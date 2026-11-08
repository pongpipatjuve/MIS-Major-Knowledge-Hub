import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Plus, X } from "lucide-react";
import { NoData } from "@/components/Labels";
import { examConflicts, fmtMinutes, missingExam, timeConflicts } from "@/lib/conflicts";
import {
  ACTIVE_TERM_LABEL,
  DAYS,
  findCourse,
  fmtExamDate,
  fmtMeeting,
  regStore,
  slotsFor,
  useRegs,
} from "@/lib/courses";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "ตารางเรียน — MIS Major Knowledge Hub" },
      { name: "description", content: "วางแผนตารางเรียนประจำภาค ตรวจเวลาเรียนและวันสอบชนกัน" },
      { property: "og:title", content: "ตารางเรียน — MIS Major Knowledge Hub" },
      {
        property: "og:description",
        content: "ตารางเรียนรายสัปดาห์ พร้อมตรวจเวลาเรียนและวันสอบชนกัน",
      },
    ],
  }),
  component: Schedule,
});

const BLOCKS = ["bg-block-1", "bg-block-2", "bg-block-3", "bg-block-4", "bg-block-5"];
const ROW_PX = 24; // ต่อครึ่งชั่วโมง

function Schedule() {
  const regs = useRegs();
  const items = regs.flatMap((r) => {
    const c = findCourse(r.code);
    const s = c?.sections.find((x) => x.sec === r.sec);
    return c && s ? [{ c, s }] : [];
  });
  const slots = items.flatMap(({ c, s }) => slotsFor(c, s.sec));
  const credits = items.reduce((sum, { c }) => sum + c.credits, 0);

  const timeC = timeConflicts(slots);
  const midC = examConflicts(slots, "midterm");
  const finC = examConflicts(slots, "final");
  const noExam = missingExam(slots);
  const conflicted = new Set(timeC.flatMap(([a, b]) => [a.code, b.code]));

  const hasWeekend = slots.some((x) => x.day >= 5);
  const dayCount = hasWeekend ? 7 : 5;
  const startMin = Math.min(8 * 60, ...slots.map((x) => Math.floor(x.start / 60) * 60));
  const endMin = Math.max(18 * 60, ...slots.map((x) => Math.ceil(x.end / 60) * 60));
  const rows = (endMin - startMin) / 30;
  const hours = Array.from({ length: (endMin - startMin) / 60 }, (_, i) => startMin + i * 60);
  const row = (m: number) => (m - startMin) / 30 + 2;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <section className="rounded-2xl border bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-bold">ตารางเรียน {ACTIVE_TERM_LABEL}</h1>
          <span className="rounded-full bg-primary-soft px-3 py-1 text-sm text-primary">
            {credits} หน่วยกิต
          </span>
        </div>
        <div className="overflow-x-auto">
          <div
            className="relative grid min-w-[640px]"
            style={{
              gridTemplateColumns: `56px repeat(${dayCount}, 1fr)`,
              gridTemplateRows: `32px repeat(${rows}, ${ROW_PX}px)`,
            }}
          >
            <div />
            {DAYS.slice(0, dayCount).map((d) => (
              <div key={d} className="text-center text-sm font-semibold">
                {d}
              </div>
            ))}
            {hours.map((h) => (
              <div key={h} className="contents">
                <div
                  className="pr-2 text-right text-xs text-muted-foreground"
                  style={{ gridRow: `${row(h)} / span 2`, gridColumn: 1 }}
                >
                  {fmtMinutes(h)}
                </div>
                {DAYS.slice(0, dayCount).map((d, di) => (
                  <div
                    key={d}
                    className="border-l border-t"
                    style={{ gridRow: `${row(h)} / span 2`, gridColumn: di + 2 }}
                  />
                ))}
              </div>
            ))}
            {items.flatMap(({ c, s }, idx) =>
              s.meetings
                .filter((m) => m.timed)
                .map((m, mi) => (
                  <Link
                    key={`${c.code}-${mi}`}
                    to="/course/$code"
                    params={{ code: c.code }}
                    className={`${BLOCKS[idx % BLOCKS.length]} m-0.5 overflow-hidden rounded-lg p-1.5 text-xs text-foreground transition hover:scale-[1.02] ${
                      conflicted.has(c.code) ? "ring-2 ring-destructive" : ""
                    }`}
                    style={{
                      gridColumn: m.day + 2,
                      gridRow: `${row(m.start)} / ${row(m.end)}`,
                    }}
                  >
                    <div className="font-bold">{c.code}</div>
                    <div>
                      SEC {s.sec} {m.type}
                    </div>
                    <div>
                      {fmtMinutes(m.start)}-{fmtMinutes(m.end)}
                    </div>
                  </Link>
                )),
            )}
          </div>
        </div>
      </section>

      {items.length > 0 && (
        <section className="space-y-2 rounded-2xl border bg-card p-4">
          <h2 className="text-lg font-bold">ผลตรวจสอบ</h2>
          {timeC.length === 0 && midC.length === 0 && finC.length === 0 && noExam.length === 0 && (
            <p className="text-sm text-success">ไม่พบเวลาเรียนหรือวันสอบชนกัน</p>
          )}
          {timeC.map(([a, b], i) => (
            <Warn key={`t${i}`}>
              เวลาเรียนชนกัน: {a.code} (SEC {a.sec}) กับ {b.code} (SEC {b.sec}) วัน{DAYS[a.day]}{" "}
              {fmtMinutes(Math.max(a.start, b.start))}-{fmtMinutes(Math.min(a.end, b.end))}
            </Warn>
          ))}
          {midC.map(([a, b], i) => (
            <Warn key={`m${i}`}>
              สอบกลางภาคชนกัน: {a.code} กับ {b.code} วันที่ {fmtExamDate(a.midterm ?? null)}
            </Warn>
          ))}
          {finC.map(([a, b], i) => (
            <Warn key={`f${i}`}>
              สอบปลายภาคชนกัน: {a.code} กับ {b.code} วันที่ {fmtExamDate(a.final ?? null)}
            </Warn>
          ))}
          {noExam.length > 0 && (
            <p className="text-sm text-muted-foreground">
              ตรวจวันสอบไม่ได้เพราะยังไม่มีข้อมูลวันสอบของ: {noExam.map((x) => x.code).join(", ")}
            </p>
          )}
        </section>
      )}

      <section className="rounded-2xl border bg-card p-4">
        <h2 className="mb-3 text-lg font-bold">วิชาที่อยู่ในตาราง</h2>
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            ยังไม่มีวิชาที่อยู่ในตาราง —{" "}
            <Link to="/courses" search={{ search: "" }} className="text-primary">
              ไปค้นหารายวิชา
            </Link>
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(({ c, s }, idx) => (
              <li key={c.code} className="flex items-start gap-3 rounded-xl border p-3">
                <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${BLOCKS[idx % BLOCKS.length]}`} />
                <div className="min-w-0 flex-1 text-sm">
                  <Link
                    to="/course/$code"
                    params={{ code: c.code }}
                    className="font-semibold hover:text-primary"
                  >
                    {c.code}
                  </Link>
                  <div className="truncate">{c.nameTh || c.nameEn}</div>
                  <div className="text-xs text-muted-foreground">SEC {s.sec}</div>
                  {s.meetings.length === 0 && (
                    <div className="text-xs">
                      <NoData>ไม่มีข้อมูลเวลาเรียน</NoData>
                    </div>
                  )}
                  {s.meetings.map((m, i) => (
                    <div key={i} className="text-xs text-muted-foreground">
                      {m.type} {fmtMeeting(m)}
                    </div>
                  ))}
                </div>
                <button
                  aria-label="ถอนรายวิชา"
                  onClick={() => regStore.remove(c.code)}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {items.length > 0 && (
          <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <Plus className="h-3 w-3" /> เพิ่มวิชาอื่นหรือเปลี่ยน SEC ได้จากหน้ารายวิชา
          </p>
        )}
      </section>
    </div>
  );
}

function Warn({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{children}</span>
    </p>
  );
}
