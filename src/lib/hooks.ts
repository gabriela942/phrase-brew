import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ─── Market type normalization ────────────────────────────────────────────────
// The DB stores raw values; useDistinctFilterValues normalizes them for display.
// usePublishedTemplates must reverse the normalization before querying.

const MARKET_DENORMALIZE: Record<string, string> = {
  "E-commerce/Varejo": "E-commerce",
  "Serviços": "Serviço",
};

// Explore preset slugs that change the sort order instead of filtering by tag
const SORT_EXPLORE_SLUGS = new Set(["mais-copiados", "mais-vistos", "novos"]);

// Explore presets that don't map cleanly to template tags need keyword search
// over title + content. Each slug → list of substrings to OR-ilike.
const EXPLORE_KEYWORDS: Record<string, string[]> = {
  // Datas especiais
  carnaval: ["carnaval"],
  pascoa: ["páscoa", "pascoa"],
  "dia-das-maes": ["dia das mães", "mães"],
  "dia-dos-namorados": ["namorados"],
  "dia-dos-pais": ["dia dos pais"],
  "dia-do-cliente": ["dia do cliente"],
  "black-friday": ["black friday", "blackfriday"],
  "cyber-monday": ["cyber monday", "cybermonday"],
  natal: ["natal"],
  "ano-novo": ["ano novo", "ano-novo", "réveillon", "reveillon"],

  // Objetivo da campanha
  "melhor-conversao": ["compre", "comprar", "garantir", "desconto", "oferta", "promoção", "% off"],
  "melhor-retencao": ["fidelidade", "exclusivo", "vip", "membro", "assinante"],
  "melhor-recuperacao": ["carrinho", "voltar", "saudades", "sentimos sua falta", "abandon"],
  "melhor-relacionamento": ["obrigad", "satisfação", "feedback", "agradecemos", "parabéns"],
  "melhor-conteudo": ["newsletter", "novidade", "blog", "conteúdo", "artigo"],

  // Tendências
  "tendencia-de-alta": ["tendência", "tendencia", "alta"],
  "mais-curtidos": ["curtid"],
};

const escapeIlikeValue = (s: string) =>
  s.replace(/[,()]/g, " ").replace(/%/g, "\\%");

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function usePublishedTemplates(filters?: {
  types?: string[];
  categoryId?: string;
  search?: string;
  marketType?: string;
  segment?: string;
  brand?: string;
  /** Tag slug from the Tendências section (e.g. "cta-forte") */
  tags?: string;
  /** Explore preset slug (date presets, curadoria, or sort presets) */
  explore?: string;
}) {
  return useQuery({
    queryKey: ["templates", "published", filters],
    queryFn: async () => {
      let query = supabase
        .from("templates")
        .select("*, categories(name, slug, icon)")
        .eq("status", "published");

      // ── Channel filter (multi-select) ──
      if (filters?.types && filters.types.length > 0) {
        const valid = filters.types.filter((t) =>
          ["email", "whatsapp", "sms", "push"].includes(t)
        );
        if (valid.length === 1) {
          query = query.eq("template_type", valid[0]);
        } else if (valid.length > 1) {
          query = query.in("template_type", valid);
        }
      }

      if (filters?.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }

      if (filters?.marketType) {
        const dbValue =
          MARKET_DENORMALIZE[filters.marketType] ?? filters.marketType;
        query = query.eq("market_type", dbValue);
      }

      if (filters?.segment) {
        query = query.eq("segment", filters.segment);
      }

      if (filters?.brand) {
        query = query.eq("brand", filters.brand);
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`
        );
      }

      // ── Tag filter (Tendências) ──
      if (filters?.tags) {
        query = query.contains("tags", [filters.tags]);
      }

      // ── Explore filter ──
      if (filters?.explore && !SORT_EXPLORE_SLUGS.has(filters.explore)) {
        const keywords = EXPLORE_KEYWORDS[filters.explore];
        if (keywords && keywords.length > 0) {
          // Broad search: title or content contains any of the keywords.
          // Templates rarely carry slug-shaped tags; this covers real content.
          const orClauses = keywords
            .flatMap((kw) => {
              const e = escapeIlikeValue(kw);
              return [`title.ilike.%${e}%`, `content.ilike.%${e}%`];
            })
            .join(",");
          query = query.or(orClauses);
        } else {
          // Fallback: keep tag-contains for slugs without keyword mapping
          query = query.contains("tags", [filters.explore]);
        }
      }

      // ── Sorting ──
      if (
        filters?.explore === "mais-copiados" ||
        filters?.explore === "mais-vistos"
      ) {
        query = query.order("copies_count", { ascending: false });
      } else {
        query = query.order("published_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ["template", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*, categories(name, slug, icon)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useDistinctFilterValues() {
  return useQuery({
    queryKey: ["filter-values"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("market_type, segment, brand")
        .eq("status", "published");
      if (error) throw error;

      // Normalize market types for display
      const normalizedMarkets = data
        ?.map((t) => {
          if (t.market_type === "E-commerce") return "E-commerce/Varejo";
          if (t.market_type === "Serviço") return "Serviços";
          return t.market_type;
        })
        .filter(Boolean) as string[];

      const marketTypes = [...new Set(normalizedMarkets)].sort();
      const segments = [
        ...new Set(data?.map((t) => t.segment).filter(Boolean) as string[]),
      ].sort();
      const brands = [
        ...new Set(data?.map((t) => t.brand).filter(Boolean) as string[]),
      ].sort();

      return { marketTypes, segments, brands };
    },
  });
}

export async function incrementCopyCount(templateId: string) {
  await supabase.rpc("increment_copy_count", { template_id: templateId });
}
