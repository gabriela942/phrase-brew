import logoCrmAcademy from "@/assets/logo-crm-academy.png";
import logoCrmUni from "@/assets/logo-crm-uni.png";

const sponsors = [
  {
    name: "CRM Academy",
    logo: logoCrmAcademy,
    url: "https://linktr.ee/crmacademycommunity",
  },
  {
    name: "CRM Uni",
    logo: logoCrmUni,
    url: "https://lp.dtmcrm.com.br/crm-uni",
  },
];

interface SponsorsSectionProps {
  variant?: "banner" | "footer";
}

export const SponsorsSection = ({ variant = "banner" }: SponsorsSectionProps) => {
  if (variant === "banner") {
    return (
      <section className="w-full bg-muted/30 border-b border-border/40 py-2.5">
        <div className="container flex items-center justify-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 mr-3">
            Apoiadores
          </span>
          <div className="flex items-center gap-6">
            {sponsors.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group transition-all hover:opacity-80"
              >
                <img
                  src={s.logo}
                  alt={s.name}
                  className="h-8 w-8 rounded-lg object-cover ring-1 ring-border/40"
                />
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {s.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container pb-12">
      <div className="relative bg-card/60 glass-subtle border border-border/50 rounded-2xl p-8 md:p-10 text-center space-y-6 overflow-hidden">
        <div className="hero-orb w-32 h-32 bg-primary/20 -top-10 -right-10" />
        <div className="hero-orb w-24 h-24 bg-secondary/20 -bottom-8 -left-8" />

        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 relative">
          Apoiadores Oficiais
        </p>
        <div className="flex items-center justify-center gap-10 md:gap-14 flex-wrap relative">
          {sponsors.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group transition-all duration-300 hover:scale-105"
            >
              <div className="relative">
                <img
                  src={s.logo}
                  alt={s.name}
                  className="h-24 w-24 md:h-28 md:w-28 rounded-2xl object-cover shadow-card border border-border/40 group-hover:shadow-card-hover transition-all duration-300 mx-auto"
                />
              </div>
              <span className="block mt-3 text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                {s.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
