"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// import {
//   LayoutDashboard,
//   Briefcase,
//   Newspaper,
//   CalendarClock,
//   BrainCircuit,
//   BarChart3,
//   MessageSquare,
//   LogOut,
// } from "lucide-react";

import { LogOut} from "lucide-react"
import { cn } from "@/lib/utils";
import { adminSignOut } from "@/lib/actions";
import { SignalMark } from "@/components/portfolio/signal-waveform";


import { ADMIN_LINKS } from "@/components/admin/admin-nav-links";
const LINKS = ADMIN_LINKS;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <SignalMark className="h-5 w-5" />
        <span className="font-display text-sm text-foreground">Admin</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-signal-amber/10 font-medium text-signal-amber"
                  : "text-foreground-muted hover:bg-white/5 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <form action={adminSignOut} className="border-t border-border p-3">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground-muted transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </form>
    </aside>
  );
}
