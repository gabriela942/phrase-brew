import { useState, useMemo } from "react";
import { useDistinctFilterValues } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { Tag, Search, ArrowRight, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const FEATURED_COUNT = 8;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BrandPanelProps {
  activeBrand: string;
  onBrandSelect: (brand: string) => void;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
// Shows a small set of featured brands in the mega panel + a "Ver todas as
// marcas" button that opens a dialog with a searchable full list.

export function BrandPanel({ activeBrand, onBrandSelect, onClose }: BrandPanelProps) {
  const { data: filterValues, isLoading } = useDistinctFilterValues();
  const brands = filterValues?.brands ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const featured = brands.slice(0, FEATURED_COUNT);
  const hasMore = brands.length > FEATURED_COUNT;

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => b.toLowerCase().includes(q));
  }, [brands, searchQuery]);

  const selectBrand = (brand: string) => {
    const next = activeBrand === brand ? "" : brand;
    onBrandSelect(next);
    setDialogOpen(false);
    onClose();
  };

  return (
    <div className="py-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 mb-5">
        <Tag className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground/50">
          Marcas em destaque
        </span>
        {activeBrand && (
          <button
            onClick={() => { onBrandSelect(""); onClose(); }}
            className="ml-auto text-[11px] text-muted-foreground hover:text-destructive transition-colors font-medium"
          >
            Limpar seleção
          </button>
        )}
      </div>

      {/* ── Featured grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-1.5">
          {Array.from({ length: FEATURED_COUNT }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : featured.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-1">
          {featured.map((brand) => {
            const isActive = activeBrand === brand;
            return (
              <button
                key={brand}
                role="radio"
                aria-checked={isActive}
                onClick={() => selectBrand(brand)}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-[13px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                    : "text-foreground/70 hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <span className="truncate">{brand}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-[13px] text-muted-foreground/60 px-1">
          Nenhuma marca disponível ainda.
        </p>
      )}

      {/* ── "Ver todas as marcas" CTA ── */}
      {hasMore && (
        <div className="mt-5 pt-5 border-t border-border/40">
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors group"
          >
            Ver todas as marcas
            <span className="text-muted-foreground/70 font-normal">
              ({brands.length})
            </span>
            <ArrowRight
              className="transition-transform group-hover:translate-x-0.5"
              style={{ width: "13px", height: "13px" }}
            />
          </button>
        </div>
      )}

      {/* ── "All brands" dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="z-[70] max-w-[520px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-semibold">Todas as marcas</DialogTitle>
          </DialogHeader>

          {/* Search */}
          <div className="p-4 pb-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none"
                style={{ width: "14px", height: "14px" }}
              />
              <Input
                autoFocus
                placeholder="Buscar marca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-muted/40 border-border/50 rounded-xl text-[13px] focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 placeholder:text-muted-foreground/55"
              />
            </div>
          </div>

          {/* Brand list */}
          <div className="max-h-[420px] overflow-y-auto px-2 pb-3">
            {filtered.length > 0 ? (
              <div className="space-y-0.5">
                {filtered.map((brand) => {
                  const isActive = activeBrand === brand;
                  return (
                    <button
                      key={brand}
                      onClick={() => selectBrand(brand)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-[13px] font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/75 hover:bg-muted/70 hover:text-foreground"
                      )}
                    >
                      <span className="truncate flex-1">{brand}</span>
                      {isActive && (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-8 text-[13px] text-muted-foreground/60">
                Nenhuma marca encontrada para "{searchQuery}".
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
