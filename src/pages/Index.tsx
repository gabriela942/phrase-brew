import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { SearchFilters } from "@/components/SearchFilters";
import { TemplateCard } from "@/components/TemplateCard";
import { usePublishedTemplates } from "@/lib/hooks";
import { Layers, Mail, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SponsorsSection } from "@/components/SponsorsSection";

const TEMPLATES_PER_PAGE = 6;

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

  // Reset page when filters change
  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
              Templates de comunicação{" "}
              <span className="text-gradient-hero">prontos para usar</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Biblioteca colaborativa de modelos de Email, WhatsApp, SMS e Push.
              Encontre, copie e envie em segundos.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="container pb-16 space-y-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : paginatedTemplates && paginatedTemplates.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedTemplates.map((t) => (
                <TemplateCard
                  key={t.id}
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
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(i + 1)}
                    className="min-w-[36px]"
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 space-y-4">
            <Layers className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="font-display text-xl font-semibold text-foreground">Nenhum template encontrado</h3>
            <p className="text-muted-foreground">
              {search || typeFilter || categoryFilter 
                ? "Tente ajustar seus filtros."
                : "Seja o primeiro a contribuir com um modelo!"}
            </p>
          </div>
        )}
      </section>

      {/* Sponsors */}
      <SponsorsSection />

      {/* How to contribute - at the bottom */}
      <section className="container pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          id="como-contribuir"
          className="bg-card rounded-2xl border shadow-card p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-shrink-0 bg-gradient-hero rounded-xl p-4 self-start">
              <Mail className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="font-display text-xl md:text-2xl font-bold text-card-foreground">
                Como contribuir com a comunidade
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Recebeu um email, WhatsApp, SMS ou Push interessante? Compartilhe com a comunidade!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                {/* Email - forward only */}
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2">
                  <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                    📧 Email
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Encaminhe o email original</strong> para:
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-sm font-mono font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
                      modelscrm@gmail.com
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText("modelscrm@gmail.com");
                        import("sonner").then(({ toast }) => toast.success("Email copiado!"));
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Encaminhe diretamente da caixa de entrada — preservamos o visual original.
                  </p>
                </div>

                {/* SMS, WhatsApp, Push - via WhatsApp */}
                <div className="bg-secondary/5 border border-secondary/10 rounded-xl p-4 space-y-3">
                  <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                    💬 WhatsApp · 📱 SMS · 🔔 Push
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Envie o print</strong> diretamente pelo WhatsApp:
                  </p>
                  <div className="flex justify-center py-1">
                    <img
                      src="/qrcode-whatsapp.svg"
                      alt="QR Code para enviar modelo via WhatsApp"
                      className="w-36 h-36 rounded-xl border bg-white p-2"
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Escaneie o QR Code ou clique abaixo</p>
                  <a
                    href="https://wa.me/5511985623273?text=enviar_modelo"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="default" className="w-full mt-1">
                      Abrir WhatsApp <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </a>
                  <p className="text-xs text-muted-foreground">
                    Tire um screenshot da mensagem e envie pelo WhatsApp.
                  </p>
                </div>
              </div>

              <div className="pt-3 space-y-1.5">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">📌 Dicas:</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Para emails, encaminhe diretamente — quanto mais completo, melhor!</li>
                  <li>Para WhatsApp, SMS e Push, tire um print claro da mensagem</li>
                  <li>Nossa moderação vai categorizar por tipo, mercado, categoria e marca</li>
                  <li>O modelo será revisado antes de ser publicado na biblioteca</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
