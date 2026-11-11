import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Database, ExternalLink, GraduationCap, Home, Search, type LucideIcon } from "lucide-react";
import { CUGETREG_URL, PETRA_URL, REG_CHULA_URL } from "@/lib/config";

/** ปุ่มลัดไปเว็บภายนอก เรียงตามลำดับที่ใช้จริง: ตรวจหลักสูตร → ลองจัดตาราง → ลงทะเบียนจริง */
const QUICK_LINKS = [
  { label: "Petra", hint: "ดูว่าขาดวิชาอะไร", url: PETRA_URL },
  { label: "CU Get Reg", hint: "ลองลงทะเบียน", url: CUGETREG_URL },
  { label: "Reg Chula", hint: "ลงทะเบียนจริง", url: REG_CHULA_URL },
] as const;

const LINKS = [
  { to: "/", label: "หน้าแรก", exact: true, icon: Home },
  { to: "/courses", label: "ค้นหารายวิชา", icon: Search },
  { to: "/curriculum", label: "หลักสูตร", icon: GraduationCap },
] as const satisfies readonly { to: string; label: string; icon: LucideIcon; exact?: boolean }[];

/** ปุ่มย้อนกลับในเว็บ แสดงทุกหน้ายกเว้นหน้าแรก สำหรับคนที่ใช้มือถือแล้วไม่มีปุ่มย้อนกลับของเบราว์เซอร์ */
function BackButton() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/") return null;
  const goBack = () => {
    // ย้อนกลับเฉพาะเมื่อมีหน้าก่อนหน้า "ในเว็บเรา" เท่านั้น ถ้าคนเข้ามาจากลิงก์ภายนอก (เช่น กลุ่มแชต) จะไม่พาออกจากเว็บ
    // แต่พาไปหน้าที่เหมาะสมในเว็บแทน: หน้าวิชา -> รายการวิชา, หน้าอื่น -> หน้าแรก
    const state = router.history.location.state as unknown as { __TSR_index?: number };
    const index = state.__TSR_index;
    const hasPreviousInSite =
      typeof index === "number" ? index > 0 : typeof window !== "undefined" && window.history.length > 1;
    if (hasPreviousInSite) router.history.back();
    else void router.navigate({ to: pathname.startsWith("/course/") ? "/courses" : "/" });
  };
  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="ย้อนกลับ"
      title="ย้อนกลับ"
      className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border bg-card px-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="hidden sm:inline">ย้อนกลับ</span>
    </button>
  );
}

export function TopBar() {
  const tab = "rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary";
  const nav = () =>
    LINKS.map((l) => (
      <Link key={l.to} to={l.to} className={tab}
        activeOptions={{ exact: "exact" in l }} activeProps={{ className: "bg-primary !text-primary-foreground" }}>
        {l.label}
      </Link>
    ));
  return (
    <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <BackButton />
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Database className="h-5 w-5" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-base font-bold tracking-tight sm:text-lg">MIS Major Knowledge Hub</span>
              <span className="hidden text-[10px] text-muted-foreground sm:block">สาขาระบบสารสนเทศทางการจัดการ · CBS จุฬาฯ</span>
            </span>
          </Link>
        </div>
        <nav className="hidden items-center gap-1 md:flex">{nav()}</nav>
      </div>
      <div className="border-t bg-muted/40">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-1.5 text-xs">
          <span className="shrink-0 text-muted-foreground">เว็บภายนอก:</span>
          {QUICK_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border bg-card px-3 py-1 font-medium transition hover:border-primary hover:text-primary"
            >
              {l.label}
              <span className="font-normal text-muted-foreground">· {l.hint}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}

/** แถบเมนูล่างจอสำหรับมือถือ (จอคอมใช้เมนูด้านบนแทน) */
export function BottomNav() {
  return (
    <>
      {/* ช่องว่างกันไม่ให้แถบเมนูบังท้ายหน้า */}
      <div className="h-16 md:hidden" aria-hidden="true" />
      <nav
        aria-label="เมนูหลัก"
        className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 backdrop-blur md:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-3">
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                activeOptions={{ exact: "exact" in l }}
                className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground transition"
                activeProps={{ className: "text-primary" }}
              >
                <l.icon className="h-5 w-5" />
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
