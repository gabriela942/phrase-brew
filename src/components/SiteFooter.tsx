import { Link } from "react-router-dom";
import { Mail, MessageCircle, ExternalLink } from "lucide-react";
import logo from "@/assets/logo-crm-models.png";

const YEAR = new Date().getFullYear();

const NAV = [
  {
    heading: "Explorar",
    links: [
      { label: "Todos os modelos", href: "/", internal: true },
      { label: "Email", href: "/?type=email", internal: true },
      { label: "WhatsApp", href: "/?type=whatsapp", internal: true },
      { label: "SMS", href: "/?type=sms", internal: true },
      { label: "Push", href: "/?type=push", internal: true },
    ],
  },
  {
    heading: "Descoberta",
    links: [
      { label: "Por categoria", href: "/#templates", internal: true },
      { label: "Por mercado", href: "/#templates", internal: true },
      { label: "Por marca", href: "/#templates", internal: true },
      { label: "Mais copiados", href: "/", internal: true },
    ],
  },
  {
    heading: "Contribuir",
    links: [
      { label: "Enviar por email", href: "mailto:modelscrm@gmail.com", internal: false },
      { label: "Enviar pelo WhatsApp", href: "https://wa.me/5511985623273?text=enviar_modelo", internal: false },
      { label: "Como contribuir", href: "/#como-contribuir", internal: true },
    ],
  },
  {
    heading: "Empresa",
    links: [
      { label: "CRM Academy", href: "https://linktr.ee/crmacademycommunity", internal: false },
      { label: "Consultoria CRM", href: "https://lp.dtmcrm.com.br/crm-uni", internal: false },
      { label: "Serviços", href: "#", internal: false },
      { label: "Comunidade", href: "#", internal: false },
    ],
  },
  {
    heading: "Suporte",
    links: [
      { label: "Contato", href: "mailto:modelscrm@gmail.com", internal: false },
      { label: "Termos de uso", href: "#", internal: false },
      { label: "Privacidade", href: "#", internal: false },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container py-12 md:py-16">

        {/* Top section: brand + tagline */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-12">
          <div className="space-y-3 max-w-[280px]">
            <Link to="/" aria-label="CRM Models — home">
              <img
                src={logo}
                alt="CRM Models"
                className="h-[28px] w-auto opacity-80 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Mais CRM, menos retrabalho.
            </p>
            <p className="text-[12px] text-muted-foreground/60 leading-relaxed">
              Biblioteca colaborativa de modelos de comunicação para times de CRM.
            </p>

            {/* Quick contact links */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="mailto:modelscrm@gmail.com"
                aria-label="Email"
                className="w-8 h-8 rounded-lg bg-muted/60 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-all"
              >
                <Mail style={{ width: "13px", height: "13px" }} />
              </a>
              <a
                href="https://wa.me/5511985623273"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-lg bg-muted/60 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-all"
              >
                <MessageCircle style={{ width: "13px", height: "13px" }} />
              </a>
            </div>
          </div>

          {/* Navigation columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {NAV.map((col) => (
              <div key={col.heading} className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-foreground/60">
                  {col.heading}
                </p>
                <ul className="space-y-2">
                  {col.links.map((link) =>
                    link.internal ? (
                      <li key={link.label}>
                        <Link
                          to={link.href}
                          className="text-[12.5px] text-muted-foreground hover:text-foreground transition-colors leading-snug"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ) : (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          target={link.href.startsWith("mailto") ? undefined : "_blank"}
                          rel={link.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                          className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors leading-snug group"
                        >
                          {link.label}
                          {!link.href.startsWith("mailto") && link.href !== "#" && (
                            <ExternalLink
                              style={{ width: "9px", height: "9px" }}
                              className="opacity-0 group-hover:opacity-60 transition-opacity"
                            />
                          )}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11.5px] text-muted-foreground/50 text-center sm:text-left">
            © {YEAR} CRM Models. Todos os direitos reservados.
          </p>
          <p className="text-[11px] text-muted-foreground/35 text-center sm:text-right">
            Feito com carinho para profissionais de CRM
          </p>
        </div>
      </div>
    </footer>
  );
}
