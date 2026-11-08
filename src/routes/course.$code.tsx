import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Calendar, Check, ClipboardList, MapPin, Plus, User, Users } from "lucide-react";
import { ACTIVE_TERM_LABEL, findAnyCourse, fmtExamDate, fmtMeeting, regStore, useRegs } from "@/lib/courses";
import { CategoryBadge, GenEdTag, NoData } from "@/components/Labels";

export const Route = createFileRoute("/course/$code")({
  loader: ({ params }) => {
    const c = findAnyCourse(params.code);
    if (!c) throw notFound();
    return { code: c.code, title: `${c.code}${c.nameEn ? ` - ${c.nameEn}` : ""}`, th: c.nameTh || c.nameEn || c.code };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [
          { title: "ไม่พบรายวิชา — MIS Major Knowledge Hub" },
          { name: "robots", content: "noindex" },
        ],
      };
    const t = `${loaderData.title} — MIS Major Knowledge Hub`;
    const d = `รายละเอียดวิชา ${loaderData.th} กลุ่มเรียน และรีวิวจากนิสิต`;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="p-10 text-center">
      ไม่พบรายวิชา{" "}
      <Link to="/" className="text-primary">
        กลับหน้าหลัก
      </Link>
    </div>
  ),
  component: CourseDetail,
});

