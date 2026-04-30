import { useState } from "react";
import { Search, Mail, MessageCircle, Smartphone, Bell, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories, useDistinctFilterValues } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const TYPE_TABS = [
  { value: "", label: "Todos", icon: null },
  { value: "email", label: "Email", icon: Mail },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "sms", label: "SMS", icon: Smartphone },
  { value: "push", label: "Push", icon: Bell },
] as const;

export interface DiscoveryBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: string;
  onTypeChange: (v: string) => void;
  categoryFilter: string;
  onCategoryChange: (v: string) => void;
  marketFilter: string;
  onMarketChange: (v: string) => void;
  brandFilter: string;
  onBrandChange: (v: string) => void;
  resultCount?: number;
}

export function DiscoveryBar({
  search,
  onSearchChange,
  typeFilter,
  onTypeChange,
  categoryFilter,
  onCategoryChange,
  marketFilter,
  onMarketChange,
  brandFilter,
  onBrandChange,
  resultCount,
}: DiscoveryBarProps) {
  const { data: categories } = useCategories();
  const { data: filterValues } = useDistinctFilterValues();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasFilters =
    search || typeFilter || categoryFilter || marketFilter || brandFilter;
  const activeFilterCount = [typeFilter, categoryFilter, marketFilter, brandFilter].filter(
    (v) => v && v !== "all"
  ).length;

  const clearAll = () => {
    onSearchChange("");
    onTypeChange("");
    onCategoryChange("");
    onMarketChange("");
    onBrandChange("");
  };

  return (
    <div className="sticky top-16 z-40 bg-card/96 backdrop-blur-md border-b border-border/60 shadow-[0_2px_16px_-4px_hsl(var(--foreground)/0.07)]">
      <div className="container py-3 space-y-2.5">

        {/* ── Row 1: Search + counter + mobile toggle ── */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              style={{ width: "14px", height: "14px" }}
            />
            <Input
              placeholder="Buscar por marca, categoria ou palavra-chave..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-10 bg-background/70 border-border/50 rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:border-primary/40 transition-all"
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                aria-label="Limpar busca"
              >
                <X style={{ width: "12px", height: "12px" }} />
              </button>
            )}
          </div>

          {/* Result count — desktop */}
          {resultCount !== undefined && (
            <span className="hidden sm:inline text-sm text-muted-foreground whitespace-nowrap tabular-nums font-medium shrink-0">
              {resultCount} {resultCount === 1 ? "template" : "templates"}
            </span>
          )}

          {/* Mobile: toggle filters button */}
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={cn(
              "md:hidden flex items-center gap-1.5 h-10 px-3 rounded-xl border text-sm font-medium transition-colors shrink-0",
              filtersOpen || activeFilterCount > 0
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-background/70 border-border/50 text-muted-foreground hover:text-foreground"
            )}
            aria-label="Filtros"
          >
            <SlidersHorizontal style={{ width: "13px", height: "13px" }} />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Row 2: Channel tabs + dropdowns ── */}
        {/* Always visible on desktop; toggleable on mobile */}
        <div
          className={cn(
            "flex items-center gap-2 flex-wrap",
            "hidden md:flex", // desktop: always shown
            filtersOpen && "!flex" // mobile: shown when open
          )}
        >
          {/* Channel segmented tabs */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-lg gap-0.5 overflow-x-auto shrink-0">
            {TYPE_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  onClick={() => onTypeChange(tab.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-[7px] rounded-[7px] text-[12.5px] font-medium transition-all duration-150 whitespace-nowrap",
                    typeFilter === tab.value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {Icon && <Icon style={{ width: "12px", height: "12px" }} />}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-border/50 shrink-0 hidden sm:block" />

          {/* Categoria */}
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger className="h-8 w-auto min-w-[130px] max-w-[160px] text-[12.5px] bg-background/70 border-border/50 rounded-lg">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Mercado */}
          <Select value={marketFilter} onValueChange={onMarketChange}>
            <SelectTrigger className="h-8 w-auto min-w-[120px] max-w-[150px] text-[12.5px] bg-background/70 border-border/50 rounded-lg">
              <SelectValue placeholder="Mercado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos mercados</SelectItem>
              {filterValues?.marketTypes?.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Marca */}
          <Select value={brandFilter} onValueChange={onBrandChange}>
            <SelectTrigger className="h-8 w-auto min-w-[120px] max-w-[150px] text-[12.5px] bg-background/70 border-border/50 rounded-lg">
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent className="max-h-56">
              <SelectItem value="all">Todas marcas</SelectItem>
              {filterValues?.brands?.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Limpar */}
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-8 px-2.5 text-[12.5px] text-muted-foreground hover:text-destructive gap-1"
            >
              <X style={{ width: "12px", height: "12px" }} />
              Limpar
            </Button>
          )}
        </div>

        {/* Mobile: result count below filters when open */}
        {filtersOpen && resultCount !== undefined && (
          <p className="text-xs text-muted-foreground font-medium sm:hidden">
            {resultCount} {resultCount === 1 ? "template encontrado" : "templates encontrados"}
          </p>
        )}
      </div>
    </div>
  );
}
