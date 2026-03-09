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

export const SponsorsSection = () => (
  <section className="container pb-12">
    <div className="text-center space-y-6">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Patrocinadores Oficiais
      </p>
      <div className="flex items-center justify-center gap-10 flex-wrap">
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
              className="h-20 w-20 rounded-xl object-cover shadow-md border border-border group-hover:shadow-lg transition-shadow"
            />
            <span className="block mt-2 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {s.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  </section>
);
