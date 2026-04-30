import { forwardRef } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Copy,
  ArrowRight,
  Send,
  Users,
  BookOpen,
  Lightbulb,
  Megaphone,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// ─── Static content ───────────────────────────────────────────────────────────

const CONTACT_EMAIL = "modelscrm@gmail.com";
const WHATSAPP_URL = "https://wa.me/5511985623273?text=enviar_modelo";

const STEPS = [
  {
    n: 1,
    title: "Você envia",
    description: "Compartilhe um email real, print ou template da sua operação.",
  },
  {
    n: 2,
    title: "Nós revisamos",
    description: "Organizamos, classificamos e validamos o material.",
  },
  {
    n: 3,
    title: "Publicamos",
    description: "Os melhores modelos entram na biblioteca para inspirar a comunidade.",
  },
];

const REASONS = [
  { icon: Users, text: "Ajude outros profissionais de CRM" },
  { icon: BookOpen, text: "Fortaleça a biblioteca da comunidade" },
  { icon: Megaphone, text: "Compartilhe campanhas reais que funcionam" },
  { icon: Lightbulb, text: "Inspire novas referências para Email, WhatsApp, SMS e Push" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MethodCard({
  accent,
  icon: Icon,
  title,
  description,
  children,
  delay = 0,
}: {
  accent: "primary" | "secondary";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const accentClasses =
    accent === "primary"
      ? "from-primary/80 via-primary/60 to-transparent"
      : "from-secondary/80 via-secondary/60 to-transparent";
  const iconBg = accent === "primary" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4 }}
      className="relative rounded-3xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-shadow overflow-hidden p-6 md:p-7"
    >
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${accentClasses}`} />

      <div className="flex items-start gap-3 mb-5">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-[17px] font-bold text-foreground leading-tight">{title}</h3>
          <p className="text-[13px] text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>

      {children}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const ContributeSection = forwardRef<HTMLElement>(function ContributeSection(_, ref) {
  const copyEmail = async () => {
    // Try the modern API first; fall back to a hidden textarea + execCommand
    // for browsers/contexts where the Clipboard API is blocked.
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(CONTACT_EMAIL);
        toast.success("Email copiado!");
        return;
      }
    } catch {
      // ignore — fall through to fallback
    }

    try {
      const ta = document.createElement("textarea");
      ta.value = CONTACT_EMAIL;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "0";
      ta.style.left = "0";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      if (ok) {
        toast.success("Email copiado!");
      } else {
        toast.error(`Não foi possível copiar — copie manualmente: ${CONTACT_EMAIL}`);
      }
    } catch {
      toast.error(`Não foi possível copiar — copie manualmente: ${CONTACT_EMAIL}`);
    }
  };

  return (
    <section
      ref={ref}
      id="como-contribuir"
      className="relative overflow-hidden py-20 md:py-24"
    >
      {/* Subtle top glow for premium feel */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[280px] bg-gradient-to-b from-primary/[0.035] via-primary/[0.015] to-transparent pointer-events-none"
      />

      <div className="container relative">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="text-center max-w-[640px] mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/15 text-[11px] font-bold uppercase tracking-[0.12em] text-primary mb-5">
            <Send style={{ width: "10px", height: "10px" }} />
            Contribua
          </span>
          <h2
            className="font-display font-bold text-foreground tracking-tight leading-[1.15] mb-3"
            style={{ fontSize: "clamp(1.625rem, 3.6vw, 2.375rem)" }}
          >
            Ajude a biblioteca a{" "}
            <span className="text-gradient-hero">crescer</span>
          </h2>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            Envie modelos reais de Email, WhatsApp, SMS ou Push. Nós revisamos e publicamos os melhores na biblioteca.
          </p>
        </motion.div>

        {/* ── Method cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-20">

          <MethodCard
            accent="primary"
            icon={Mail}
            title="Email"
            description="Encaminhe o email original"
            delay={0}
          >
            <div className="flex items-center gap-2 mb-4">
              <code className="flex-1 text-[13px] font-mono font-semibold text-primary bg-primary/[0.07] px-4 py-3 rounded-xl border border-primary/10 truncate">
                {CONTACT_EMAIL}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={copyEmail}
                className="rounded-xl h-[46px] px-4 border-primary/20 hover:bg-primary/5 shrink-0 gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                Copiar
              </Button>
            </div>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
              Encaminhe direto da caixa de entrada para preservar assunto, layout e estrutura.
            </p>
          </MethodCard>

          <MethodCard
            accent="secondary"
            icon={MessageSquare}
            title="WhatsApp, SMS e Push"
            description="Envie um print ou mensagem"
            delay={0.12}
          >
            <div className="flex justify-center mb-4">
              <img
                src="/qrcode-whatsapp.svg"
                alt="QR Code WhatsApp"
                className="w-28 h-28 rounded-2xl border border-border/40 bg-white p-2.5 shadow-sm"
              />
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-3"
            >
              <Button className="w-full rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-1.5 transition-transform active:scale-[0.98]">
                Abrir WhatsApp
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </a>
            <p className="text-[12px] text-muted-foreground/80 leading-relaxed text-center">
              Envie um print nítido ou mensagem exportada para facilitar a revisão.
            </p>
          </MethodCard>
        </div>

        {/* ── Como funciona ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto mb-20"
        >
          <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/50 text-center mb-6">
            Como funciona
          </h3>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-5">
            {/* Connector line on desktop */}
            <div
              aria-hidden="true"
              className="hidden md:block absolute top-5 left-[16%] right-[16%] h-[1px] bg-gradient-to-r from-transparent via-border/70 to-transparent"
            />

            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="relative text-center"
              >
                <div className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-hero text-white font-display font-bold text-[14px] mb-3 shadow-md ring-[6px] ring-background">
                  {step.n}
                </div>
                <h4 className="font-display font-semibold text-foreground text-[14px] mb-1.5">
                  {step.title}
                </h4>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed max-w-[240px] mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Por que contribuir? ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/50 text-center mb-6">
            Por que contribuir?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REASONS.map((r, i) => {
              const Icon = r.icon;
              return (
                <motion.div
                  key={r.text}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-card/60 border border-border/40 hover:border-primary/25 hover:bg-card transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-[13.5px] text-foreground/85 leading-relaxed pt-1.5">
                    {r.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </section>
  );
});
