import type { ReactNode } from "react";
import { BrandMark } from "@/components/ui/brand-mark";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-foreground p-12 lg:flex">
        <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-chart-2/25 blur-3xl" />
        <div className="relative flex items-center gap-2.5 text-background">
          <BrandMark className="h-9 w-9 drop-shadow-md" />
          <span className="text-lg font-bold tracking-tight">Zentra</span>
        </div>
        <div className="relative">
          <h1 className="max-w-md text-4xl font-bold leading-tight text-background">
            Plan, track and ship work — all in one place.
          </h1>
          <p className="mt-4 max-w-md text-background/60">
            Organize projects and tasks across workspaces, assign work to your team,
            and stay on top of what matters.
          </p>
        </div>
        <p className="relative text-sm text-background/40">
          © {new Date().getFullYear()} Zentra
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
