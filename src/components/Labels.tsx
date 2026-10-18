import { FlaskConical, Info } from "lucide-react";
import type { ReactNode } from "react";
import { CATEGORIES, type Category } from "@/lib/curriculum";

const CAT_CLASS: Record<Category, string> = {
  GenEd: "bg-block-2",
  วิชาแกน: "bg-block-1",
  วิชาบังคับสาขา: "bg-primary text-primary-foreground",
  วิชาเลือกสาขา: "bg-block-3",
  วิชาเลือกตามเงื่อนไข: "bg-block-4",
  วิชาเลือกเสรี: "bg-block-5",
};

export function CategoryBadge({ cat }: { cat?: Category }) {
  if (!cat) return <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">ยังไม่ระบุหมวด</span>;
  const desc = CATEGORIES.find((c) => c.key === cat)?.desc;
  return <span title={desc} className={`rounded-md px-2 py-0.5 text-xs font-medium ${CAT_CLASS[cat]}`}>{cat}</span>;
}

export function SampleBadge() {
  return <span className="inline-flex items-center gap-1 rounded-md border border-warning px-2 py-0.5 text-xs text-warning"><FlaskConical className="h-3 w-3" /> ข้อมูลตัวอย่าง</span>;
}

export function NoData({ children = "ยังไม่มีข้อมูล" }: { children?: ReactNode }) {
  return <span className="italic text-muted-foreground">{children}</span>;
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 rounded-xl border border-warning bg-card p-3 text-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <div>{children}</div>
    </div>
  );
}
