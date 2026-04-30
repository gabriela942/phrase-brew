import { Link, useLocation } from "react-router-dom";
import { LogOut, Inbox, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo-crm-models.png";

// ─── AdminHeader ──────────────────────────────────────────────────────────────
// Operations-focused header for admin routes. Logo, area identification, and
// admin-specific actions (logout, view public site). No public filters or
// contribution CTA.

const ADMIN_SECTION_LABELS: Record<string, string> = {
  "/admin": "Inbox de Submissões",
};

function getSectionLabel(pathname: string): string {
  if (pathname.startsWith("/admin/review")) return "Revisar submissão";
  return ADMIN_SECTION_LABELS[pathname] ?? "Admin";
}

export function AdminHeader() {
  const { signOut, user } = useAuth();
  const { pathname } = useLocation();
  const sectionLabel = getSectionLabel(pathname);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-card">
      <div className="container flex items-center justify-between gap-3 h-[58px]">
        {/* Identity / breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/admin"
            aria-label="Admin home"
            className="shrink-0 group flex items-center gap-2"
          >
            <img
              src={logo}
              alt="CRM Models"
              className="h-[28px] w-auto transition-opacity group-hover:opacity-75"
            />
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
              Admin
            </span>
          </Link>

          <div className="h-5 w-px bg-border/60 shrink-0" />

          <div className="flex items-center gap-1.5 min-w-0">
            <Inbox className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
            <span className="text-[13px] font-semibold text-foreground truncate">
              {sectionLabel}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {user?.email && (
            <span className="hidden md:inline text-[12px] text-muted-foreground truncate max-w-[200px]">
              {user.email}
            </span>
          )}
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12.5px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            title="Ver site público"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver site
          </Link>
          <button
            onClick={() => signOut()}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12.5px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
