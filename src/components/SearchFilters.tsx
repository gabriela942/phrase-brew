import { Search, Mail, MessageCircle, Smartphone, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/lib/hooks";

interface SearchFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: string;
  onTypeChange: (v: string) => void;
  categoryFilter: string;
  onCategoryChange: (v: string) => void;
}

export function SearchFilters({
  search, onSearchChange, typeFilter, onTypeChange, categoryFilter, onCategoryChange
}: SearchFiltersProps) {
  const { data: categories } = useCategories();
  const hasFilters = search || typeFilter || categoryFilter;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar templates..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 text-base bg-card"
        />
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1">
          {[
            { value: "", label: "Todos", icon: null },
            { value: "email", label: "Email", icon: Mail },
            { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
            { value: "sms", label: "SMS", icon: Smartphone },
          ].map((t) => (
            <Button
              key={t.value}
              variant={typeFilter === t.value ? "default" : "outline"}
              size="sm"
              onClick={() => onTypeChange(t.value)}
            >
              {t.icon && <t.icon className="h-3.5 w-3.5 mr-1" />}
              {t.label}
            </Button>
          ))}
        </div>
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[200px] h-9">
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
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => { onSearchChange(""); onTypeChange(""); onCategoryChange(""); }}>
            <X className="h-3.5 w-3.5 mr-1" /> Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
