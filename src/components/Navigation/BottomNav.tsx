import { Link, useLocation } from "react-router-dom";
import { BarChart3, Calendar, Plus, Ruler, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: BarChart3 },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/log", label: "Log", icon: Plus },
  { path: "/measurements", label: "Measure", icon: Ruler },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === "/measurements" &&
              location.pathname.startsWith("/measurements"));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
