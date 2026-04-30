import { useCategories } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { LayoutGrid } from "lucide-react";

// ─── Backward-compat export ───────────────────────────────────────────────────
// ActiveFilterChips imports TAGS_LABELS to label any legacy `tags` URL param.
// Kept as an empty map since the Tendências UI has been removed.

export const TAGS_LABELS: Record<string, string> = {};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CategoryPanelProps {
  activeCategory: string;
  onCategorySelect: (id: string) => void;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
// Single-select category list. Clicking an already-active category deselects it.
// No multi-selection, no Tendências / tags column.

export function CategoryPanel({
  activeCategory,
  onCategorySelect,
  onClose,
}: CategoryPanelProps) {
  const { data: categories, isLoading } = useCategories();

  return (
    <div className="py-6 pb-8">
      {/* ── Section label ── */}
      <div className="flex items-center gap-2 mb-4">
        <LayoutGrid className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground/50">
          Fluxos Principais
        </span>
        {activeCategory && (
          <button
            onClick={() => { onCategorySelect(""); onClose(); }}
            className="ml-auto text-[11px] text-muted-foreground hover:text-destructive transition-colors font-medium"
          >
            Limpar filtro
          </button>
        )}
      </div>

      {/* ── Category grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-11 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-1">
          {categories?.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                role="radio"
                aria-checked={isActive}
                onClick={() => {
                  // Toggle: click active = deselect; click another = select
                  onCategorySelect(isActive ? "" : cat.id);
                  onClose();
                }}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left text-[13px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                    : "text-foreground/70 hover:bg-muted/70 hover:text-foreground"
                )}
              >
                {cat.icon && (
                  <span className="text-[16px] leading-none shrink-0" aria-hidden="true">
                    {cat.icon}
                  </span>
                )}
                <span className="truncate">{cat.name}</span>
              </button>
            );
          })}

          {!isLoading && (!categories || categories.length === 0) && (
            <p className="col-span-full text-[13px] text-muted-foreground/60 px-3.5 py-3">
              Nenhuma categoria disponível.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
