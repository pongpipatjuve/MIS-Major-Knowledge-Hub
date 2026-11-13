import { createFileRoute } from "@tanstack/react-router";
import { CATEGORIES, CREDITS, REGISTRATION_TIPS } from "@/lib/curriculum";
import { Notice } from "@/components/Labels";

export const Route = createFileRoute("/curriculum")({
  head: () => ({
    meta: [
      { title: "โครงสร้างหลักสูตร MIS 138 หน่วยกิต — MIS Major Knowledge Hub" },
      { name: "description", content: "สรุปโครงสร้างหลักสูตรบริหารธุรกิจบัณฑิต สาขาระบบสารสนเทศทางการจัดการ แบบอ่านง่าย" },
      { property: "og:title", content: "โครงสร้างหลักสูตร MIS" },
      { property: "og:description", content: "หมวดศึกษาทั่วไป 33 (GenEd 12 + ภาษาต่างประเทศ 21) · หมวดวิชาเฉพาะ 99 · วิชาเลือกเสรี 6 รวมไม่น้อยกว่า 138 หน่วยกิต" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Curriculum,
});

function Curriculum() {
  const categoryCredits: Record<string, string> = {
    GenEd: `${CREDITS.genEd} หน่วยกิต (GenEd ${CREDITS.genEdOnly} + ภาษาต่างประเทศ ${CREDITS.foreignLanguage})`,
    วิชาแกน: `${CREDITS.core} หน่วยกิต`,
    วิชาบังคับสาขา: `${CREDITS.majorRequired} หน่วยกิต`,
    วิชาเลือกสาขา: `อย่างน้อย ${CREDITS.majorElective} หน่วยกิต`,
    วิชาเลือก: `อย่างน้อย ${CREDITS.otherElective} หน่วยกิต`,
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

      <section className="rounded-2xl border bg-card p-3 shadow-card md:p-5">
        <h2 className="text-xl font-bold">ภาพแผนการศึกษา รหัส 66 (MIS)</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          ภาพจากไฟล์ต้นฉบับของสาขา กดที่ภาพเพื่อเปิดขนาดเต็มและขยายดูในมือถือได้ หรือ{" "}
          <a href="/studyplan_66_MIS.pdf" target="_blank" rel="noopener noreferrer" className="text-primary underline">
            เปิดเป็นไฟล์ PDF
          </a>
        </p>
        <div className="space-y-3">
          <a href="/studyplan_66_MIS.png" target="_blank" rel="noopener noreferrer">
            <img
              src="/studyplan_66_MIS.png"
              alt="แผนการศึกษาสาขาระบบสารสนเทศทางการจัดการ นิสิตรหัส 66 ชั้นปีที่ 1 ถึง 4"
              loading="lazy"
              className="mx-auto h-auto w-full max-w-3xl rounded-lg border"
            />
          </a>
          <a href="/studyplan_66_MIS_notes.png" target="_blank" rel="noopener noreferrer">
            <img
              src="/studyplan_66_MIS_notes.png"
              alt="หมายเหตุท้ายแผนการศึกษา วิชาเลือกสาขา วิชาเลือก และวิชาเลือกเสรี"
              loading="lazy"
              className="mx-auto h-auto w-full max-w-3xl rounded-lg border"
            />
          </a>
        </div>
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

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-bold">เสรี เลือกสาขา วิชาเลือก วิชาโทนอกคณะ รหัส 300 ต่างกันยังไง</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            ตารางเทียบสั้น ๆ จากข้อความหลักสูตร — <b>วิชาระดับปริญญาตรีรหัส 300 ขึ้นไปกับวิชาโทนอกคณะไม่ใช่หมวดแยก</b> แต่เป็นแหล่งที่เลือกมานับเป็น “วิชาเลือก” ได้
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted text-xs">
              <tr>
                <th className="p-3">ชื่อเรียก</th>
                <th className="p-3">หน่วยกิต</th>
                <th className="p-3">คืออะไร / เลือกจากไหน</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-3 font-semibold">วิชาเลือกสาขา</td>
                <td className="p-3">อย่างน้อย {CREDITS.majorElective}</td>
                <td className="p-3">วิชาเลือกของสาขา MIS ต้องเรียนให้ครบ {CREDITS.majorElective} หน่วยกิตก่อน ส่วนที่เกินนับเป็นวิชาเลือกได้</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">วิชาเลือก</td>
                <td className="p-3">อย่างน้อย {CREDITS.otherElective}</td>
                <td className="p-3">
                  เลือกได้จาก 3 แหล่ง: (1) วิชาเลือกสาขา MIS ส่วนที่เกิน (2) วิชาระดับปริญญาตรีของคณะฯ ที่มีรหัส 3 ตัวหลังตั้งแต่ 300 ขึ้นไป
                  (3) วิชาโทนอกคณะ ไม่รวมวิชา GenEd
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">วิชาระดับปริญญาตรี รหัส 3 ตัวหลังตั้งแต่ 300 ขึ้นไป</td>
                <td className="p-3">นับในวิชาเลือก</td>
                <td className="p-3">แหล่งที่ (2) ของวิชาเลือก ใช้ตัวกรองในหน้าค้นหา: เลือก “วิชาเลือก” แล้วเลือกแถบนี้ (เราตีความ “คณะฯ” = CBS และรหัส 500 ขึ้นไปเป็นระดับบัณฑิตศึกษา)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">วิชาโทนอกคณะ</td>
                <td className="p-3">นับในวิชาเลือก</td>
                <td className="p-3">แหล่งที่ (3) ของวิชาเลือก ใช้ตัวกรองในหน้าค้นหา: เลือก “วิชาเลือก” แล้วเลือก “วิชาโทนอกคณะ” รายการได้จากการสอบถามหน่วยงานโดยตรงโดยสมาชิกกลุ่ม</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">GenEd</td>
                <td className="p-3">{CREDITS.genEdOnly}</td>
                <td className="p-3">
                  อยู่ในหมวดศึกษาทั่วไป {CREDITS.genEd} หน่วยกิต (ส่วนที่เหลือ {CREDITS.foreignLanguage} หน่วยกิตคือภาษาต่างประเทศ ดูด้านล่าง)
                  เลือกวิชาอะไรก็ได้ที่ศูนย์การศึกษาทั่วไปประกาศ นิสิตตั้งแต่ปีการศึกษา 2566 ได้ผลเป็น S/U (ไม่มีเกรด)
                  นับเป็นวิชาเลือกหรือวิชาโทไม่ได้ แต่ลงเป็นวิชาเลือกเสรีได้
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">ภาษาต่างประเทศ</td>
                <td className="p-3">{CREDITS.foreignLanguage}</td>
                <td className="p-3">
                  วิชาบังคับ 7 วิชา (ดูรายการด้านล่าง) ได้ผลเป็นเกรด ยกเว้น 5500415 ที่บังคับเรียนแต่ได้ผลเป็น S/U
                  เป็นวิชาบังคับจึงนับเป็นวิชาเลือกเสรีไม่ได้
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">วิชาเลือกเสรี</td>
                <td className="p-3">{CREDITS.free}</td>
                <td className="p-3">
                  ลงวิชาอะไรของมหาวิทยาลัยก็ได้ ผลจะเป็นเกรดหรือ S/U ก็ได้ รวมวิชา GenEd (ได้ผล S/U แต่ยังนับเป็นวิชาเลือกเสรี) ยกเว้นวิชาบังคับที่ต้องเรียนอยู่แล้ว
                  และวิชาที่มีเงื่อนไขพิเศษ เช่น เปิดเฉพาะบางคณะหรือต้องผ่านวิชาก่อนหน้า ถ้าไม่มีเงื่อนไขเหล่านี้ลงได้ทุกวิชา
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Notice>
          ตารางนี้สรุปจากข้อความหลักสูตรและความเข้าใจของกลุ่มเรา ไม่ใช่ประกาศทางการ ข้อสงสัยที่ยังรอยืนยัน เช่น วิชาเลือกสาขาที่เกิน 12 นับรวมในวิชาเลือกจริงหรือไม่
          และวิชาเลือก 15 หน่วยกิตมีขั้นต่ำแยกตามแต่ละแหล่งหรือไม่ โปรดถามอาจารย์ที่ปรึกษาหรือฝ่ายวิชาการของคณะ
        </Notice>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-5">
        <h2 className="text-xl font-bold">วางแผนลงทะเบียนแต่ละเทอม</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          {REGISTRATION_TIPS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <Notice>สรุปจากความเข้าใจของกลุ่มเรา ไม่ใช่ประกาศทางการ โปรดตรวจสอบที่ Reg Chula และสอบถามอาจารย์ที่ปรึกษา</Notice>
      </section>
    </div>
  );
}
