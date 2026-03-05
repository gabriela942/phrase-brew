import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { SearchFilters } from "@/components/SearchFilters";
import { TemplateCard } from "@/components/TemplateCard";
import { usePublishedTemplates } from "@/lib/hooks";
import { Layers, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const { data: templates, isLoading } = usePublishedTemplates({
    search: search || undefined,
    type: typeFilter || undefined,
    categoryId: categoryFilter && categoryFilter !== "all" ? categoryFilter : undefined,
  });

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

      {/* How to contribute */}
      <section className="container pb-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
                Basta <strong className="text-foreground">encaminhar a mensagem</strong> para:
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <code className="text-lg font-mono font-bold text-primary bg-primary/10 px-4 py-2 rounded-lg">
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
                  Copiar email
                </Button>
              </div>
              <div className="pt-3 space-y-1.5">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">📌 Dicas:</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Encaminhe o email/mensagem original — quanto mais completo, melhor!</li>
                  <li>Se quiser, adicione no assunto: <code className="text-xs bg-muted px-1 rounded">[EMAIL]</code>, <code className="text-xs bg-muted px-1 rounded">[WHATSAPP]</code>, <code className="text-xs bg-muted px-1 rounded">[SMS]</code> ou <code className="text-xs bg-muted px-1 rounded">[PUSH]</code> para indicar o tipo</li>
                  <li>Nossa moderação vai categorizar por tipo de comunicação, mercado, categoria e marca</li>
                  <li>O modelo será revisado antes de ser publicado na biblioteca</li>
                </ul>
              </div>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Prefere usar um formulário?{" "}
                  <Link to="/submit" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                    Enviar modelo pelo formulário <ArrowRight className="h-3 w-3" />
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Filters + Grid */}
      <section className="container pb-16 space-y-8">
        <SearchFilters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
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
              />
            ))}
          </div>
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
    </div>
  );
};

export default Index;
