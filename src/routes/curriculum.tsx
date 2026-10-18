import { createFileRoute } from "@tanstack/react-router";
import { CATEGORIES, CREDITS } from "@/lib/curriculum";
import { Notice } from "@/components/Labels";

export const Route = createFileRoute("/curriculum")({
  head: () => ({
    meta: [
      { title: "โครงสร้างหลักสูตร MIS 138 หน่วยกิต — MIS Major Knowledge Hub" },
      { name: "description", content: "สรุปโครงสร้างหลักสูตรบริหารธุรกิจบัณฑิต สาขาระบบสารสนเทศทางการจัดการ แบบอ่านง่าย" },
      { property: "og:title", content: "โครงสร้างหลักสูตร MIS" },
      { property: "og:description", content: "GenEd 33 · หมวดวิชาเฉพาะ 99 · วิชาเลือกเสรี 6 รวมไม่น้อยกว่า 138 หน่วยกิต" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Curriculum,
});

function Curriculum() {
  const categoryCredits: Record<string, string> = {
    GenEd: `${CREDITS.genEd} หน่วยกิต`,
    วิชาแกน: `${CREDITS.core} หน่วยกิต`,
    วิชาบังคับสาขา: `${CREDITS.majorRequired} หน่วยกิต`,
    วิชาเลือกสาขา: `อย่างน้อย ${CREDITS.majorElective} หน่วยกิต`,
    วิชาเลือกตามเงื่อนไข: `อย่างน้อย ${CREDITS.otherElective} หน่วยกิต`,
    วิชาเลือกเสรี: `${CREDITS.free} หน่วยกิต`,
  };

  const categoryColors = [
    "bg-block-2",
    "bg-block-1",
    "bg-primary",
    "bg-block-3",
    "bg-block-4",
    "bg-block-5",
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">หลักสูตรบริหารธุรกิจบัณฑิต สาขาวิชาระบบสารสนเทศทางการจัดการ</h1>
        <p className="mt-1 text-muted-foreground">รวมไม่น้อยกว่า {CREDITS.total} หน่วยกิต</p>
      </header>
      <Notice>ข้อมูลในหน้านี้สรุปจากข้อความหลักสูตรที่ผู้ใช้ให้มา <b>ไม่ใช่ประกาศทางการ</b> โปรดตรวจทานกับประกาศของคณะฯ ก่อนใช้วางแผนจริง</Notice>

      <section className="rounded-2xl border bg-card p-3 shadow-card md:p-5">
        <h2 className="mb-4 text-xl font-bold">ภาพโครงสร้างหลักสูตร</h2>
        <img
          src="/curriculum_mis.png"
          alt="แผนภาพโครงสร้างหลักสูตรสาขาระบบสารสนเทศทางการจัดการ"
          className="mx-auto h-auto max-h-[75vh] w-full object-contain"
        />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-bold">ความหมายของแต่ละหมวดวิชา</h2>
          <p className="mt-1 text-sm text-muted-foreground">คำอธิบายสั้น ๆ เพื่อช่วยอ่านภาพโครงสร้างหลักสูตร</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {CATEGORIES.map((category, index) => (
            <article key={category.key} className="rounded-xl border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${categoryColors[index]}`} />
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h3 className="font-semibold">{category.key}</h3>
                    <span className="text-sm font-bold text-primary">{categoryCredits[category.key]}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{category.desc}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
