import { AlertTriangle, ChevronDown, ExternalLink, FlaskConical, Info } from "lucide-react";
import type { ReactNode } from "react";
import { MINOR_GROUPS_URL } from "@/lib/config";
import { CATEGORIES, type Category } from "@/lib/curriculum";

const CAT_CLASS: Record<Category, string> = {
  GenEd: "bg-block-2",
  วิชาแกน: "bg-block-1",
  วิชาบังคับสาขา: "bg-primary text-primary-foreground",
  วิชาเลือกสาขา: "bg-block-3",
  วิชาเลือก: "bg-block-4",
  วิชาเลือกเสรี: "bg-block-5",
};

export function CategoryBadge({ cat }: { cat?: Category | undefined }) {
  if (!cat) return <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">ยังไม่ระบุหมวด</span>;
  const desc = CATEGORIES.find((c) => c.key === cat)?.desc;
  return <span title={desc} className={`rounded-md px-2 py-0.5 text-xs font-medium ${CAT_CLASS[cat]}`}>{cat}</span>;
}

export function GenEdTag({ label }: { label?: string | undefined }) {
  if (!label) return null;
  return <span className="rounded-md bg-muted px-2 py-0.5 text-xs">{label}</span>;
}

export function MinorTag({ show }: { show: boolean }) {
  if (!show) return null;
  return <span className="rounded-md border border-primary px-2 py-0.5 text-xs text-primary">วิชาโทนอกคณะ</span>;
}

/** ชื่อย่อ (ไม่ใช่ชื่อทางการ) แสดงเมื่อยังไม่มีชื่อเต็มจาก CU Get Reg */
export function ShortName({ name }: { name: string }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="rounded-md bg-muted px-2 py-0.5 text-xs">ชื่อย่อ</span>
      <span className="font-medium">{name}</span>
    </span>
  );
}

export function SampleBadge() {
  return <span className="inline-flex items-center gap-1 rounded-md border border-warning px-2 py-0.5 text-xs text-warning"><FlaskConical className="h-3 w-3" /> ข้อมูลตัวอย่าง</span>;
}

export function NoData({ children = "ยังไม่มีข้อมูล" }: { children?: ReactNode }) {
  return <span className="italic text-muted-foreground">{children}</span>;
}

/**
 * กล่องหมายเหตุสีเหลือง ถ้าใส่ title จะเป็นแถบกดเปิด-ปิด: แสดงหัวข้อสรุป 1 บรรทัด รายละเอียดซ่อนไว้จนกดอ่าน
 */
export function Notice({ children, title }: { children: ReactNode; title?: ReactNode }) {
  if (title) {
    return (
      <details className="group rounded-xl border border-warning bg-card text-sm">
        <summary className="flex cursor-pointer list-none items-start gap-2 p-3 font-medium [&::-webkit-details-marker]:hidden">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <span className="flex-1">{title}</span>
          <span className="shrink-0 text-xs font-normal text-muted-foreground group-open:hidden">อ่านเพิ่ม</span>
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
        </summary>
        <div className="px-3 pb-3 pl-9 leading-6">{children}</div>
      </details>
    );
  }
  return (
    <div className="flex gap-2 rounded-xl border border-warning bg-card p-3 text-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <div>{children}</div>
    </div>
  );
}

/** แถบหัวข้อที่กดเปิด-ปิดได้ (accordion) ใช้ซ่อนข้อความยาว */
export function Collapsible({
  title,
  children,
  defaultOpen = false,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group rounded-xl border bg-card">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 font-semibold [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">{title}</span>
        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4 text-sm leading-6 text-muted-foreground">{children}</div>
    </details>
  );
}

/** กล่องเตือนเรื่องวิชาโทนอกคณะ: ต้องถามทั้งคณะเจ้าของวิชาและคณะเรา */
export function MinorCallout() {
  return (
    <div className="flex gap-3 rounded-xl border-2 border-primary bg-primary-soft p-4 text-sm">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div className="space-y-1">
        <div className="font-bold">ก่อนลงวิชาโทนอกคณะ (เช่น คณะอักษรศาสตร์) ต้องถามให้ครบ 2 ฝั่ง</div>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            <b>คณะหรือภาควิชาเจ้าของวิชา</b> ว่าเปิดให้นิสิตนอกคณะลงไหม มีเกณฑ์รับอย่างไร
          </li>
          <li>
            <b>ฝ่ายวิชาการคณะเรา (CBS)</b> ว่าวิชานั้นนับเป็นวิชาเลือกในหลักสูตรได้ไหม
          </li>
        </ol>
        <a
          href={MINOR_GROUPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-primary underline"
        >
          ประกาศจุฬาฯ: กลุ่มวิชาโทที่เปิดให้นิสิตปริญญาตรี <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <details className="rounded-lg bg-background/70 p-2">
          <summary className="cursor-pointer font-medium">วิธีเช็กวิชาคณะอักษรฯ ว่าลงเป็นวิชาโทได้ไหม</summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>เปิดประกาศด้านบน กดคณะอักษรศาสตร์ แล้วกด Ctrl+F ค้นรหัสวิชา</li>
            <li>
              เจอในส่วน "วิชาโท" (หน้า 1–204) → <b>ลงเป็นวิชาโทได้</b> แม้จะมีในหน้า 211 ขึ้นไปด้วยก็ตาม
            </li>
            <li>
              เจอเฉพาะหน้า 211 ขึ้นไป (รายวิชาที่ให้บริการนิสิตนอกคณะ) ไม่เจอในหน้า 1–204 → <b>ลงเป็นวิชาโทไม่ได้</b>
            </li>
          </ol>
          <p className="mt-2">
            เช่น 2222100 จีนปริทัศน์ อยู่หน้า 73 จึงลงได้ ส่วน 2223041 ญี่ปุ่นเร่งรัด 1 อยู่แค่หน้า 273 จึงลงไม่ได้
          </p>
          <p className="text-xs text-muted-foreground">เลขหน้าคือเลขที่พิมพ์มุมบนของหน้า ไม่ใช่เลขในโปรแกรม PDF</p>
          <p className="mt-1 text-xs font-medium">
            <b>รายการนี้รวบรวมจากการสอบถามทะเบียนคณะ ใช้ได้กับนิสิตภาคพาณิชย์</b> ภาคอื่น (บัญชี การเงิน การตลาด) วิธีตรวจสอบอาจต่างออกไป หากสงสัยควรถามทะเบียนคณะโดยตรง
          </p>
        </details>
        <div className="text-xs text-muted-foreground">
          ประกาศนี้ลงวันที่ 2 ม.ค. 2566 และยังใช้อยู่ ส่วนรายการวิชาโทในเว็บนี้ทีมสอบถามจากทะเบียนคณะ
        </div>
      </div>
    </div>
  );
}
