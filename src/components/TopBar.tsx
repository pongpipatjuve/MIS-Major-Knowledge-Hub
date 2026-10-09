import { Link } from "@tanstack/react-router";
import { GraduationCap, User } from "lucide-react";

export function TopBar() {
  const tab = "rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary";
  return (
    <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold tracking-tight">REG-CBS</span>
            <span className="hidden text-[10px] text-muted-foreground sm:block">Chulalongkorn Business School</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link to="/" className={tab} activeOptions={{ exact: true }} activeProps={{ className: "bg-primary !text-primary-foreground" }}>ค้นหา</Link>
          <Link to="/schedule" className={tab} activeProps={{ className: "bg-primary !text-primary-foreground" }}>ตารางเรียน</Link>
        </nav>
        <div className="hidden items-center gap-2 rounded-xl border px-3 py-1.5 md:flex">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-primary"><User className="h-4 w-4" /></span>
          <div className="text-xs leading-tight">
            <div className="font-semibold">PONGPIPAT P.</div>
            <div className="text-muted-foreground">66xxxxxxxx · บริหารธุรกิจ</div>
          </div>
        </div>
      </div>
    </header>
  );
}
