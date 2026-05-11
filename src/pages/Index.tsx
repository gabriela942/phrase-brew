import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroCarousel } from "@/components/HeroCarousel";
import { TemplateCard } from "@/components/TemplateCard";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import { TemplatesSection } from "@/components/TemplatesSection";
import { SiteFooter } from "@/components/SiteFooter";
import { ContributeSection } from "@/components/ContributeSection";
import { ContributorsLeaderboardSection } from "@/components/ContributorsLeaderboardSection";
import { usePublishedTemplates } from "@/lib/hooks";
import { useFilters } from "@/layouts/DiscoveryLayout";
import { Layers, ChevronLeft, ChevronRight } from "lucide-react";

const PER_PAGE = 9;

// ─── Pagination helpers ───────────────────────────────────────────────────────

function pageNumbers(page: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, -1, total];
  if (page >= total - 3)
    return [1, -1, total - 4, total - 3, total - 2, total - 1, total];
  return [1, -1, page - 1, page, page + 1, -2, total];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Index = () => {
  const {
    search,
    channels,
    categoryFilter,
    marketFilter,
    brandFilter,
    tagsFilter,
    exploreFilter,
    page,
    setSearch,
    setChannels,
    setCategoryFilter,
    setMarketFilter,
    setBrandFilter,
    setTagsFilter,
    setExploreFilter,
    setPage,
    clearAll,
  } = useFilters();

  // Ref used by TemplatesSection to know where its sticky toolbar must stop
  const contributeSectionRef = useRef<HTMLElement>(null);

  const { data: templates, isLoading } = usePublishedTemplates({
    search: search || undefined,
    types: channels.length > 0 ? channels : undefined,
    categoryId:
      categoryFilter && categoryFilter !== "all" ? categoryFilter : undefined,
    marketType:
      marketFilter && marketFilter !== "all" ? marketFilter : undefined,
    brand: brandFilter && brandFilter !== "all" ? brandFilter : undefined,
    tags: tagsFilter || undefined,
    explore: exploreFilter || undefined,
  });

  const totalTemplates = templates?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalTemplates / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedTemplates = templates?.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE
  );

  // Grid re-animation key
  const gridKey = [
    channels.join(","),
    categoryFilter,
    marketFilter,
    brandFilter,
    tagsFilter,
    exploreFilter,
    search,
    safePage,
  ].join("|");

  const hasActiveFilters =
    search ||
    channels.length > 0 ||
    categoryFilter ||
    marketFilter ||
    brandFilter ||
    tagsFilter ||
    exploreFilter;

  return (
    <>
      {/* ── Hero Carousel — primeiro bloco visual da home ────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="container pt-6 pb-8"
      >
        <HeroCarousel />
      </motion.section>

      {/* ── Template grid — toolbar sticks only while this section is active ── */}
      <TemplatesSection
        channels={channels}
        onChannelsChange={setChannels}
        resultCount={isLoading ? undefined : totalTemplates}
        isLoading={isLoading}
        contributeSectionRef={contributeSectionRef}
      >

          {/* Active filter chips */}
          <ActiveFilterChips
            search={search}
            channels={channels}
            categoryFilter={categoryFilter}
            marketFilter={marketFilter}
            brandFilter={brandFilter}
            tagsFilter={tagsFilter}
            exploreFilter={exploreFilter}
            onSearchChange={setSearch}
            onChannelsChange={setChannels}
            onCategoryChange={setCategoryFilter}
            onMarketChange={setMarketFilter}
            onBrandChange={setBrandFilter}
            onTagsChange={setTagsFilter}
            onExploreChange={setExploreFilter}
            onClearAll={clearAll}
          />

        {/* Loading skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <div
                key={i}
                className="rounded-[20px] border border-border/40 bg-card animate-pulse"
                style={{ height: "380px" }}
              />
            ))}
          </div>
        ) : paginatedTemplates && paginatedTemplates.length > 0 ? (
          <>
            {/* Grid with stagger animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={gridKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {paginatedTemplates.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.04,
                      duration: 0.32,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    <TemplateCard
                      id={t.id}
                      title={t.title}
                      content={t.content}
                      template_type={t.template_type}
                      copies_count={t.copies_count}
                      views_count={t.views_count}
                      downloads_count={t.downloads_count}
                      tags={t.tags}
                      brand={t.brand}
                      market_type={t.market_type}
                      segment={t.segment}
                      categories={t.categories as any}
                      published_at={t.published_at}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex items-center justify-center gap-1.5 pt-10"
              >
                <button
                  disabled={safePage === 1}
                  onClick={() => setPage(safePage - 1)}
                  aria-label="Página anterior"
                  className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {pageNumbers(safePage, totalPages).map((n, i) =>
                  n < 0 ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="h-9 w-9 flex items-center justify-center text-muted-foreground/40 text-sm select-none"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      aria-label={`Página ${n}`}
                      aria-current={safePage === n ? "page" : undefined}
                      className={[
                        "h-9 min-w-[36px] px-2 rounded-lg text-sm font-medium transition-all duration-200",
                        safePage === n
                          ? "bg-gradient-hero text-white shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                      ].join(" ")}
                    >
                      {n}
                    </button>
                  )
                )}

                <button
                  disabled={safePage === totalPages}
                  onClick={() => setPage(safePage + 1)}
                  aria-label="Próxima página"
                  className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 space-y-4"
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center">
              <Layers className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground">
              Nenhum template encontrado
            </h3>
            <p className="text-[14px] text-muted-foreground max-w-sm mx-auto">
              {hasActiveFilters
                ? "Tente ajustar os filtros acima para ampliar a busca."
                : "Seja o primeiro a contribuir com um modelo!"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="text-[13px] text-primary hover:underline font-medium"
              >
                Limpar filtros
              </button>
            )}
          </motion.div>
        )}
      </TemplatesSection>

      {/* ── How to contribute ─────────────────────────────────────────────── */}
      <ContributeSection ref={contributeSectionRef} />

      {/* ── Top contributors leaderboard ──────────────────────────────────── */}
      <ContributorsLeaderboardSection />

      <SiteFooter />
    </>
  );
};

export default Index;
