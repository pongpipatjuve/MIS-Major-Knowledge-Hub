import { Link } from "@tanstack/react-router";
import { Database, Menu, User, X } from "lucide-react";
import { useState } from "react";

const LINKS = [
  { to: "/", label: "หน้าแรก", exact: true },
  { to: "/courses", label: "ค้นหารายวิชา" },
  { to: "/curriculum", label: "หลักสูตร" },
  { to: "/schedule", label: "ตารางเรียน" },
] as const;

export function TopBar() {
  const [open, setOpen] = useState(false);
  const tab = "rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary";
  const nav = (mobile: boolean) =>
    LINKS.map((l) => (
      <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className={`${tab} ${mobile ? "block" : ""}`}
        activeOptions={{ exact: "exact" in l }} activeProps={{ className: "bg-primary !text-primary-foreground" }}>
        {l.label}
      </Link>
    ));
  return (
    <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Database className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-tight sm:text-lg">MIS Major Knowledge Hub</span>
            <span className="hidden text-[10px] text-muted-foreground sm:block">สาขาระบบสารสนเทศทางการจัดการ · CBS จุฬาฯ</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">{nav(false)}</nav>
        <div className="hidden items-center gap-2 rounded-xl border px-3 py-1.5 lg:flex">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-primary"><User className="h-4 w-4" /></span>
          <div className="text-xs leading-tight">
            <div className="font-semibold">โหมดสาธิต</div>
            <div className="text-muted-foreground">ยังไม่ได้เข้าสู่ระบบ</div>
          </div>
        </div>
        <button aria-label="เมนู" onClick={() => setOpen(!open)} className="grid h-9 w-9 place-items-center rounded-lg border md:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && <nav className="space-y-1 border-t px-4 py-3 md:hidden">{nav(true)}<p className="px-4 pt-2 text-xs text-muted-foreground">โหมดสาธิต · ยังไม่ได้เข้าสู่ระบบ</p></nav>}
    </header>
  );
}
