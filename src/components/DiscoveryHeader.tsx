import { AppHeader } from "@/components/AppHeader";
import { useFilters } from "@/layouts/DiscoveryLayout";

// ─── DiscoveryHeader ──────────────────────────────────────────────────────────
// Public discovery shell header. Reads filter state from the FiltersContext
// provided by DiscoveryLayout — no prop drilling. Delegates rendering to the
// existing AppHeader implementation.
//
// IMPORTANT: AppHeader should ONLY be used through this wrapper. Internal
// pages (detail / admin) use DetailHeader / AdminHeader instead.

export function DiscoveryHeader() {
  const f = useFilters();
  return (
    <AppHeader
      search={f.search}
      onSearchChange={f.setSearch}
      categoryFilter={f.categoryFilter}
      onCategoryChange={f.setCategoryFilter}
      marketFilter={f.marketFilter}
      onMarketChange={f.setMarketFilter}
      brandFilter={f.brandFilter}
      onBrandChange={f.setBrandFilter}
      exploreFilter={f.exploreFilter}
      onExploreChange={f.setExploreFilter}
      onClearAll={f.clearAll}
      showContributionCta
    />
  );
}
