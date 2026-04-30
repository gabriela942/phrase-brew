import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  X,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-crm-models.png";
import { CategoryPanel } from "@/components/CategoryPanel";
import { MarketPanel } from "@/components/MarketPanel";
import { ExplorePanel, EXPLORE_LABELS } from "@/components/ExplorePanel";
import { BrandPanel } from "@/components/BrandPanel";
import { useCategories } from "@/lib/hooks";

// ─── Types ────────────────────────────────────────────────────────────────────

type PanelId = "category" | "market" | "explore" | "brand";

const PANEL_LABELS: Record<PanelId, string> = {
  category: "Categoria",
  market: "Mercado",
  explore: "Explorar",
  brand: "Marca",
};

export interface AppHeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
  categoryFilter: string;
  onCategoryChange: (v: string) => void;
  marketFilter: string;
  onMarketChange: (v: string) => void;
  brandFilter: string;
  onBrandChange: (v: string) => void;
  exploreFilter: string;
  onExploreChange: (v: string) => void;
  onClearAll: () => void;
  /** When false, hides the info pill + primary CTA (used on internal pages). */
  showContributionCta?: boolean;
}

// ─── Filter trigger button ────────────────────────────────────────────────────

function FilterBtn({
  label,
  isOpen,
  activeCount,
  activeValueLabel,
  onClick,
  onClear,
  className,
}: {
  label: string;
  isOpen: boolean;
  activeCount: number;
  /** Selected value to display next to the label (e.g. "Onboarding"). Truncated. */
  activeValueLabel?: string | null;
  onClick: () => void;
  /** Called when the inline "x" is clicked. Hidden when no filter is active. */
  onClear?: () => void;
  className?: string;
}) {
  const isActive = activeCount > 0;

  return (
    <div
      className={cn(
        "inline-flex items-center h-8 rounded-lg border text-[12.5px] font-medium transition-all duration-150 shrink-0 overflow-hidden",
        isOpen || isActive
          ? "bg-primary/10 border-primary/25 text-primary"
          : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:border-border",
        className
      )}
    >
      <button
        type="button"
        onClick={onClick}
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 h-full pl-3 pr-2 max-w-[220px]"
      >
        <span className="shrink-0">{label}</span>
        {isActive && activeValueLabel && (
          <>
            <span className="opacity-50 shrink-0">:</span>
            <span className="truncate font-semibold" title={activeValueLabel}>
              {activeValueLabel}
            </span>
          </>
        )}
        {isActive && !activeValueLabel && (
          <span className="w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shrink-0">
            {activeCount}
          </span>
        )}
        <ChevronDown
          className={cn(
            "transition-transform duration-200 shrink-0 text-current opacity-60",
            isOpen && "rotate-180"
          )}
          style={{ width: "11px", height: "11px" }}
        />
      </button>

      {isActive && onClear && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          aria-label={`Limpar filtro ${label}`}
          title={`Limpar ${label}`}
          className="flex items-center justify-center h-full w-7 border-l border-primary/20 hover:bg-primary/15 transition-colors"
        >
          <X style={{ width: "11px", height: "11px" }} />
        </button>
      )}
    </div>
  );
}

// ─── Panel content router ─────────────────────────────────────────────────────

function PanelContent({
  panel,
  categoryFilter,
  marketFilter,
  brandFilter,
  exploreFilter,
  onCategoryChange,
  onMarketChange,
  onBrandChange,
  onExploreChange,
  onClose,
}: {
  panel: PanelId;
  categoryFilter: string;
  marketFilter: string;
  brandFilter: string;
  exploreFilter: string;
  onCategoryChange: (v: string) => void;
  onMarketChange: (v: string) => void;
  onBrandChange: (v: string) => void;
  onExploreChange: (v: string) => void;
  onClose: () => void;
}) {
  if (panel === "category") {
    return (
      <CategoryPanel
        activeCategory={categoryFilter}
        onCategorySelect={onCategoryChange}
        onClose={onClose}
      />
    );
  }
  if (panel === "market") {
    return (
      <MarketPanel
        activeMarket={marketFilter}
        onMarketSelect={onMarketChange}
        onClose={onClose}
      />
    );
  }
  if (panel === "brand") {
    return (
      <BrandPanel
        activeBrand={brandFilter}
        onBrandSelect={onBrandChange}
        onClose={onClose}
      />
    );
  }
  return (
    <ExplorePanel
      activeExplore={exploreFilter}
      onExploreSelect={onExploreChange}
      onClose={onClose}
    />
  );
}

