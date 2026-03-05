import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { TypeBadge } from "@/components/TypeBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Check, X, Inbox, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];

const statusColors: Record<string, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  in_review: "bg-sms/10 text-sms border-sms/20",
  approved: "bg-whatsapp/10 text-whatsapp border-whatsapp/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels: Record<string, string> = {
  new: "Novo",
  in_review: "Em revisão",
  approved: "Aprovado",
  rejected: "Reprovado",
};

const Admin = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ingesting, setIngesting] = useState(false);

  const handleIngestGmail = async () => {
    setIngesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("ingest-gmail");
      if (error) throw error;
      toast.success(`${data.ingested} email(s) importado(s) com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
    } catch (err: any) {
      toast.error("Erro ao importar emails: " + (err.message || "Erro desconhecido"));
    } finally {
      setIngesting(false);
    }
  };

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["admin-submissions", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter as any);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Submission[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
              <Inbox className="h-7 w-7" /> Inbox de Submissões
            </h1>
            <p className="text-muted-foreground mt-1">Revise e aprove modelos enviados pela comunidade.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleIngestGmail} disabled={ingesting} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${ingesting ? "animate-spin" : ""}`} />
              {ingesting ? "Importando..." : "Importar Emails"}
            </Button>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="new">Novos</SelectItem>
              <SelectItem value="in_review">Em revisão</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="rejected">Reprovados</SelectItem>
            </SelectContent>
          </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : submissions && submissions.length > 0 ? (
          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Título / Assunto</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[s.status]}>
                        {statusLabels[s.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <TypeBadge type={s.template_type} />
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate font-medium">
                      {s.title || s.raw_subject || "Sem título"}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground capitalize">{s.source}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/admin/review/${s.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-20">
            <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground">Inbox vazio</h3>
            <p className="text-muted-foreground">Nenhuma submissão encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
