import { X } from "lucide-react";
import { useCategories } from "@/lib/hooks";
import { TAGS_LABELS } from "@/components/CategoryPanel";
import { EXPLORE_LABELS } from "@/components/ExplorePanel";

// ─── Label helpers ────────────────────────────────────────────────────────────

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  sms: "SMS",
  push: "Push",
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ActiveFilterChipsProps {
  search: string;
  channels: string[];
  categoryFilter: string;
  marketFilter: string;
  brandFilter: string;
  tagsFilter: string;
  exploreFilter: string;
  onSearchChange: (v: string) => void;
  onChannelsChange: (v: string[]) => void;
  onCategoryChange: (v: string) => void;
  onMarketChange: (v: string) => void;
  onBrandChange: (v: string) => void;
  onTagsChange: (v: string) => void;
  onExploreChange: (v: string) => void;
  onClearAll: () => void;
}

// ─── Chip sub-component ───────────────────────────────────────────────────────

function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      onClick={onRemove}
      className="flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[12px] font-medium hover:bg-primary/15 transition-colors shrink-0"
    >
      <span>{label}</span>
      <X style={{ width: "10px", height: "10px" }} className="opacity-60" />
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ActiveFilterChips({
  search,
  channels,
  categoryFilter,
  marketFilter,
  brandFilter,
  tagsFilter,
  exploreFilter,
  onSearchChange,
  onChannelsChange,
  onCategoryChange,
  onMarketChange,
  onBrandChange,
  onTagsChange,
  onExploreChange,
  onClearAll,
}: ActiveFilterChipsProps) {
  const { data: categories } = useCategories();

  const hasAny =
    search || channels.length > 0 || categoryFilter || marketFilter || brandFilter || tagsFilter || exploreFilter;

  if (!hasAny) return null;

  const catLabel = (() => {
    if (!categoryFilter) return null;
    const cat = categories?.find((c) => c.id === categoryFilter);
    if (!cat) return categoryFilter;
    return cat.icon ? `${cat.icon} ${cat.name}` : cat.name;
  })();

  return (
    <div className="flex items-center gap-2 flex-wrap mb-5 min-h-[28px]">
      {/* Channel chips — one per active channel */}
      {channels.map((ch) => (
        <Chip
          key={ch}
          label={CHANNEL_LABELS[ch] ?? ch}
          onRemove={() => onChannelsChange(channels.filter((c) => c !== ch))}
        />
      ))}
      {categoryFilter && catLabel && (
        <Chip label={catLabel} onRemove={() => onCategoryChange("")} />
      )}
      {tagsFilter && (
        <Chip
          label={TAGS_LABELS[tagsFilter] ?? tagsFilter}
          onRemove={() => onTagsChange("")}
        />
      )}
      {marketFilter && (
        <Chip label={marketFilter} onRemove={() => onMarketChange("")} />
      )}
      {exploreFilter && (
        <Chip
          label={EXPLORE_LABELS[exploreFilter] ?? exploreFilter}
          onRemove={() => onExploreChange("")}
        />
      )}
      {brandFilter && (
        <Chip label={brandFilter} onRemove={() => onBrandChange("")} />
      )}
      {search && (
        <Chip label={`"${search}"`} onRemove={() => onSearchChange("")} />
      )}

      {/* Clear all */}
      <button
        onClick={onClearAll}
        className="flex items-center gap-1 h-7 px-2 text-[12px] font-medium text-muted-foreground hover:text-destructive transition-colors"
      >
        <X style={{ width: "10px", height: "10px" }} />
        Limpar tudo
      </button>
    </div>
  );
}
