import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Calendar, Check, MapPin, Plus, Star, User, Users } from "lucide-react";
import { DAYS, findAnyCourse, regStore, useRegs } from "@/lib/courses";

export const Route = createFileRoute("/course/$code")({
  loader: ({ params }) => {
    const c = findAnyCourse(params.code);
    if (!c) throw notFound();
    return { code: c.code, title: `${c.code} - ${c.nameEn}`, th: c.nameTh };
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
          {c.code} - {c.nameEn}
        </h1>
        <p className="mt-1 text-xl text-muted-foreground">({c.nameTh})</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-primary-soft px-3 py-1 text-primary">{c.type}</span>
          <span className="rounded-full bg-muted px-3 py-1">{c.credits} หน่วยกิต</span>
          <span className="rounded-full bg-muted px-3 py-1">{c.restriction}</span>
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-xl font-bold">กลุ่มเรียนที่เปิดสอน</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {c.sections.map((s) => {
            const picked = mine?.sec === s.sec;
            return (
              <div key={s.sec} className="rounded-2xl border bg-card p-5 shadow-card">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xl font-bold">SEC {s.sec}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${s.left <= 5 ? "bg-primary-soft text-warning" : "bg-primary-soft text-success"}`}
                  >
                    {s.left <= 5 ? "ใกล้เต็ม" : "เปิดลงทะเบียน"}
                  </span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <Calendar className="h-4 w-4 text-primary" /> วัน{DAYS[s.day]}{" "}
                    {String(s.start).padStart(2, "0")}:00 - {s.end}:00 น.
                  </li>
                  <li className="flex gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> {s.room}
                  </li>
                  <li className="flex gap-2">
                    <User className="h-4 w-4 text-primary" /> อาจารย์ผู้สอน: {s.instructor}
                  </li>
                  <li className="flex gap-2">
                    <Users className="h-4 w-4 text-primary" /> จำนวนที่นั่ง {s.seats}{" "}
                    <span className="text-primary">(เหลือ {s.left} ที่นั่ง)</span>
                  </li>
                </ul>
                <button
                  onClick={() => (picked ? regStore.remove(c.code) : regStore.add(c.code, s.sec))}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2 font-medium ${picked ? "bg-muted text-foreground" : "bg-primary text-primary-foreground hover:opacity-90"}`}
                >
                  {picked ? (
                    <>
                      <Check className="h-4 w-4" /> ลงทะเบียนแล้ว (กดเพื่อถอน)
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> เลือกลงทะเบียน
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">รีวิวจากนักศึกษา</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ความคิดเห็นและประสบการณ์จากผู้ที่เคยเรียนรายวิชานี้
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-primary-soft px-4 py-2">
            <span className="text-3xl font-bold text-primary">{c.rating}</span>
            <Stars n={Math.round(c.rating)} />
          </div>
        </div>
        {c.reviews.length === 0 && (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            ยังไม่มีรีวิวสำหรับรายวิชานี้
          </p>
        )}
        <div className="space-y-3">
          {c.reviews.map((r, i) => (
            <div key={i} className="rounded-xl bg-muted p-4">
              <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                <b>
                  {r.name} · {r.year}
                </b>
                <Stars n={r.stars} />
              </div>
              <p className="mt-2 text-sm leading-6">{r.text}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {r.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < n ? "fill-warning text-warning" : "text-border"}`}
        />
      ))}
    </span>
  );
}
