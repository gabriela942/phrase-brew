import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo-crm-models.png";

// ─── DetailHeader ─────────────────────────────────────────────────────────────
// Minimal header for detail / secondary pages. Logo on the left, "Voltar"
// button on the right. No search, no filters, no contribution CTA — focus on
// the page content.

interface DetailHeaderProps {
  /** Optional small label between logo and back button (e.g. "Biblioteca / Template"). */
  breadcrumb?: string;
}

export function DetailHeader({ breadcrumb }: DetailHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-card">
      <div className="container flex items-center justify-between gap-3 h-[58px]">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/"
            aria-label="CRM Models — home"
            className="shrink-0 group"
          >
            <img
              src={logo}
              alt="CRM Models"
              className="h-[30px] w-auto transition-opacity group-hover:opacity-75"
            />
          </Link>

          {breadcrumb && (
            <>
              <div className="h-5 w-px bg-border/60 shrink-0" />
              <span className="text-[13px] text-muted-foreground truncate">
                {breadcrumb}
              </span>
            </>
          )}
        </div>

        <button
          onClick={() => navigate(-1)}
          aria-label="Voltar à biblioteca"
          className="group inline-flex items-center gap-2 h-9 px-4 rounded-full border border-primary/25 bg-primary/[0.06] text-primary text-[13px] font-semibold hover:bg-primary/10 hover:border-primary/40 hover:shadow-sm active:scale-[0.98] transition-all shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Voltar à biblioteca</span>
          <span className="sm:hidden">Voltar</span>
        </button>
      </div>
    </header>
  );
}
