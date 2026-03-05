import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { SearchFilters } from "@/components/SearchFilters";
import { TemplateCard } from "@/components/TemplateCard";
import { usePublishedTemplates } from "@/lib/hooks";
import { Layers } from "lucide-react";

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
              Biblioteca colaborativa de modelos de Email, WhatsApp e SMS.
              Encontre, copie e envie em segundos.
            </p>
          </motion.div>
        </div>
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
