import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  type?: string;
  categoryId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["templates", "published", filters],
    queryFn: async () => {
      let query = supabase
        .from("templates")
        .select("*, categories(name, slug, icon)")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (filters?.type && (filters.type === "email" || filters.type === "whatsapp" || filters.type === "sms" || filters.type === "push")) {
        query = query.eq("template_type", filters.type);
      }
      if (filters?.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`
        );
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

export async function incrementCopyCount(templateId: string) {
  await supabase.rpc("increment_copy_count", { template_id: templateId });
}
