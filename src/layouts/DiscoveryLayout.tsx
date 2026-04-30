import { createContext, useCallback, useContext } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { DiscoveryHeader } from "@/components/DiscoveryHeader";

// ─── Filters context ──────────────────────────────────────────────────────────
// URL is the single source of truth. The layout owns the read/write logic and
// shares it with both the DiscoveryHeader and the page (Index) via context, so
// neither needs to thread props or reimplement URL handling.

export interface FiltersValue {
  search: string;
  channels: string[];
  categoryFilter: string;
  marketFilter: string;
  brandFilter: string;
  tagsFilter: string;
  exploreFilter: string;
  page: number;
  setSearch: (v: string) => void;
  setChannels: (v: string[]) => void;
  setCategoryFilter: (v: string) => void;
  setMarketFilter: (v: string) => void;
  setBrandFilter: (v: string) => void;
  setTagsFilter: (v: string) => void;
  setExploreFilter: (v: string) => void;
  setPage: (n: number) => void;
  clearAll: () => void;
}

const FiltersContext = createContext<FiltersValue | null>(null);

export function useFilters(): FiltersValue {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be used inside <DiscoveryLayout>");
  return ctx;
}

// ─── URL-driven filter state ──────────────────────────────────────────────────

function useUrlFilters(): FiltersValue {
  const [params, setParams] = useSearchParams();

  const search = params.get("q") ?? "";
  const channelsRaw = params.get("type") ?? "";
  const channels = channelsRaw ? channelsRaw.split(",").filter(Boolean) : [];
  const categoryFilter = params.get("category") ?? "";
  const marketFilter = params.get("market") ?? "";
  const brandFilter = params.get("brand") ?? "";
  const tagsFilter = params.get("tags") ?? "";
  const exploreFilter = params.get("explore") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? "1"));

  const setFilter = useCallback(
    (key: string) => (value: string) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value && value !== "all") next.set(key, value);
          else next.delete(key);
          next.delete("page");
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  const setChannels = useCallback(
    (chs: string[]) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (chs.length > 0) next.set("type", chs.join(","));
          else next.delete("type");
          next.delete("page");
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  const setPage = useCallback(
    (p: number) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (p > 1) next.set("page", String(p));
          else next.delete("page");
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  const clearAll = useCallback(() => {
    setParams({}, { replace: true });
  }, [setParams]);

  return {
    search,
    channels,
    categoryFilter,
    marketFilter,
    brandFilter,
    tagsFilter,
    exploreFilter,
    page,
    setSearch: setFilter("q"),
    setChannels,
    setCategoryFilter: setFilter("category"),
    setMarketFilter: setFilter("market"),
    setBrandFilter: setFilter("brand"),
    setTagsFilter: setFilter("tags"),
    setExploreFilter: setFilter("explore"),
    setPage,
    clearAll,
  };
}

// ─── Layout ───────────────────────────────────────────────────────────────────
// Public discovery shell: full-fledged DiscoveryHeader + page outlet.

export function DiscoveryLayout() {
  const filters = useUrlFilters();

  return (
    <FiltersContext.Provider value={filters}>
      <div className="min-h-screen bg-background">
        <DiscoveryHeader />
        <Outlet />
      </div>
    </FiltersContext.Provider>
  );
}
