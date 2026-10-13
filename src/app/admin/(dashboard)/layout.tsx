import { Suspense } from "react";
import { AdminNav, AdminNavShell } from "@/components/admin/AdminNav";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:grid lg:grid-cols-[260px_1fr]">
      <Suspense fallback={<AdminNavShell pathname={null} showSignOut={isSupabaseConfigured} />}>
        <AdminNav showSignOut={isSupabaseConfigured} />
      </Suspense>
      <main className="min-w-0 px-4 py-6 sm:px-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
