import { NavLink } from "react-router-dom";
import { Archive, CheckCircle2, Inbox, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubmissionCounts, type SubmissionCounts } from "@/hooks/useSubmissionCounts";

const tabs: ReadonlyArray<{
  to: string;
  label: string;
  icon: LucideIcon;
  end: boolean;
  countKey: keyof SubmissionCounts;
}> = [
  { to: "/admin", label: "Inbox", icon: Inbox, end: true, countKey: "inbox" },
  { to: "/admin/approved", label: "Aprovados", icon: CheckCircle2, end: false, countKey: "approved" },
  { to: "/admin/rejected", label: "Reprovados", icon: XCircle, end: false, countKey: "rejected" },
  { to: "/admin/archived", label: "Arquivados", icon: Archive, end: false, countKey: "archived" },
];

export const AdminSubmissionsTabs = () => {
  const { data: counts } = useSubmissionCounts();

  return (
    <nav className="border-b">
      <div className="flex gap-1 flex-wrap">
        {tabs.map(({ to, label, icon: Icon, end, countKey }) => {
          const count = counts?.[countKey];
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
              {count !== undefined && (
                <span className="text-xs text-muted-foreground tabular-nums">({count})</span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
