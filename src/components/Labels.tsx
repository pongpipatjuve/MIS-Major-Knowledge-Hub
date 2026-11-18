import { AlertTriangle, ChevronDown, FlaskConical, Info } from "lucide-react";
import type { ReactNode } from "react";
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
        <div className="text-xs text-muted-foreground">รายการวิชาโทในเว็บนี้ทีมสอบถามมาเอง ไม่ใช่ประกาศทางการ</div>
      </div>
    </div>
  );
}