function CourseDetail() {
  const { code } = Route.useLoaderData();
  const c = findAnyCourse(code)!;
  const regs = useRegs();
  const mine = regs.find((r) => r.code === code);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <nav className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          ค้นหารายวิชา
        </Link>{" "}
        › {c.code}
      </nav>
      <header>
        <h1 className="text-3xl font-bold leading-tight md:text-4xl">
          {c.code}
          {c.nameEn ? ` - ${c.nameEn}` : ""}
        </h1>
        {c.nameTh ? (
          <p className="mt-1 text-xl text-muted-foreground">({c.nameTh})</p>
        ) : (
          c.stub && (
            <p className="mt-1">
              <NoData>ยังไม่มีข้อมูลชื่อวิชาจาก CU Get Reg</NoData>
            </p>
          )
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <CategoryBadge cat={c.category} />
          {!c.stub && <span className="rounded-full bg-muted px-3 py-1">{c.credits} หน่วยกิต</span>}
          {c.creditHours && <span className="rounded-full bg-muted px-3 py-1">{c.creditHours}</span>}
          <GenEdTag label={c.genEdLabel} />
          {c.dept && <span className="rounded-full bg-muted px-3 py-1">{c.dept}</span>}
        </div>
      </header>

      {!c.stub && (
        <section className="space-y-3 rounded-2xl border bg-card p-5">
          <h2 className="text-xl font-bold">รายละเอียดวิชา</h2>
          <p className="text-sm">
            <b>เงื่อนไขรายวิชา: </b>
            {c.condition ?? "ไม่มี"}
          </p>
          {c.descTh ? (
            <p className="text-sm leading-6">{c.descTh}</p>
          ) : (
            <NoData>ยังไม่มีคำอธิบายรายวิชา</NoData>
          )}
          {c.descEn && <p className="text-sm leading-6 text-muted-foreground">{c.descEn}</p>}
          <div className="grid gap-2 border-t pt-3 text-sm sm:grid-cols-2">
            <p className="flex gap-2">
              <ClipboardList className="h-4 w-4 shrink-0 text-primary" />
              <span>
                <b>สอบกลางภาค: </b>
                <ExamText exam={c.midterm} />
              </span>
            </p>
            <p className="flex gap-2">
              <ClipboardList className="h-4 w-4 shrink-0 text-primary" />
              <span>
                <b>สอบปลายภาค: </b>
                <ExamText exam={c.final} />
              </span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            เปิดสอนในข้อมูลที่มี: {c.offeredTerms.length ? c.offeredTerms.join(", ") : "ไม่พบ"} (รูปแบบ ปีการศึกษา/ภาค)
          </p>
        </section>
      )}

      <section>
        <h2 className="mb-1 text-xl font-bold">กลุ่มเรียนที่เปิดสอน</h2>
        <p className="mb-3 text-sm text-muted-foreground">{ACTIVE_TERM_LABEL}</p>
        {c.sections.length === 0 && (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            {c.stub
              ? "ยังไม่มีข้อมูลรายวิชานี้"
              : "ไม่พบกลุ่มเรียนของวิชานี้ในภาคเรียนนี้ (อาจไม่เปิดสอน หรือข้อมูลที่ดึงมายังไม่ครบ)"}
          </p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {c.sections.map((s) => {
            const picked = mine?.sec === s.sec;
            const teachers = [...new Set(s.meetings.flatMap((m) => m.teachers))];
            const rooms = [...new Set(s.meetings.map((m) => m.room).filter(Boolean))];
            return (
              <div key={s.sec} className="rounded-2xl border bg-card p-5 shadow-card">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xl font-bold">SEC {s.sec}</h3>
                  {s.closed && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      สถานะ: ปิด
                    </span>
                  )}
                </div>
                <ul className="space-y-2 text-sm">
                  {s.meetings.length === 0 && (
                    <li>
                      <NoData>ไม่มีข้อมูลเวลาเรียน</NoData>
                    </li>
                  )}
                  {s.meetings.map((m, i) => (
                    <li key={i} className="flex gap-2">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        {m.type && <b>{m.type} </b>}
                        {fmtMeeting(m)}
                        {!m.timed && <span className="text-muted-foreground"> — ไม่นำไปตรวจเวลาชน</span>}
                      </span>
                    </li>
                  ))}
                  <li className="flex gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    {rooms.length ? rooms.join(", ") : <NoData>ไม่ระบุห้อง</NoData>}
                  </li>
                  <li className="flex gap-2">
                    <User className="h-4 w-4 shrink-0 text-primary" />
                    ผู้สอน (ตัวย่อ): {teachers.length ? teachers.join(", ") : <NoData>ไม่ระบุ</NoData>}
                  </li>
                  <li className="flex gap-2">
                    <Users className="h-4 w-4 shrink-0 text-primary" />
                    ลงทะเบียนแล้ว {s.enrolled}/{s.max}
                  </li>
                  {s.note && (
                    <li className="rounded-lg bg-muted px-3 py-2 text-xs">หมายเหตุ: {s.note}</li>
                  )}
                </ul>
                <button
                  onClick={() => (picked ? regStore.remove(c.code) : regStore.add(c.code, s.sec))}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2 font-medium ${picked ? "bg-muted text-foreground" : "bg-primary text-primary-foreground hover:opacity-90"}`}
                >
                  {picked ? (
                    <>
                      <Check className="h-4 w-4" /> อยู่ในตารางแล้ว (กดเพื่อถอน)
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> เพิ่มลงตาราง
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          ข้อมูลจาก CU Get Reg — จำนวน “ลงทะเบียนแล้ว” เป็นตัวเลขจากข้อมูลที่ดึงมา ณ เวลาหนึ่ง ไม่ใช่ที่นั่งว่างแบบเรียลไทม์
          โปรดตรวจสอบกับระบบลงทะเบียนอย่างเป็นทางการก่อนลงจริง
        </p>
      </section>

      <section className="rounded-2xl border bg-card p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">รีวิวจากนักศึกษา</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ความคิดเห็นและประสบการณ์จากผู้ที่เคยเรียนรายวิชานี้
            </p>
          </div>
        </div>
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          ยังไม่มีรีวิวสำหรับรายวิชานี้ (ระบบรีวิวแบบไม่ระบุตัวตนจะเปิดในภายหลัง)
        </p>
      </section>
    </div>
  );
}

function ExamText({ exam }: { exam: { date: string | null; start: string | null; end: string | null } | null }) {
  const d = fmtExamDate(exam);
  if (!exam || !d) return <NoData>ยังไม่มีข้อมูล</NoData>;
  return (
    <>
      {d}
      {exam.start && exam.end ? ` เวลา ${exam.start}-${exam.end}` : ""}
    </>
  );
}
