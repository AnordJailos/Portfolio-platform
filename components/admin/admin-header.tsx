import Link from "next/link";
import { ExternalLink, Menu, LogOut } from "lucide-react";
import { auth } from "@/lib/auth";
import { adminSignOut } from "@/lib/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetClose } from "@/components/ui/sheet";
import { ADMIN_LINKS } from "@/components/admin/admin-nav-links";
// import { ADMIN_LINKS } from "@/components/admin/admin-sidebar";


export async function AdminHeader({ title, description }: { title: string; description?: string }) {
  const session = await auth();
  const name = session?.user?.name ?? session?.user?.email ?? "Admin";

  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-border bg-surface/60 px-4 py-3 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open admin menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <nav className="mt-10 flex flex-col gap-1">
              {ADMIN_LINKS.map(({ href, label, icon: Icon }) => (
                <SheetClose asChild key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground-muted hover:bg-white/5 hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </SheetClose>
              ))}
              <form action={adminSignOut} className="mt-4 border-t border-border pt-4">
                <button type="submit" className="flex items-center gap-3 px-3 text-sm text-foreground-muted">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </form>
            </nav>
          </SheetContent>
        </Sheet>
        <div>
          <h1 className="font-display text-lg text-foreground">{title}</h1>
          {description && <p className="text-xs text-foreground-muted">{description}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="hidden items-center gap-1.5 text-sm text-foreground-muted transition-colors hover:text-foreground sm:flex"
        >
          View site <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm text-foreground-muted sm:inline">{name}</span>
        </div>
      </div>
    </header>
  );
}
