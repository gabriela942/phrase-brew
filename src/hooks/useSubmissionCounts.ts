import { useQuery, type QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SubmissionCounts = {
  inbox: number;
  approved: number;
  rejected: number;
  archived: number;
};

const QUERY_KEY = ["admin", "submission-counts"] as const;

const fetchCounts = async (): Promise<SubmissionCounts> => {
  const [inbox, approved, rejected, archived] = await Promise.all([
    supabase.from("submissions").select("id", { count: "exact", head: true }).in("status", ["new", "in_review"]),
    supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "archived"),
  ]);

  return {
    inbox: inbox.count ?? 0,
    approved: approved.count ?? 0,
    rejected: rejected.count ?? 0,
    archived: archived.count ?? 0,
  };
};

export const useSubmissionCounts = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchCounts,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

// Single helper to call after any mutation that changes a submission's status
// or count — invalidates every list query and the counters.
export const invalidateAdminSubmissions = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
  queryClient.invalidateQueries({ queryKey: ["admin-archived-submissions"] });
  queryClient.invalidateQueries({ queryKey: ["admin-approved-submissions"] });
  queryClient.invalidateQueries({ queryKey: ["admin-rejected-submissions"] });
  queryClient.invalidateQueries({ queryKey: QUERY_KEY });
};
