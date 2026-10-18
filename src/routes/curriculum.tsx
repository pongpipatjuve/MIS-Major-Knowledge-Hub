import { createFileRoute, Link } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import { CORE_CODES, CREDITS, GENED_GROUPS, MAJOR_ELECTIVE_CODES, MAJOR_REQUIRED_CODES, OTHER_ELECTIVE_RULES, PENDING_QUESTIONS } from "@/lib/curriculum";
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

function Codes({ codes }: { codes: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {codes.map((c) => <Link key={c} to="/course/$code" params={{ code: c }} className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs hover:text-primary">{c}</Link>)}
    </div>
  );
}

function Card({ title, credits, children }: { title: string; credits: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2"><h3 className="font-semibold">{title}</h3><span className="shrink-0 font-bold text-primary">{credits}</span></div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function Curriculum() {
  const bar = [
    { label: "GenEd", n: CREDITS.genEd, cls: "bg-block-2" },
    { label: "หมวดวิชาเฉพาะ", n: CREDITS.specific, cls: "bg-primary" },
    { label: "เลือกเสรี", n: CREDITS.free, cls: "bg-block-5" },
  ];
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">หลักสูตรบริหารธุรกิจบัณฑิต สาขาวิชาระบบสารสนเทศทางการจัดการ</h1>
        <p className="mt-1 text-muted-foreground">รวมไม่น้อยกว่า {CREDITS.total} หน่วยกิต</p>
      </header>
      <Notice>ข้อมูลในหน้านี้สรุปจากข้อความหลักสูตรที่ผู้ใช้ให้มา <b>ไม่ใช่ประกาศทางการ</b> โปรดตรวจทานกับประกาศของคณะฯ ก่อนใช้วางแผนจริง</Notice>

      <div>
        <div className="flex h-8 overflow-hidden rounded-lg">
          {bar.map((b) => <div key={b.label} className={b.cls} style={{ width: `${(b.n / CREDITS.total) * 100}%` }} title={`${b.label} ${b.n}`} />)}
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          {bar.map((b) => <span key={b.label} className="flex items-center gap-1.5"><span className={`h-3 w-3 rounded ${b.cls}`} />{b.label} {b.n}</span>)}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">1. หมวดวิชาศึกษาทั่วไป (GenEd)</h2>
        <Card title="GenEd" credits={`${CREDITS.genEd} หน่วยกิต`}>
          รายวิชาที่ศูนย์การศึกษาทั่วไปประกาศ ใน 5 กลุ่ม: {GENED_GROUPS.join(" · ")} โดยต้องเป็นรายวิชานอกคณะฯ และมีรายวิชาภาษาอังกฤษตามรายการของหลักสูตร (ยังไม่มีรายการรายวิชาที่ยืนยันได้)
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">2. หมวดวิชาเฉพาะ {CREDITS.specific} หน่วยกิต</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Card title="วิชาแกน" credits={`${CREDITS.core} หน่วยกิต`}><Codes codes={CORE_CODES} /></Card>
          <Card title="วิชาบังคับสาขา" credits={`${CREDITS.majorRequired} หน่วยกิต`}><Codes codes={MAJOR_REQUIRED_CODES} /></Card>
          <Card title="วิชาเลือกสาขา" credits={`อย่างน้อย ${CREDITS.majorElective} หน่วยกิต`}><Codes codes={MAJOR_ELECTIVE_CODES} /></Card>
          <Card title="วิชาเลือกในหมวดวิชาเฉพาะ (ตามเงื่อนไข)" credits={`อย่างน้อย ${CREDITS.otherElective} หน่วยกิต`}>
            <p className="mt-1">เลือกจากรายวิชาต่อไปนี้:</p>
            <ul className="mt-1 list-disc pl-5">{OTHER_ELECTIVE_RULES.map((r) => <li key={r}>{r}</li>)}</ul>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">3. หมวดวิชาเลือกเสรี</h2>
        <Card title="วิชาเลือกเสรี" credits={`${CREDITS.free} หน่วยกิต`} />
      </section>

      <section className="rounded-2xl border border-warning bg-card p-5">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-bold"><HelpCircle className="h-5 w-5 text-warning" /> ประเด็นที่รอยืนยัน</h2>
        <p className="mb-2 text-sm text-muted-foreground">จุดต่อไปนี้ข้อมูลยังไม่ชัด เว็บนี้จะไม่ตีความแทน กรุณาสอบถามฝ่ายวิชาการ</p>
        <ul className="list-disc space-y-1 pl-5 text-sm">{PENDING_QUESTIONS.map((p) => <li key={p}>{p}</li>)}</ul>
      </section>
    </div>
  );
}
