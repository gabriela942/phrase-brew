import { useDistinctFilterValues } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MarketPanelProps {
  activeMarket: string;
  onMarketSelect: (market: string) => void;
  onClose: () => void;
}

// Market emoji map
const MARKET_ICONS: Record<string, string> = {
  "SaaS": "💻",
  "E-commerce": "🛒",
  "E-commerce/Varejo": "🛒",
  "Serviços": "🔧",
  "Serviço": "🔧",
  "Infoproduto": "🎓",
  "Educação": "📚",
  "Saúde": "🏥",
  "Imobiliário": "🏠",
  "Financeiro": "💰",
  "Comunidade / Membership": "👥",
  "Comunidade": "👥",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function MarketPanel({
  activeMarket,
  onMarketSelect,
  onClose,
}: MarketPanelProps) {
  const { data: filterValues, isLoading } = useDistinctFilterValues();
  const markets = filterValues?.marketTypes ?? [];

  return (
    <div className="py-6 pb-8">
      <div className="flex items-center gap-2 mb-5">
        <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground/50">
          Mercados
        </span>
        {activeMarket && (
          <button
            onClick={() => { onMarketSelect(""); onClose(); }}
            className="ml-auto text-[11px] text-muted-foreground hover:text-destructive transition-colors font-medium"
          >
            Limpar seleção
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : markets.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
          {markets.map((market) => {
            const isActive = activeMarket === market;
            const icon = MARKET_ICONS[market] ?? "🏢";
            return (
              <button
                key={market}
                onClick={() => {
                  onMarketSelect(isActive ? "" : market);
                  onClose();
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-[13px] font-medium transition-all duration-150 border group",
                  isActive
                    ? "bg-primary/10 border-primary/25 text-primary shadow-sm"
                    : "bg-muted/30 border-transparent text-foreground/75 hover:bg-muted/60 hover:text-foreground hover:border-border/40"
                )}
              >
                <span className="text-lg leading-none">{icon}</span>
                <span>{market}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-[13px] text-muted-foreground/60 px-1">
          Nenhum mercado disponível ainda.
        </p>
      )}
    </div>
  );
}
