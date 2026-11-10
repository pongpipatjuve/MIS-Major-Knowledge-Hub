import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink, MessageSquarePlus } from "lucide-react";
import { CategoryBadge, GenEdTag, MinorTag, NoData, ShortName } from "@/components/Labels";
import { ACTIVE_TERM, accessNote, cugetregUrl, findAnyCourse, reviewsFor } from "@/lib/courses";
import { REVIEW_FORM_URL } from "@/lib/config";

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
    const d = `ข้อมูลวิชา ${loaderData.th} หน่วยกิต เงื่อนไขรายวิชา และรีวิวจากนิสิต`;
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
  const reviews = reviewsFor(c.code);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <nav className="text-sm text-muted-foreground">
        <Link to="/courses" search={{ search: "" }} className="hover:text-primary">
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
          !c.nameEn && (
            <p className="mt-1 space-y-1">
              {c.shortName ? (
                <>
                  <ShortName name={c.shortName} />
                  <span className="block text-sm text-muted-foreground">
                    นี่คือชื่อย่อ ไม่ใช่ชื่อทางการ ดูชื่อเต็มได้ที่ CU Get Reg
                  </span>
                </>
              ) : (
                <NoData>ยังไม่มีข้อมูลชื่อวิชาในเว็บนี้ — ดูชื่อวิชาได้ที่ CU Get Reg</NoData>
              )}
            </p>
          )
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <CategoryBadge cat={c.category} />
          <GenEdTag label={c.genEdLabel} />
          <MinorTag show={c.isMinor} />
          {c.isCbs300 && <span className="rounded-full bg-muted px-3 py-1">ปริญญาตรี รหัส 300 ขึ้นไป</span>}
          {!c.stub && <span className="rounded-full bg-muted px-3 py-1">{c.credits} หน่วยกิต</span>}
          {c.dept && <span className="rounded-full bg-muted px-3 py-1">{c.dept}</span>}
        </div>
      </header>

      {!c.stub && (
        <section className="space-y-2 rounded-2xl border bg-card p-5">
          <h2 className="text-xl font-bold">เงื่อนไขรายวิชา</h2>
          <p className="text-sm">{c.condition ?? "ไม่มีเงื่อนไขรายวิชาที่ระบุไว้ในข้อมูล"}</p>
          {accessNote(c) && (
            <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              ⚠ {accessNote(c)} (สรุปจากหมายเหตุกลุ่มเรียน 2569/1–2 เป็นการประมาณ โปรดตรวจที่ CU Get Reg)
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {c.offeredNow
              ? `พบว่าเปิดสอนใน ${ACTIVE_TERM} (ปีการศึกษา/ภาค) ตามข้อมูลที่เรามี`
              : `ไม่พบวิชานี้ในข้อมูลภาค ${ACTIVE_TERM} ที่เรามี (อาจไม่เปิดสอน หรือข้อมูลยังไม่ครบ) โปรดตรวจสอบกับ CU Get Reg`}
          </p>
        </section>
      )}

      {c.stub && (
        <section className="space-y-2 rounded-2xl border bg-card p-5">
          <h2 className="text-xl font-bold">เงื่อนไขรายวิชาและภาคที่เปิดสอน</h2>
          <p className="text-sm">
            เว็บนี้ยังไม่มีข้อมูลจาก CU Get Reg ของวิชานี้ จึงยังไม่ทราบว่าเปิดสอนใน {ACTIVE_TERM} (ปีการศึกษา/ภาค) หรือไม่
            และไม่ทราบหน่วยกิตหรือเงื่อนไขรายวิชา โปรดตรวจสอบที่ CU Get Reg ก่อนวางแผนลงทะเบียน
          </p>
        </section>
      )}

      {c.isGenEd && (
        <section className="rounded-2xl border bg-card p-5 text-sm">
          <h2 className="mb-1 text-lg font-bold">วิชา GenEd</h2>
          นิสิตตั้งแต่ปีการศึกษา 2566 ได้ผลวิชา GenEd เป็น S/U (ไม่มีเกรด) นับเป็นวิชาเลือกหรือวิชาโทไม่ได้
          แต่ลงเป็นวิชาเลือกเสรีได้ โปรดตรวจสอบกับประกาศของคณะ
          {c.inMinorList && (
            <p className="mt-2 rounded-lg bg-amber-50 p-2 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              วิชานี้อยู่ในรายการวิชาโทนอกคณะที่กลุ่มเราสอบถามมา แต่ CU Get Reg ระบุว่าเป็น GenEd เรายังไม่ยืนยันว่านับเป็นวิชาโทได้หรือไม่
              จึงยังไม่แสดงเป็นวิชาโท โปรดสอบถามภาควิชาหรืออาจารย์ที่ปรึกษาก่อนตัดสินใจ
            </p>
          )}
        </section>
      )}

      {c.isMinor && (
        <section className="rounded-2xl border bg-card p-5 text-sm">
          <h2 className="mb-1 text-lg font-bold">วิชาโทนอกคณะ</h2>
          วิชานี้อยู่ในรายการที่กลุ่มเราสอบถามมาว่านิสิต MIS ลงเป็นวิชาโทนอกคณะได้ ไม่ใช่ประกาศทางการ
          โปรดยืนยันกับภาควิชาเจ้าของวิชาก่อนลงทะเบียน
        </section>
      )}

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-lg font-bold">ตารางเรียน ที่นั่ง และผู้สอน</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          ดูกลุ่มเรียน เวลา ที่นั่งว่าง และชื่ออาจารย์ที่ CU Get Reg เปิดหน้าวิชา {c.code} ในแท็บใหม่
          เลื่อนลงไปด้านล่างของหน้านั้นเพื่ออ่านรีวิวจากนิสิตได้ด้วย
        </p>
        <a
          href={cugetregUrl(c.code)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary-soft"
        >
          <ExternalLink className="h-4 w-4" /> เปิด {c.code} ใน CU Get Reg
        </a>
        <p className="mt-2 text-xs text-muted-foreground">
          เป็นเว็บภายนอกที่ไม่ได้ดูแลโดยทีมเรา เนื้อหาและรีวิวเป็นของเจ้าของเว็บนั้น
        </p>
      </section>

      <section className="rounded-2xl border bg-card p-5 md:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">รีวิวจากนิสิต</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ความคิดเห็นจากนิสิตที่เคยเรียน ไม่ระบุชื่อผู้เขียน และผ่านการคัดกรองโดยทีมงานก่อนแสดง
            </p>
          </div>
          {REVIEW_FORM_URL && (
            <a
              href={REVIEW_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <MessageSquarePlus className="h-4 w-4" /> เขียนรีวิว
            </a>
          )}
        </div>
        {reviews.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            ยังไม่มีรีวิวสำหรับรายวิชานี้ในเว็บเรา ดูรีวิวจากเว็บอื่นได้ที่ปุ่มด้านบน
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r, i) => (
              <div key={i} className="rounded-xl bg-muted p-4">
                <div className="text-xs text-muted-foreground">นิสิตท่านหนึ่ง{r.year ? ` · ${r.year}` : ""}</div>
                <p className="mt-2 text-sm leading-6">{r.text}</p>
                {r.tags && r.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {r.tags.map((t) => (
                      <span key={t} className="rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
