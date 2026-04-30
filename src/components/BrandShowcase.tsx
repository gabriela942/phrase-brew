import { GraduationCap, Users2, Layers, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SHOWCASE_ITEMS = [
  {
    id: "cursos",
    badge: "Formação",
    badgeClass: "bg-violet-100 text-violet-700 border border-violet-200",
    title: "CRM Academy",
    description: "Formações práticas em CRM para profissionais e equipes que querem resultados reais.",
    cta: "Ver cursos",
    href: "https://linktr.ee/crmacademycommunity",
    gradientClass: "from-violet-500/8 via-purple-500/5 to-fuchsia-500/3",
    iconBgClass: "bg-violet-100",
    iconColorClass: "text-violet-600",
    accentClass: "bg-gradient-to-r from-violet-500 to-fuchsia-500",
    icon: GraduationCap,
  },
  {
    id: "consultorias",
    badge: "Consultoria",
    badgeClass: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    title: "Estratégia de CRM",
    description: "Diagnóstico, estratégia e implementação de CRM orientada a dados e resultados.",
    cta: "Falar com especialista",
    href: "https://lp.dtmcrm.com.br/crm-uni",
    gradientClass: "from-emerald-500/8 via-teal-500/5 to-cyan-500/3",
    iconBgClass: "bg-emerald-100",
    iconColorClass: "text-emerald-600",
    accentClass: "bg-gradient-to-r from-emerald-500 to-teal-500",
    icon: Users2,
  },
  {
    id: "servicos",
    badge: "Serviço",
    badgeClass: "bg-amber-100 text-amber-700 border border-amber-200",
    title: "Implementação & Suporte",
    description: "Configuração, integração e suporte contínuo de plataformas CRM para seu negócio.",
    cta: "Conhecer serviços",
    href: "#",
    gradientClass: "from-amber-500/8 via-orange-500/5 to-red-500/3",
    iconBgClass: "bg-amber-100",
    iconColorClass: "text-amber-600",
    accentClass: "bg-gradient-to-r from-amber-500 to-orange-500",
    icon: Layers,
  },
] as const;

export function BrandShowcase() {
  return (
    <section className="container py-6 md:py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {SHOWCASE_ITEMS.map((item, i) => {
          const Icon = item.icon;
          const isExternal = item.href !== "#";
          return (
            <motion.a
              key={item.id}
              href={item.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              className="group relative bg-card rounded-2xl border border-border/60 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
            >
              {/* Top accent bar */}
              <div className={cn("h-[3px] w-full flex-shrink-0", item.accentClass)} />

              <div className={cn("p-5 flex flex-col gap-3 flex-1 bg-gradient-to-br", item.gradientClass)}>
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", item.iconBgClass)}>
                    <Icon className={cn("h-4.5 w-4.5", item.iconColorClass)} style={{ width: "18px", height: "18px" }} />
                  </div>
                  <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full", item.badgeClass)}>
                    {item.badge}
                  </span>
                </div>

                {/* Title + description */}
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-foreground text-[15px] leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-1 text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors mt-auto pt-1">
                  {item.cta}
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    style={{ width: "14px", height: "14px" }}
                  />
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>
    </section>
  );
}
