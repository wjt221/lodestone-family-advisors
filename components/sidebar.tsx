"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  FileText,
  Scale,
  ShieldAlert,
  Briefcase,
  Layers,
  Search,
  Droplets,
  TrendingUp,
  Users,
  CalendarDays,
  FolderOpen,
  Settings,
} from "lucide-react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { CLIENT } from "@/lib/mock-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Command Center", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Strategy & Policy",
    items: [
      { label: "Strategy", href: "/strategy", icon: Compass },
      { label: "Policy Statement", href: "/ips", icon: FileText },
      { label: "Allocation", href: "/allocation", icon: Scale },
      { label: "Risk Register", href: "/risk", icon: ShieldAlert },
    ],
  },
  {
    title: "Portfolio",
    items: [
      { label: "Portfolio", href: "/portfolio", icon: Briefcase },
      { label: "Owners & Entities", href: "/entities", icon: Users },
      { label: "Performance", href: "/performance", icon: TrendingUp },
      { label: "Liquidity", href: "/liquidity", icon: Droplets },
      { label: "Pipeline", href: "/investments", icon: Layers },
      { label: "Diligence", href: "/diligence", icon: Search },
    ],
  },
  {
    title: "Governance",
    items: [
      { label: "Meetings", href: "/meetings", icon: CalendarDays },
      { label: "Documents", href: "/documents", icon: FolderOpen },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      {/* Wordmark */}
      <div className="px-6 pb-5 pt-6">
        <Link href="/dashboard" className="block">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-medium tracking-tight text-white">
              Lodestone
            </span>
            <span className="h-4 w-px bg-sidebar-border" />
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand">
              Family Advisors
            </span>
          </div>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/45">
            Investment OS
          </p>
        </Link>
      </div>

      <div className="mx-6 h-px bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-6">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/35">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors",
                        active
                          ? "bg-sidebar-accent text-white"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white",
                      )}
                    >
                      {active && (
                        <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-brand" />
                      )}
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          active
                            ? "text-brand"
                            : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/70",
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Client / advisor footer */}
      <div className="mx-6 h-px bg-sidebar-border" />
      <div className="px-6 py-5">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-md py-1 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-[13px] font-medium text-brand">
            {isSupabaseConfigured() ? "LF" : "SC"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-white">
              {isSupabaseConfigured() ? "Lodestone Family Advisors" : CLIENT.advisor}
            </p>
            <p className="truncate text-[11px] text-sidebar-foreground/45">
              Lead Advisor
            </p>
          </div>
          <Settings className="ml-auto h-4 w-4 shrink-0 text-sidebar-foreground/40" />
        </Link>
        {isSupabaseConfigured() && (
          <form action="/auth/signout" method="post" className="mt-3">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-[12px] text-sidebar-foreground/55 transition-colors hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </form>
        )}
        <p className="mt-4 text-[10px] leading-relaxed text-sidebar-foreground/35">
          Illustrative data. For discussion only — not investment advice.
        </p>
      </div>
    </aside>
  );
}
