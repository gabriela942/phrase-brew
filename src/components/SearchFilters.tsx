import { Search, Mail, MessageCircle, Smartphone, Bell, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories, useDistinctFilterValues } from "@/lib/hooks";

interface SearchFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: string;
  onTypeChange: (v: string) => void;
  categoryFilter: string;
  onCategoryChange: (v: string) => void;
  marketFilter: string;
  onMarketChange: (v: string) => void;
}

const typeButtons = [
  { value: "", label: "Todos", icon: null },
  { value: "email", label: "Email", icon: Mail },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "sms", label: "SMS", icon: Smartphone },
  { value: "push", label: "Push", icon: Bell },
];

export function SearchFilters({
  search, onSearchChange, typeFilter, onTypeChange, categoryFilter, onCategoryChange,
  marketFilter, onMarketChange,
}: SearchFiltersProps) {
  const { data: categories } = useCategories();
  const { data: filterValues } = useDistinctFilterValues();
  const hasFilters = search || typeFilter || categoryFilter || marketFilter;

  return (
    <div className="bg-card/80 glass-subtle rounded-2xl border border-border/60 p-4 md:p-5 space-y-4 shadow-card">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
        <Input
          placeholder="Buscar por marca, categoria, tipo..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-11 h-12 text-base bg-background/60 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Type pill buttons */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
          {typeButtons.map((t) => (
            <button
              key={t.value}
              onClick={() => onTypeChange(t.value)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${typeFilter === t.value
                  ? "bg-gradient-hero text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                }
              `}
            >
              {t.icon && <t.icon className="h-3.5 w-3.5" />}
              {t.label}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-border/60 hidden md:block mx-1" />

        {/* Dropdowns */}
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px] h-9 bg-background/60 border-border/50 rounded-lg">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.icon} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={marketFilter} onValueChange={onMarketChange}>
          <SelectTrigger className="w-[160px] h-9 bg-background/60 border-border/50 rounded-lg">
            <SelectValue placeholder="Mercado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos mercados</SelectItem>
            {filterValues?.marketTypes?.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => { onSearchChange(""); onTypeChange(""); onCategoryChange(""); onMarketChange(""); }}
          >
            <X className="h-3.5 w-3.5 mr-1" /> Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
