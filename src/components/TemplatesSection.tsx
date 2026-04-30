import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResultsToolbar } from "@/components/ResultsToolbar";
import { useHeaderHeight } from "@/lib/useHeaderHeight";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TemplatesSectionProps {
  channels: string[];
  onChannelsChange: (v: string[]) => void;
  resultCount?: number;
  isLoading?: boolean;
  children: React.ReactNode;
  /** Ref to the section that follows TemplatesSection. When its top reaches
   *  the sticky header, the sticky toolbar is unmounted. */
  contributeSectionRef?: React.RefObject<HTMLElement | null>;
}

// ─── Component ────────────────────────────────────────────────────────────────
// Sticky ResultsToolbar mounts the moment the templates section's top crosses
// the sticky header line — NOT later when the in-flow toolbar fully scrolls
// behind the header. At the trigger moment, the in-flow toolbar is right
// beneath the header and the fixed clone overlays it at the same Y, so the
// transition reads as one continuous bar (no duplication, no gap).
//
// States:
//   hasPassedTemplatesStart    → templates-section start has crossed headerHeight
//   hasReachedContributeSection → contribute-section top has crossed headerHeight
//
// showSticky = hasPassedTemplatesStart && !hasReachedContributeSection

export function TemplatesSection({
  channels,
  onChannelsChange,
  resultCount,
  isLoading,
  children,
  contributeSectionRef,
}: TemplatesSectionProps) {
  const headerHeight = useHeaderHeight();

  const templatesSectionStartRef = useRef<HTMLDivElement>(null);
  const resultsToolbarRef = useRef<HTMLDivElement>(null);

  const [hasPassedTemplatesStart, setHasPassedTemplatesStart] = useState(false);
  const [hasReachedContributeSection, setHasReachedContributeSection] = useState(false);

  const showSticky = hasPassedTemplatesStart && !hasReachedContributeSection;

  useEffect(() => {
    const check = () => {
      const startEl = templatesSectionStartRef.current;
      if (!startEl) return;

      const startTop = startEl.getBoundingClientRect().top;
      const contributeEl = contributeSectionRef?.current;
      const contributeTop = contributeEl
        ? contributeEl.getBoundingClientRect().top
        : Number.POSITIVE_INFINITY;

      // Trigger #1: section start has reached / passed the sticky header line
      setHasPassedTemplatesStart(startTop <= headerHeight);

      // Trigger #2: contribute section top has reached the sticky header line
      setHasReachedContributeSection(contributeTop <= headerHeight);
    };

    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    check();

    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [headerHeight, contributeSectionRef]);

  const toolbarProps = { channels, onChannelsChange, resultCount, isLoading };

  return (
    <section>
      {/* ── Start sentinel: 1px mark at the top of the templates area ─────── */}
      <div ref={templatesSectionStartRef} style={{ height: "1px" }} aria-hidden="true" />

      {/* ── In-flow toolbar (visible until it scrolls behind the header) ──── */}
      <div ref={resultsToolbarRef}>
        <ResultsToolbar {...toolbarProps} />
      </div>

      {/* ── Template grid content ────────────────────────────────────────────── */}
      <div className="container pt-5 pb-24">
        {children}
      </div>

      {/* ── Fixed sticky clone — only mounted while inside the section ────── */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            key="sticky-toolbar"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
            style={{ top: headerHeight }}
            className="fixed left-0 right-0 z-40"
          >
            <ResultsToolbar {...toolbarProps} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
