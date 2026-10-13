import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/admin/LoginForm";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { Sparkle, Star4 } from "@/components/ui/Sparkle";
import { brand } from "@/data/store";
import { getAdminState } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[3fr_2fr]">
      <BrandPanel />
      <div className="flex items-center justify-center bg-surface px-5 py-12 sm:px-10">
        <Suspense fallback={<div className="h-96 w-full max-w-sm animate-pulse rounded-4xl bg-paper" />}>
          <LoginGate />
        </Suspense>
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <div
      className="relative flex flex-col justify-between gap-10 overflow-hidden bg-accent bg-grid p-8 text-white sm:p-12 lg:min-h-screen lg:p-16"
      style={{ "--grid-line": "rgb(255 255 255 / 0.1)" } as React.CSSProperties}
    >
      <Star4 className="absolute top-[18%] right-[12%] size-10 text-white/25" />
      <Star4 className="absolute bottom-[22%] left-[55%] size-6 text-white/20" />
      <div className="absolute -right-24 -bottom-24 size-96 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />

      <div className="relative flex items-center justify-between gap-4">
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide uppercase backdrop-blur">
          Admin
        </span>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to the store
        </Link>
      </div>

      <div className="relative">
        <p className="text-5xl font-bold tracking-tight uppercase sm:text-6xl lg:text-7xl xl:text-8xl">
          {brand.name}
          <span className="text-night">.</span>
        </p>
        <p className="mt-4 flex items-center gap-1 text-xl font-medium text-white/90 sm:text-2xl">
          {brand.tagline}
          <Sparkle className="size-6 -translate-y-3 text-white" />
        </p>
      </div>

      <p className="relative hidden text-sm text-white/70 lg:block">
        Manage products, stock and orders · © {brand.copyrightYear} {brand.name}
      </p>
    </div>
  );
}

async function LoginGate() {
  const state = await getAdminState();
  if (state.status === "admin") redirect("/admin");
  if (state.status === "unconfigured") return <SetupNotice />;

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-muted">Sign in to manage the store.</p>
      <div className="mt-8">
        <LoginForm
          notice={state.status === "not-admin" ? "This account isn't an admin. Sign in with an admin account." : undefined}
        />
      </div>
    </div>
  );
}
