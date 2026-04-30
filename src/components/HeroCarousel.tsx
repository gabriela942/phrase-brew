import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Users2,
  Layers,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Slide {
  id: string;
  badge: string;
  title: string;
  headline: string;
  description: string;
  cta: string;
  href: string;
  gradient: string;
  glowGradient: string;
  icon: React.ElementType;
}

const SLIDES: Slide[] = [
  {
    id: "cursos",
    badge: "Formação",
    title: "CRM Academy",
    headline: "Torne-se especialista em CRM",
    description:
      "Formações práticas para profissionais e equipes que querem dominar o CRM e gerar resultados reais.",
    cta: "Ver cursos",
    href: "https://linktr.ee/crmacademycommunity",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)",
    glowGradient:
      "radial-gradient(circle at 75% 50%, rgba(196,181,253,0.22) 0%, transparent 55%)",
    icon: GraduationCap,
  },
  {
    id: "consultoria",
    badge: "Consultoria",
    title: "Estratégia de CRM",
    headline: "Transforme dados em relacionamentos",
    description:
      "Diagnóstico, estratégia e implementação de CRM orientada a dados e resultados sustentáveis.",
    cta: "Falar com especialista",
    href: "https://lp.dtmcrm.com.br/crm-uni",
    gradient: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
    glowGradient:
      "radial-gradient(circle at 75% 50%, rgba(110,231,183,0.22) 0%, transparent 55%)",
    icon: Users2,
  },
  {
    id: "servicos",
    badge: "Serviços",
    title: "Implementação & Suporte",
    headline: "CRM do zero para o seu negócio",
    description:
      "Configuração, integração e suporte contínuo de plataformas CRM com foco total em resultado.",
    cta: "Conhecer serviços",
    href: "#",
    gradient: "linear-gradient(135deg, #d97706 0%, #ea580c 100%)",
    glowGradient:
      "radial-gradient(circle at 75% 50%, rgba(251,191,36,0.22) 0%, transparent 55%)",
    icon: Layers,
  },
  {
    id: "comunidade",
    badge: "Comunidade",
    title: "Mentoria & Network",
    headline: "Aprenda com quem faz CRM de verdade",
    description:
      "Troque experiências, aprenda com especialistas e acelere sua carreira em CRM.",
    cta: "Entrar na comunidade",
    href: "#",
    gradient: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
    glowGradient:
      "radial-gradient(circle at 75% 50%, rgba(125,211,252,0.22) 0%, transparent 55%)",
    icon: MessageSquare,
  },
];

const AUTOPLAY_MS = 6000;

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d < 0 ? 48 : -48, opacity: 0 }),
};

export function HeroCarousel() {
  const [[idx, dir], setSlide] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);
  const progressControls = useAnimation();

  const go = useCallback((newDir: number) => {
    setSlide(([prev]) => [
      (prev + newDir + SLIDES.length) % SLIDES.length,
      newDir,
    ]);
  }, []);

  const goTo = useCallback((i: number) => {
    setSlide(([prev]) => [i, i > prev ? 1 : -1]);
  }, []);

  // Autoplay
  useEffect(() => {
    if (isHovered) return;
    const t = setInterval(() => go(1), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [isHovered, go]);

  // Progress bar — resets and restarts on slide change or hover toggle
  useEffect(() => {
    progressControls.stop();
    progressControls.set({ scaleX: 0 });
    if (!isHovered) {
      progressControls.start({
        scaleX: 1,
        transition: { duration: AUTOPLAY_MS / 1000, ease: "linear" },
      });
    }
  }, [idx, isHovered, progressControls]);

  const slide = SLIDES[idx];
  const Icon = slide.icon;
  const isExternal = !slide.href.startsWith("#");

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{ background: slide.gradient }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{ background: slide.glowGradient }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      {/* Slide content */}
      <div className="relative">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={idx}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
            className="container grid grid-cols-1 md:grid-cols-[1fr_220px] gap-8 py-10 md:py-12 items-center"
            style={{ minHeight: "clamp(240px, 30vw, 320px)" }}
          >
            {/* Left — text */}
            <div className="space-y-4 text-white">
              <span className="inline-flex px-3 py-[5px] text-[10px] font-bold uppercase tracking-[0.12em] rounded-full bg-white/20 border border-white/25 backdrop-blur-sm">
                {slide.badge}
              </span>

              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  {slide.title}
                </p>
                <h2 className="font-display font-bold leading-tight text-white"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
                >
                  {slide.headline}
                </h2>
              </div>

              <p className="text-sm md:text-[15px] text-white/72 leading-relaxed max-w-[28rem]">
                {slide.description}
              </p>

              <div className="pt-1">
                <a
                  href={slide.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-foreground rounded-xl font-semibold text-sm hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-px active:translate-y-0"
                >
                  {slide.cta}
                  <ArrowRight style={{ width: "13px", height: "13px" }} />
                </a>
              </div>
            </div>

            {/* Right — decorative icon visual */}
            <div className="hidden md:flex items-center justify-center relative" style={{ height: "200px", width: "220px" }}>
              {/* Concentric rings */}
              <div className="absolute inset-0 rounded-full bg-white/[0.04] border border-white/10" />
              <div className="absolute inset-8 rounded-full bg-white/[0.04] border border-white/10" />
              {/* Icon card */}
              <div className="relative z-10 w-[88px] h-[88px] rounded-[22px] bg-white/[0.14] backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
                <Icon className="text-white/90" style={{ width: "40px", height: "40px" }} />
              </div>
              {/* Floating accent dots */}
              <div className="absolute top-7 right-7 w-2.5 h-2.5 rounded-full bg-white/35" />
              <div className="absolute bottom-10 left-7 w-2 h-2 rounded-full bg-white/25" />
              <div className="absolute top-[56px] left-3 w-1.5 h-1.5 rounded-full bg-white/20" />
              <div className="absolute bottom-6 right-14 w-1.5 h-1.5 rounded-full bg-white/15" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls row */}
      <div className="relative flex items-center justify-between px-6 md:px-8 pb-4">
        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={cn(
                "rounded-full bg-white transition-all duration-300",
                i === idx
                  ? "w-5 h-[5px] opacity-100"
                  : "w-[5px] h-[5px] opacity-35 hover:opacity-55"
              )}
            />
          ))}
        </div>

        {/* Arrow buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => go(-1)}
            aria-label="Slide anterior"
            className="w-8 h-8 rounded-full bg-white/[0.14] hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft style={{ width: "14px", height: "14px" }} />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Próximo slide"
            className="w-8 h-8 rounded-full bg-white/[0.14] hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight style={{ width: "14px", height: "14px" }} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] bg-white/20 overflow-hidden">
        <motion.div
          animate={progressControls}
          className="h-full bg-white/55 origin-left"
        />
      </div>
    </div>
  );
}
