import { Outlet } from "react-router-dom";
import { DetailHeader } from "@/components/DetailHeader";

// ─── TemplateDetailLayout ─────────────────────────────────────────────────────
// Layout for individual template detail pages and other secondary content.
// Uses the minimal DetailHeader (logo + Voltar) — no public-discovery filters.

export function TemplateDetailLayout() {
  return (
    <div className="min-h-screen bg-background">
      <DetailHeader breadcrumb="Biblioteca / Template" />
      <Outlet />
    </div>
  );
}
