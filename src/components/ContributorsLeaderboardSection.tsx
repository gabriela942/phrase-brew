import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Award, Users } from "lucide-react";
import { useTopContributors, type ContributorEntry } from "@/lib/hooks";
import { cn } from "@/lib/utils";

// ─── Rotating headline word ──────────────────────────────────────────────────

const ROTATING_WORDS = ["fortalece", "impulsiona", "movimenta", "enriquece", "valoriza"] as const;
const ROTATE_INTERVAL_MS = 2800;

function RotatingHeadlineWord() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % ROTATING_WORDS.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <span
      className="relative inline-flex align-baseline justify-center"
      // min-width tied to the longest word ("impulsiona") to prevent layout shift
      style={{ minWidth: "8.5ch" }}
    >
      {/* Invisible spacer using the longest word to reserve vertical box height */}
      <span aria-hidden="true" className="invisible whitespace-nowrap">
        impulsiona
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={ROTATING_WORDS[idx]}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 text-gradient-hero whitespace-nowrap text-center"
        >
          {ROTATING_WORDS[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

// ─── Top-3 podium card ────────────────────────────────────────────────────────

const PODIUM_STYLE: Record<
  number,
  {
    rank: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
    glow: string;
    badge: string;
    ring: string;
    label: string;
  }
> = {
  0: {
    rank: "1º",
    icon: Trophy,
    accent: "from-amber-400/30 via-amber-300/15 to-transparent",
    glow: "bg-amber-300/10",
    badge: "bg-amber-400/20 text-amber-700 border-amber-400/30",
    ring: "ring-amber-400/50",
    label: "Ouro",
  },
  1: {
    rank: "2º",
    icon: Medal,
    accent: "from-slate-300/30 via-slate-200/15 to-transparent",
    glow: "bg-slate-200/15",
    badge: "bg-slate-300/25 text-slate-700 border-slate-300/40",
    ring: "ring-slate-300/50",
    label: "Prata",
  },
  2: {
    rank: "3º",
    icon: Award,
    accent: "from-orange-400/30 via-orange-300/15 to-transparent",
    glow: "bg-orange-300/10",
    badge: "bg-orange-400/20 text-orange-700 border-orange-400/30",
    ring: "ring-orange-400/50",
    label: "Bronze",
  },
};

function TopContributorCard({
  entry,
  position,
  delay,
}: {
  entry: ContributorEntry;
  position: 0 | 1 | 2;
  delay: number;
}) {
  const style = PODIUM_STYLE[position];
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-3xl border border-border/50 bg-card shadow-card hover:shadow-card-hover transition-shadow p-6"
    >
      {/* gradient accent stripe */}
      <div className={cn("absolute top-0 inset-x-0 h-1 bg-gradient-to-r", style.accent)} />
      {/* ambient glow */}
      <div className={cn("absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none", style.glow)} />

      <div className="relative flex items-center justify-between mb-5">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] border",
            style.badge
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {style.label}
        </span>
        <span className="font-display text-2xl font-bold text-muted-foreground/40 leading-none">
          {style.rank}
        </span>
      </div>

      <div className="relative flex items-center gap-4">
        <div
          className={cn(
            "shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15 flex items-center justify-center font-display font-bold text-primary text-[15px] ring-2",
            style.ring
          )}
        >
          {initials(entry.name)}
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className="font-display font-bold text-foreground leading-tight truncate"
            style={{ fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)" }}
            title={entry.name}
          >
            {entry.name}
          </h3>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-display font-bold text-2xl text-foreground tabular-nums">
              {entry.published}
            </span>
            <span className="text-[12px] text-muted-foreground">publicados</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function ContributorsLeaderboardSection() {
  const { data, isLoading } = useTopContributors(3);

  const top3 = (data ?? []).slice(0, 3);
  const hasData = top3.length > 0;

  return (
    <section
      id="ranking-contribuidores"
      className="relative overflow-hidden py-16 md:py-20"
    >
      {/* subtle background accent */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[260px] bg-gradient-to-b from-primary/[0.025] via-primary/[0.01] to-transparent pointer-events-none"
      />

      <div className="container relative">
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="text-center max-w-[640px] mx-auto mb-10 md:mb-12"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/15 text-[11px] font-bold uppercase tracking-[0.12em] text-primary mb-5">
            <Trophy style={{ width: "11px", height: "11px" }} />
            Reconhecimento por contribuição
          </span>
          <h2
            className="font-display font-bold text-foreground tracking-tight leading-[1.15] mb-3"
            style={{ fontSize: "clamp(1.625rem, 3.6vw, 2.375rem)" }}
          >
            Quem mais <RotatingHeadlineWord /> a biblioteca
          </h2>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            Valorizamos quem gera impacto real na comunidade. Os contribuintes mais ativos e relevantes do mês recebem destaque e recompensa pelo seu esforço.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 rounded-3xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : !hasData ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-[14px]">Os primeiros contribuidores aparecerão aqui em breve.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {top3.map((entry, i) => (
              <TopContributorCard
                key={entry.name}
                entry={entry}
                position={i as 0 | 1 | 2}
                delay={i * 0.08}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
