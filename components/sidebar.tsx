"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  FileText,
  PieChart,
  Droplets,
  ShieldAlert,
  Briefcase,
  Search,
  CalendarDays,
  FolderOpen,
  Settings,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Strategy",
    items: [
      { label: "Strategy", href: "/strategy", icon: Compass },
      { label: "IPS", href: "/ips", icon: FileText },
      { label: "Allocation", href: "/allocation", icon: PieChart },
      { label: "Risk", href: "/risk", icon: ShieldAlert },
    ],
  },
  {
    title: "Portfolio",
    items: [
      { label: "Portfolio", href: "/portfolio", icon: Briefcase },
      { label: "Investments", href: "/investments", icon: TrendingUp },
      { label: "Due Diligence", href: "/diligence", icon: Search },
      { label: "Liquidity", href: "/liquidity", icon: Droplets },
    ],
  },
  {
    title: "Advisory",
    items: [
      { label: "Meetings", href: "/meetings", icon: CalendarDays },
      { label: "Documents", href: "/documents", icon: FolderOpen },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 text-slate-100 shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-sm">
            LFA
          </div>
          <div>
            <div className="font-semibold text-white text-sm leading-tight">
              Lodestone Family
            </div>
            <div className="text-xs text-slate-400 leading-tight">
              Investment OS
            </div>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-blue-600 text-white font-medium"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700 text-xs text-slate-500">
        <p>Illustrative data only.</p>
        <p>Not investment advice.</p>
      </div>
    </aside>
  );
}
