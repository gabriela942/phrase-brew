import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { SearchFilters } from "@/components/SearchFilters";
import { TemplateCard } from "@/components/TemplateCard";
import { usePublishedTemplates } from "@/lib/hooks";
import { Layers, Mail, ArrowRight, ChevronLeft, ChevronRight, Send, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SponsorsSection } from "@/components/SponsorsSection";

const TEMPLATES_PER_PAGE = 9;

const Index = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [marketFilter, setMarketFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data: templates, isLoading } = usePublishedTemplates({
    search: search || undefined,
    type: typeFilter || undefined,
    categoryId: categoryFilter && categoryFilter !== "all" ? categoryFilter : undefined,
    marketType: marketFilter && marketFilter !== "all" ? marketFilter : undefined,
  });

  const totalPages = templates ? Math.ceil(templates.length / TEMPLATES_PER_PAGE) : 1;
  const paginatedTemplates = templates?.slice((page - 1) * TEMPLATES_PER_PAGE, page * TEMPLATES_PER_PAGE);

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  // Show max 7 page buttons with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, -1, totalPages];
    if (page >= totalPages - 3) return [1, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, -1, page - 1, page, page + 1, -2, totalPages];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SponsorsSection variant="banner" />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        {/* Decorative orbs */}
        <div className="hero-orb w-[500px] h-[500px] bg-primary/15 -top-60 -left-40" />
        <div className="hero-orb w-[400px] h-[400px] bg-secondary/10 -bottom-40 -right-40" />
        <div className="hero-orb w-[300px] h-[300px] bg-accent/10 top-20 right-[20%]" />

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-sm font-medium text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Biblioteca colaborativa de CRM
            </motion.div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              Templates de CRM{" "}
              <span className="text-gradient-hero">prontos para usar</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Encontre modelos de <strong className="text-foreground/80">Email</strong>,{" "}
              <strong className="text-foreground/80">WhatsApp</strong>,{" "}
              <strong className="text-foreground/80">SMS</strong> e{" "}
              <strong className="text-foreground/80">Push</strong>.
              Copie e envie em segundos.
            </p>

            {/* Stats */}
            {templates && templates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="flex items-center justify-center gap-8 pt-2"
              >
                <div className="text-center">
                  <p className="font-display text-2xl md:text-3xl font-bold text-foreground">{templates.length}</p>
                  <p className="text-xs text-muted-foreground font-medium">Templates</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="font-display text-2xl md:text-3xl font-bold text-foreground">4</p>
                  <p className="text-xs text-muted-foreground font-medium">Canais</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="font-display text-2xl md:text-3xl font-bold text-foreground">100%</p>
                  <p className="text-xs text-muted-foreground font-medium">Gratuito</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="container pb-20 space-y-8">
        <SearchFilters
          search={search}
          onSearchChange={handleFilterChange(setSearch)}
          typeFilter={typeFilter}
          onTypeChange={handleFilterChange(setTypeFilter)}
          categoryFilter={categoryFilter}
          onCategoryChange={handleFilterChange(setCategoryFilter)}
          marketFilter={marketFilter}
          onMarketChange={handleFilterChange(setMarketFilter)}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-[340px] bg-card rounded-2xl border border-border/40 animate-pulse" />
            ))}
          </div>
        ) : paginatedTemplates && paginatedTemplates.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedTemplates.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <TemplateCard
                    id={t.id}
                    title={t.title}
                    content={t.content}
                    template_type={t.template_type}
                    copies_count={t.copies_count}
                    tags={t.tags}
                    brand={t.brand}
                    categories={t.categories as any}
                    published_at={t.published_at}
                  />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-6">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {getPageNumbers().map((n, i) =>
                  n < 0 ? (
                    <span key={`ellipsis-${i}`} className="h-9 w-9 flex items-center justify-center text-muted-foreground/50 text-sm">
                      ...
                    </span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`
                        h-9 min-w-[36px] px-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${page === n
                          ? "bg-gradient-hero text-white shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }
                      `}
                    >
                      {n}
                    </button>
                  )
                )}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 space-y-4"
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center">
              <Layers className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground">Nenhum template encontrado</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {search || typeFilter || categoryFilter
                ? "Tente ajustar seus filtros para encontrar o que procura."
                : "Seja o primeiro a contribuir com um modelo!"}
            </p>
          </motion.div>
        )}
      </section>

      {/* How to contribute */}
      <section className="container pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          id="como-contribuir"
          className="relative bg-card/80 glass-subtle rounded-3xl border border-border/50 shadow-elevated overflow-hidden"
        >
          {/* Decorative accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-hero" />

          <div className="p-6 md:p-10">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 border border-primary/15 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                <Send className="h-3 w-3" />
                Contribua
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-card-foreground">
                Compartilhe com a comunidade
              </h2>
              <p className="text-muted-foreground mt-2">
                Recebeu uma comunicação interessante? Envie para nossa biblioteca!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {/* Email card */}
              <div className="relative bg-background/60 rounded-2xl p-6 space-y-4 border border-border/40 hover:border-primary/20 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">Email</h3>
                    <p className="text-xs text-muted-foreground">Encaminhe o email original</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono font-semibold text-primary bg-primary/8 px-4 py-2.5 rounded-xl border border-primary/10">
                    modelscrm@gmail.com
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl h-[42px] px-4 border-primary/20 hover:bg-primary/5"
                    onClick={() => {
                      navigator.clipboard.writeText("modelscrm@gmail.com");
                      import("sonner").then(({ toast }) => toast.success("Email copiado!"));
                    }}
                  >
                    Copiar
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground/70 leading-relaxed">
                  Encaminhe direto da caixa de entrada para preservar o visual original.
                </p>
              </div>

              {/* WhatsApp / SMS / Push card */}
              <div className="relative bg-background/60 rounded-2xl p-6 space-y-4 border border-border/40 hover:border-secondary/20 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">WhatsApp, SMS & Push</h3>
                    <p className="text-xs text-muted-foreground">Envie um print da mensagem</p>
                  </div>
                </div>

                <div className="flex justify-center py-2">
                  <img
                    src="/qrcode-whatsapp.svg"
                    alt="QR Code WhatsApp"
                    className="w-32 h-32 rounded-2xl border border-border/40 bg-white p-2.5 shadow-sm"
                  />
                </div>

                <a
                  href="https://wa.me/5511985623273?text=enviar_modelo"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" className="w-full rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Abrir WhatsApp <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="flex items-start gap-3 bg-muted/30 rounded-xl p-4 border border-border/30">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground/80">Dicas para uma boa contribuicao:</p>
                  <ul className="space-y-0.5 text-xs leading-relaxed">
                    <li>Para emails, encaminhe diretamente da caixa de entrada</li>
                    <li>Para WhatsApp, SMS e Push, tire um print claro da mensagem</li>
                    <li>Todos os modelos sao revisados antes de serem publicados</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Sponsors footer */}
      <SponsorsSection variant="footer" />
    </div>
  );
};

export default Index;
