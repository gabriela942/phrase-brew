import { cn } from "@/lib/utils";
import { Calendar, Flame, Target } from "lucide-react";

// ─── Static data ──────────────────────────────────────────────────────────────

export const EM_ALTA = [
  { label: "Mais copiados", slug: "mais-copiados", emoji: "🔥" },
  { label: "Mais vistos", slug: "mais-vistos", emoji: "👀" },
  { label: "Novos esta semana", slug: "novos", emoji: "⚡" },
  { label: "Tendência de alta", slug: "tendencia-de-alta", emoji: "📈" },
  { label: "Mais curtidos", slug: "mais-curtidos", emoji: "❤️" },
] as const;

export const DATAS_ESPECIAIS = [
  { label: "Carnaval", slug: "carnaval", emoji: "🎭" },
  { label: "Páscoa", slug: "pascoa", emoji: "🐣" },
  { label: "Dia das Mães", slug: "dia-das-maes", emoji: "🌷" },
  { label: "Dia dos Namorados", slug: "dia-dos-namorados", emoji: "💖" },
  { label: "Dia dos Pais", slug: "dia-dos-pais", emoji: "🎁" },
  { label: "Dia do Cliente", slug: "dia-do-cliente", emoji: "🤝" },
  { label: "Black Friday", slug: "black-friday", emoji: "🖤" },
  { label: "Cyber Monday", slug: "cyber-monday", emoji: "💻" },
  { label: "Natal", slug: "natal", emoji: "🎄" },
  { label: "Ano Novo", slug: "ano-novo", emoji: "🎆" },
] as const;

export const OBJETIVO_CAMPANHA = [
  { label: "Para conversão", slug: "melhor-conversao", emoji: "🎯" },
  { label: "Para retenção", slug: "melhor-retencao", emoji: "💎" },
  { label: "Para recuperação", slug: "melhor-recuperacao", emoji: "🔄" },
  { label: "Para relacionamento", slug: "melhor-relacionamento", emoji: "🤝" },
  { label: "Para conteúdo CRM", slug: "melhor-conteudo", emoji: "📚" },
] as const;

export const EXPLORE_LABELS: Record<string, string> = {
  ...Object.fromEntries(EM_ALTA.map((d) => [d.slug, d.label])),
  ...Object.fromEntries(DATAS_ESPECIAIS.map((d) => [d.slug, d.label])),
  ...Object.fromEntries(OBJETIVO_CAMPANHA.map((d) => [d.slug, d.label])),
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ExplorePanelProps {
  activeExplore: string;
  onExploreSelect: (key: string) => void;
  onClose: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BlockHeader({
  icon: Icon,
  iconClass,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn("h-4 w-4 shrink-0", iconClass)} />
        <h3 className="text-[13px] font-bold text-foreground">{title}</h3>
      </div>
      <p className="text-[12px] text-muted-foreground leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
// Row 1: Em alta agora (hero — gradient-accented card, 5-across item grid)
// Row 2: Datas especiais (2-col grid)  +  Objetivo da campanha (vertical list)

export function ExplorePanel({ activeExplore, onExploreSelect, onClose }: ExplorePanelProps) {
  const handle = (slug: string) => {
    onExploreSelect(activeExplore === slug ? "" : slug);
    onClose();
  };

  return (
    <div className="py-6 pb-8 space-y-5">

      {/* ── Clear-filter affordance ── */}
      {activeExplore && (
        <div className="flex justify-end -mb-2">
          <button
            onClick={() => { onExploreSelect(""); onClose(); }}
            className="text-[11px] text-muted-foreground hover:text-destructive transition-colors font-medium"
          >
            Limpar filtro
          </button>
        </div>
      )}

      {/* ══ Row 1: Em alta agora (primary / hero) ═════════════════════════════ */}
      <div className="rounded-2xl border border-orange-500/15 bg-gradient-to-br from-orange-500/[0.06] via-background to-background p-5">
        <BlockHeader
          icon={Flame}
          iconClass="text-orange-500"
          title="Em alta agora"
          subtitle="Descubra os templates mais populares da comunidade"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {EM_ALTA.map((item) => {
            const isActive = activeExplore === item.slug;
            return (
              <button
                key={item.slug}
                onClick={() => handle(item.slug)}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left text-[13px] font-medium transition-all duration-150 border",
                  isActive
                    ? "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300 shadow-sm"
                    : "bg-card/70 border-border/40 text-foreground/75 hover:bg-card hover:text-foreground hover:border-orange-500/25"
                )}
              >
                <span className="text-base leading-none shrink-0">{item.emoji}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ Row 2: Datas + Objetivo ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5">

        {/* ── Datas especiais (secondary) ── */}
        <div className="rounded-2xl border border-border/40 bg-muted/25 p-5">
          <BlockHeader
            icon={Calendar}
            iconClass="text-primary"
            title="Datas especiais"
            subtitle="Campanhas sazonais e datas importantes do Brasil"
          />

          <div className="grid grid-cols-2 gap-1">
            {DATAS_ESPECIAIS.map((item) => {
              const isActive = activeExplore === item.slug;
              return (
                <button
                  key={item.slug}
                  onClick={() => handle(item.slug)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-[13px] font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                      : "text-foreground/70 hover:bg-card hover:text-foreground"
                  )}
                >
                  <span className="text-[15px] leading-none shrink-0">{item.emoji}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Objetivo da campanha (tertiary) ── */}
        <div className="rounded-2xl border border-border/40 bg-muted/25 p-5">
          <BlockHeader
            icon={Target}
            iconClass="text-amber-500"
            title="Objetivo da campanha"
            subtitle="Explore templates por intenção"
          />

          <div className="space-y-1">
            {OBJETIVO_CAMPANHA.map((item) => {
              const isActive = activeExplore === item.slug;
              return (
                <button
                  key={item.slug}
                  onClick={() => handle(item.slug)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-[13px] font-medium transition-all duration-150",
                    isActive
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-500/20"
                      : "text-foreground/70 hover:bg-card hover:text-foreground"
                  )}
                >
                  <span className="text-[15px] leading-none shrink-0">{item.emoji}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
