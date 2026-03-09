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
      <section className="w-full bg-muted/50 border-b border-border py-3">
        <div className="container flex items-center justify-center gap-2 flex-wrap">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground mr-4">
            Patrocinadores Oficiais
          </span>
          <div className="flex items-center gap-8">
            {sponsors.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 group transition-opacity hover:opacity-80"
              >
                <img
                  src={s.logo}
                  alt={s.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
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
      <div className="bg-muted/40 border border-border rounded-2xl p-8 text-center space-y-5">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Patrocinadores Oficiais
        </p>
        <div className="flex items-center justify-center gap-12 flex-wrap">
          {sponsors.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group transition-transform hover:scale-105"
            >
              <img
                src={s.logo}
                alt={s.name}
                className="h-28 w-28 rounded-xl object-cover shadow-md border border-border group-hover:shadow-lg transition-shadow mx-auto"
              />
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
