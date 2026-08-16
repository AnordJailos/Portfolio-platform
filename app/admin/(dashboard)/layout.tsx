// import { AdminSidebar } from "@/components/admin/admin-sidebar";

// export const metadata = { title: "Admin", robots: { index: false, follow: false } };

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex min-h-screen">
//       <AdminSidebar />
//       <div className="flex-1">{children}</div>
//     </div>
//   );
// }


import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

// Belt-and-suspenders alongside the root layout's `dynamic = "force-dynamic"`:
// admin pages are session-gated and show live data (booking counts, unread
// messages) — they must never be cached or statically prerendered, even if
// the root layout's setting is ever loosened for the public site later.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
