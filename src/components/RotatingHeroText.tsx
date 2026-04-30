import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

// ─── Rotating micro-headline ──────────────────────────────────────────────────
// Sits above the hero title. Cycles through short value-prop phrases with a
// subtle fade + vertical slide. Honors `prefers-reduced-motion`: if set, the
// phrase rotation stops (first phrase stays) and transitions become instant.

const PHRASES = [
  "Biblioteca colaborativa de CRM",
  "Templates reais enviados pela comunidade",
  "Modelos prontos para Email, WhatsApp, SMS e Push",
  "Copie, adapte e publique mais rápido",
  "Novos templates entrando toda semana",
];

const INTERVAL_MS = 4500;

export function RotatingHeroText() {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PHRASES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const duration = reduceMotion ? 0 : 0.35;
  const offset = reduceMotion ? 0 : 4;

  return (
    <div className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-primary/85">
      <Sparkles
        aria-hidden="true"
        style={{ width: "10px", height: "10px" }}
        className="shrink-0 text-primary/70"
      />

      {/* Wrapper keeps vertical space stable during swap */}
      <span className="relative inline-block leading-none">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: offset }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -offset }}
            transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
            className="inline-block whitespace-nowrap"
            aria-live="polite"
          >
            {PHRASES[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}