// ─── AppHeader ────────────────────────────────────────────────────────────────

export function AppHeader({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  marketFilter,
  onMarketChange,
  brandFilter,
  onBrandChange,
  exploreFilter,
  onExploreChange,
  onClearAll,
  showContributionCta = true,
}: AppHeaderProps) {
  const [openPanel, setOpenPanel] = useState<PanelId | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const closePanel = useCallback(() => setOpenPanel(null), []);

  const togglePanel = useCallback((panel: PanelId) => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  }, []);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closePanel]);

  // Active counts per button
  const categoryActiveCount = categoryFilter ? 1 : 0;
  const marketActiveCount = marketFilter ? 1 : 0;
  const exploreActiveCount = exploreFilter ? 1 : 0;
  const brandActiveCount = brandFilter ? 1 : 0;

  // Resolve active value labels (for inline display on the trigger button)
  const { data: categoryData } = useCategories();
  const categoryLabel = categoryFilter
    ? categoryData?.find((c) => c.id === categoryFilter)?.name ?? null
    : null;
  const exploreLabel = exploreFilter
    ? EXPLORE_LABELS[exploreFilter] ?? exploreFilter
    : null;

  const panelProps = {
    categoryFilter,
    marketFilter,
    brandFilter,
    exploreFilter,
    onCategoryChange,
    onMarketChange,
    onBrandChange,
    onExploreChange,
    onClose: closePanel,
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-200",
        scrolled
          ? "bg-card/96 backdrop-blur-xl border-border/60 shadow-[0_1px_24px_-4px_hsl(var(--foreground)/0.09)]"
          : "bg-card border-border/40"
      )}
    >
      {/* ══════════════════════════════════════════════════════════════════
          Desktop xl+ — single row
         ══════════════════════════════════════════════════════════════════ */}
      <div className="container hidden xl:flex items-center gap-3 h-[58px]">

        {/* Logo */}
        <Link to="/" className="shrink-0 group" aria-label="CRM Models — home">
          <img
            src={logo}
            alt="CRM Models"
            className="h-[30px] w-auto transition-opacity group-hover:opacity-75"
          />
        </Link>

        <div className="h-5 w-px bg-border/60 shrink-0" />

        {/* Search */}
        <div className="relative flex-1 min-w-[148px] max-w-[240px]">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
            style={{ width: "13px", height: "13px" }}
          />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Busca de templates"
            className="pl-7 h-8 bg-muted/50 border-border/50 rounded-lg text-[13px] focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all placeholder:text-muted-foreground/55"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <X style={{ width: "11px", height: "11px" }} />
            </button>
          )}
        </div>

        {/* Filter trigger buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <FilterBtn
            label="Categoria"
            isOpen={openPanel === "category"}
            activeCount={categoryActiveCount}
            activeValueLabel={categoryLabel}
            onClick={() => togglePanel("category")}
            onClear={() => onCategoryChange("")}
          />
          <FilterBtn
            label="Mercado"
            isOpen={openPanel === "market"}
            activeCount={marketActiveCount}
            activeValueLabel={marketFilter || null}
            onClick={() => togglePanel("market")}
            onClear={() => onMarketChange("")}
          />
          <FilterBtn
            label="Explorar"
            isOpen={openPanel === "explore"}
            activeCount={exploreActiveCount}
            activeValueLabel={exploreLabel}
            onClick={() => togglePanel("explore")}
            onClear={() => onExploreChange("")}
          />
          <FilterBtn
            label="Marca"
            isOpen={openPanel === "brand"}
            activeCount={brandActiveCount}
            activeValueLabel={brandFilter || null}
            onClick={() => togglePanel("brand")}
            onClear={() => onBrandChange("")}
          />
        </div>

        {/* Spacer */}
        <div className="flex-1 min-w-0" />

        {showContributionCta && (
          <>
            {/* Editorial microcopy — no button feel, secondary to CTA */}
            <span className="hidden 2xl:inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground whitespace-nowrap shrink-0">
              <span
                aria-hidden="true"
                className="w-1 h-1 rounded-full bg-primary/50"
              />
              Novos modelos toda semana
            </span>

            {/* Primary CTA — collaborative share */}
            <Button
              size="sm"
              className="bg-gradient-hero hover:opacity-95 hover:shadow-md transition-all shadow-sm gap-1.5 text-[13px] font-semibold shrink-0 h-8 px-3.5"
              asChild
            >
              <a href="#como-contribuir">
                <span aria-hidden="true">📩</span>
                Compartilhe um template com a comunidade
              </a>
            </Button>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          Mobile / Tablet < xl — stacked rows
         ══════════════════════════════════════════════════════════════════ */}
      <div className="xl:hidden">

        {/* Row 1 — Logo + CTA */}
        <div className="container flex items-center justify-between h-14">
          <Link to="/" className="shrink-0 group" aria-label="CRM Models — home">
            <img
              src={logo}
              alt="CRM Models"
              className="h-[28px] w-auto transition-opacity group-hover:opacity-75"
            />
          </Link>
          {showContributionCta && (
            <Button
              size="sm"
              className="bg-gradient-hero hover:opacity-95 transition-opacity shadow-sm gap-1.5 h-8 px-3 text-[12px] font-semibold"
              asChild
            >
              <a href="#como-contribuir">
                <span aria-hidden="true">📩</span>
                <span className="hidden sm:inline">Compartilhe um template</span>
                <span className="sm:hidden">Compartilhe</span>
              </a>
            </Button>
          )}
        </div>

        {/* Row 2 — Search */}
        <div className="container pb-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
              style={{ width: "13px", height: "13px" }}
            />
            <Input
              placeholder="Buscar por marca, categoria ou palavra-chave..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Busca de templates"
              className="pl-9 h-10 bg-muted/50 border-border/50 rounded-xl text-[13px] focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 placeholder:text-muted-foreground/55"
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                <X style={{ width: "12px", height: "12px" }} />
              </button>
            )}
          </div>
        </div>

        {/* Row 3 — Filter buttons (scrollable) */}
        <div className="container pb-2.5 overflow-x-auto">
          <div className="flex items-center gap-2 w-max">
            <FilterBtn
              label="Categoria"
              isOpen={openPanel === "category"}
              activeCount={categoryActiveCount}
              activeValueLabel={categoryLabel}
              onClick={() => togglePanel("category")}
              onClear={() => onCategoryChange("")}
              className="h-[34px]"
            />
            <FilterBtn
              label="Mercado"
              isOpen={openPanel === "market"}
              activeCount={marketActiveCount}
              activeValueLabel={marketFilter || null}
              onClick={() => togglePanel("market")}
              onClear={() => onMarketChange("")}
              className="h-[34px]"
            />
            <FilterBtn
              label="Explorar"
              isOpen={openPanel === "explore"}
              activeCount={exploreActiveCount}
              activeValueLabel={exploreLabel}
              onClick={() => togglePanel("explore")}
              onClear={() => onExploreChange("")}
              className="h-[34px]"
            />
            <FilterBtn
              label="Marca"
              isOpen={openPanel === "brand"}
              activeCount={brandActiveCount}
              activeValueLabel={brandFilter || null}
              onClick={() => togglePanel("brand")}
              onClear={() => onBrandChange("")}
              className="h-[34px]"
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          Mega panel system
          - Desktop (xl+): absolute below header
          - Mobile (<xl): fixed fullscreen overlay
         ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {openPanel && (
          <>
            {/* ── Desktop backdrop (click-outside) ── */}
            <motion.div
              key="backdrop"
              className="hidden xl:block fixed inset-0 bg-black/10"
              style={{ zIndex: -1 }} // below the header's z-50 content
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={closePanel}
              aria-hidden="true"
            />

            {/* ── Desktop panel: absolute below header ── */}
            <motion.div
              key={`panel-desktop-${openPanel}`}
              className="hidden xl:block absolute top-full left-0 right-0 bg-card border-b border-border/60 shadow-[0_16px_48px_-12px_hsl(var(--foreground)/0.15)]"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="container">
                <PanelContent panel={openPanel} {...panelProps} />
              </div>
            </motion.div>

            {/* ── Mobile panel: fixed fullscreen overlay ── */}
            <motion.div
              key={`panel-mobile-${openPanel}`}
              className="xl:hidden fixed inset-0 bg-background overflow-y-auto flex flex-col"
              style={{ zIndex: 60 }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Mobile panel header */}
              <div className="sticky top-0 bg-background/96 backdrop-blur-xl border-b border-border/40 flex items-center gap-3 px-4 h-14 shrink-0">
                <button
                  onClick={closePanel}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Fechar"
                >
                  <ArrowLeft style={{ width: "16px", height: "16px" }} />
                </button>
                <span className="font-semibold text-sm text-foreground">
                  {PANEL_LABELS[openPanel]}
                </span>
              </div>

              {/* Mobile panel content */}
              <div className="container flex-1 overflow-y-auto">
                <PanelContent panel={openPanel} {...panelProps} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
