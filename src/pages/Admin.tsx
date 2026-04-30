import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TypeBadge } from "@/components/TypeBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Archive,
  Check,
  CheckCheck,
  Eye,
  Inbox,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";
import {
  RejectSubmissionDialog,
  reasonLabel,
  type RejectionReasonValue,
} from "@/components/admin/RejectSubmissionDialog";
import { DeleteSubmissionDialog } from "@/components/admin/DeleteSubmissionDialog";
import { AdminSubmissionsTabs } from "@/components/admin/AdminSubmissionsTabs";
import { invalidateAdminSubmissions } from "@/hooks/useSubmissionCounts";
import {
  publishSubmissionToTemplate,
  unpublishSubmissionTemplates,
} from "@/lib/submissions";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];
type SubmissionStatus = Database["public"]["Enums"]["submission_status"];

const INBOX_STATUSES: SubmissionStatus[] = ["new", "in_review"];

const statusColors: Record<SubmissionStatus, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  in_review: "bg-sms/10 text-sms border-sms/20",
  approved: "bg-whatsapp/10 text-whatsapp border-whatsapp/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  archived: "bg-muted text-muted-foreground border-muted-foreground/20",
};

const statusLabels: Record<SubmissionStatus, string> = {
  new: "Novo",
  in_review: "Em revisão",
  approved: "Aprovado",
  rejected: "Reprovado",
  archived: "Arquivado",
};

// Strip Postgrest-special chars from user search to avoid breaking the .or() string.
const sanitizeSearch = (s: string) => s.replace(/[,()%]/g, " ").trim();

const Admin = () => {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [originFilter, setOriginFilter] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [ingesting, setIngesting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [bulkApproving, setBulkApproving] = useState(false);
  const [bulkArchiving, setBulkArchiving] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  // Reject dialog — single or bulk
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ ids: string[]; title?: string } | null>(null);

  // Delete dialog — single or bulk
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ ids: string[]; title?: string } | null>(null);

  // Bulk archive confirmation
  const [bulkArchiveOpen, setBulkArchiveOpen] = useState(false);

  // Manual submission dialog
  const [manualOpen, setManualOpen] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [manualForm, setManualForm] = useState({
    template_type: "whatsapp" as "email" | "whatsapp" | "sms" | "push",
    source: "whatsapp",
    title: "",
    brand: "",
    content: "",
    notes: "",
  });

  const resetManualForm = () =>
    setManualForm({
      template_type: "whatsapp",
      source: "whatsapp",
      title: "",
      brand: "",
      content: "",
      notes: "",
    });

  // Debounce search input → searchTerm
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(sanitizeSearch(searchInput)), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleManualCreate = async () => {
    if (!manualForm.content.trim()) {
      toast.error("Conteúdo é obrigatório");
      return;
    }
    setManualSaving(true);
    try {
      const { error } = await supabase.from("submissions").insert({
        source: manualForm.source,
        template_type: manualForm.template_type,
        title: manualForm.title.trim() || `(${manualForm.template_type}) ${manualForm.brand || "manual"}`,
        brand: manualForm.brand.trim() || null,
        raw_body: manualForm.content,
        parsed_body: manualForm.content,
        suggested_tags: [],
        language: "pt-BR",
        status: "new",
        notes: manualForm.notes.trim() || null,
      });
      if (error) throw error;
      toast.success("Submissão criada!");
      invalidateAdminSubmissions(queryClient);
      setManualOpen(false);
      resetManualForm();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Erro: ${msg}`);
    } finally {
      setManualSaving(false);
    }
  };

  const handleIngestGmail = async () => {
    setIngesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("ingest-gmail");
      if (error) throw error;
      toast.success(`${data.ingested} email(s) importado(s) com sucesso!`);
      invalidateAdminSubmissions(queryClient);
    } catch (err: any) {
      toast.error("Erro ao importar emails: " + (err.message || "Erro desconhecido"));
    } finally {
      setIngesting(false);
    }
  };

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["admin-submissions", statusFilter, originFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      // Inbox is a work queue: never show approved/rejected/archived here.
      if (statusFilter === "all") {
        query = query.in("status", INBOX_STATUSES);
      } else {
        query = query.eq("status", statusFilter as SubmissionStatus);
      }

      if (originFilter === "gmail") query = query.eq("source", "gmail");
      else if (originFilter === "whatsapp") query = query.eq("source", "whatsapp");
      else if (originFilter === "manual") query = query.not("source", "in", "(gmail,whatsapp)");

      if (searchTerm) {
        const pat = `%${searchTerm}%`;
        query = query.or(
          `title.ilike.${pat},raw_subject.ilike.${pat},brand.ilike.${pat},raw_from.ilike.${pat},source.ilike.${pat}`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Submission[];
    },
  });

  const allIds = submissions?.map((s) => s.id) ?? [];
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allIds));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Approve ──────────────────────────────────────────────────────────
  const handleApproveOne = async (sub: Submission) => {
    setApprovingId(sub.id);
    try {
      const result = await publishSubmissionToTemplate(sub);
      if (result.ok) {
        toast.success("Submissão aprovada e publicada");
        invalidateAdminSubmissions(queryClient);
        queryClient.invalidateQueries({ queryKey: ["templates"] });
      } else {
        toast.error(`Erro ao aprovar: ${result.error ?? "desconhecido"}`);
      }
    } finally {
      setApprovingId(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selected.size === 0) return;
    setBulkApproving(true);
    try {
      const ids = Array.from(selected);
      let approved = 0;
      let errors = 0;
      for (const subId of ids) {
        const sub = submissions?.find((s) => s.id === subId);
        if (!sub) continue;
        const result = await publishSubmissionToTemplate(sub);
        if (result.ok) approved++;
        else errors++;
      }

      invalidateAdminSubmissions(queryClient);
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      setSelected(new Set());

      if (errors > 0) toast.warning(`${approved} aprovado(s), ${errors} com erro.`);
      else toast.success(`${approved} submissão(ões) aprovada(s) e publicada(s)!`);
    } finally {
      setBulkApproving(false);
    }
  };

  // ── Reject ───────────────────────────────────────────────────────────
  const openRejectDialogForOne = (sub: Submission) => {
    setRejectTarget({ ids: [sub.id], title: sub.title || sub.raw_subject || undefined });
    setRejectDialogOpen(true);
  };

  const openRejectDialogForBulk = () => {
    if (selected.size === 0) return;
    setRejectTarget({ ids: Array.from(selected) });
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = async (reason: RejectionReasonValue, notes: string) => {
    if (!rejectTarget) return;
    const reasonText = reasonLabel(reason);
    const notesValue = notes ? `[Reprovado: ${reasonText}] ${notes}` : `[Reprovado: ${reasonText}]`;

    const { error, count } = await supabase
      .from("submissions")
      .update({ status: "rejected", notes: notesValue }, { count: "exact" })
      .in("id", rejectTarget.ids);

    if (error) {
      toast.error(`Erro ao reprovar: ${error.message}`);
      return;
    }

    // Also archive any published template linked to these submissions so they
    // disappear from the public library.
    await unpublishSubmissionTemplates(rejectTarget.ids);

    const n = count ?? rejectTarget.ids.length;
    toast.success(n > 1 ? `${n} submissões reprovadas com sucesso` : "Submissão reprovada com sucesso");
    invalidateAdminSubmissions(queryClient);
    queryClient.invalidateQueries({ queryKey: ["templates"] });
    setSelected((prev) => {
      const next = new Set(prev);
      rejectTarget.ids.forEach((id) => next.delete(id));
      return next;
    });
    setRejectDialogOpen(false);
    setRejectTarget(null);
  };

  // ── Archive ──────────────────────────────────────────────────────────
  const archiveSubmissionIds = async (ids: string[]): Promise<{ ok: boolean; n: number; error?: string }> => {
    const { error, count } = await supabase
      .from("submissions")
      .update({ status: "archived" }, { count: "exact" })
      .in("id", ids);
    if (error) return { ok: false, n: 0, error: error.message };
    return { ok: true, n: count ?? ids.length };
  };

  const handleArchiveOne = async (sub: Submission) => {
    setArchivingId(sub.id);
    try {
      const res = await archiveSubmissionIds([sub.id]);
      if (res.ok) {
        // Also remove from public library
        await unpublishSubmissionTemplates([sub.id]);
        toast.success("Submissão arquivada com sucesso");
        invalidateAdminSubmissions(queryClient);
        queryClient.invalidateQueries({ queryKey: ["templates"] });
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(sub.id);
          return next;
        });
      } else {
        toast.error(`Erro ao arquivar: ${res.error}`);
      }
    } finally {
      setArchivingId(null);
    }
  };

  const handleConfirmBulkArchive = async () => {
    if (selected.size === 0) return;
    setBulkArchiving(true);
    try {
      const ids = Array.from(selected);
      const res = await archiveSubmissionIds(ids);
      if (res.ok) {
        await unpublishSubmissionTemplates(ids);
        toast.success(
          res.n > 1 ? `${res.n} submissões arquivadas com sucesso` : "Submissão arquivada com sucesso"
        );
        invalidateAdminSubmissions(queryClient);
        queryClient.invalidateQueries({ queryKey: ["templates"] });
        setSelected(new Set());
        setBulkArchiveOpen(false);
      } else {
        toast.error(`Erro ao arquivar: ${res.error}`);
      }
    } finally {
      setBulkArchiving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────
  const openDeleteDialogForOne = (sub: Submission) => {
    setDeleteTarget({ ids: [sub.id], title: sub.title || sub.raw_subject || undefined });
    setDeleteDialogOpen(true);
  };

  const openDeleteDialogForBulk = () => {
    if (selected.size === 0) return;
    setDeleteTarget({ ids: Array.from(selected) });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    // Despublish before deleting — once the submission row is gone, the FK is
    // SET NULL and orphan templates would otherwise stay published.
    await unpublishSubmissionTemplates(deleteTarget.ids);

    const { error, count } = await supabase
      .from("submissions")
      .delete({ count: "exact" })
      .in("id", deleteTarget.ids);

    if (error) {
      toast.error(`Erro ao excluir: ${error.message}`);
      return;
    }

    const n = count ?? deleteTarget.ids.length;
    toast.success(n > 1 ? `${n} submissões excluídas com sucesso` : "Submissão excluída com sucesso");
    invalidateAdminSubmissions(queryClient);
    queryClient.invalidateQueries({ queryKey: ["templates"] });
    setSelected((prev) => {
      const next = new Set(prev);
      deleteTarget.ids.forEach((id) => next.delete(id));
      return next;
    });
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="container py-8 space-y-6">
        <AdminSubmissionsTabs />

        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
                <Inbox className="h-7 w-7" /> Inbox de Submissões
              </h1>
              <p className="text-muted-foreground mt-1">
                Revise, aprove, arquive ou exclua modelos da fila de moderação.
              </p>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <Button onClick={() => setManualOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nova submissão
              </Button>
              <Button onClick={handleIngestGmail} disabled={ingesting} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${ingesting ? "animate-spin" : ""}`} />
                {ingesting ? "Importando..." : "Importar Emails"}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative flex-1 min-w-[260px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por assunto, marca, remetente ou e-mail..."
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setSelected(new Set());
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toda a fila</SelectItem>
                <SelectItem value="new">Novo</SelectItem>
                <SelectItem value="in_review">Em revisão</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={originFilter}
              onValueChange={(v) => {
                setOriginFilter(v);
                setSelected(new Set());
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as origens</SelectItem>
                <SelectItem value="gmail">Gmail</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {someSelected && (
            <div className="flex gap-2 items-center flex-wrap rounded-lg border bg-muted/40 px-3 py-2">
              <span className="text-sm text-muted-foreground">
                {selected.size} selecionada(s)
              </span>
              <div className="flex gap-2 ml-auto flex-wrap">
                <Button onClick={handleBulkApprove} disabled={bulkApproving} size="sm" className="gap-2">
                  <CheckCheck className="h-4 w-4" />
                  {bulkApproving ? "Aprovando..." : "Aprovar selecionados"}
                </Button>
                <Button
                  onClick={openRejectDialogForBulk}
                  size="sm"
                  variant="outline"
                  className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                  Reprovar selecionados
                </Button>
                <Button
                  onClick={() => setBulkArchiveOpen(true)}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Archive className="h-4 w-4" />
                  Arquivar selecionados
                </Button>
                <Button
                  onClick={openDeleteDialogForBulk}
                  size="sm"
                  variant="outline"
                  className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir selecionados
                </Button>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : submissions && submissions.length > 0 ? (
          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <TooltipProvider delayDuration={250}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleAll}
                        aria-label="Selecionar todos"
                      />
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Título / Assunto</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="w-[230px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((s) => (
                    <TableRow key={s.id} className={selected.has(s.id) ? "bg-primary/5" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selected.has(s.id)}
                          onCheckedChange={() => toggleOne(s.id)}
                          aria-label="Selecionar linha"
                        />
                      </TableCell>
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/admin/review/${s.id}`} aria-label="Visualizar submissão">
                                  <Eye className="h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Visualizar submissão</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveOne(s)}
                                disabled={approvingId === s.id || s.status === "approved"}
                                aria-label="Aprovar submissão"
                                className="border-whatsapp/40 text-whatsapp hover:bg-whatsapp/10 hover:text-whatsapp"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Aprovar submissão</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRejectDialogForOne(s)}
                                disabled={s.status === "rejected"}
                                aria-label="Reprovar submissão"
                                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reprovar submissão</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleArchiveOne(s)}
                                disabled={archivingId === s.id || s.status === "archived"}
                                aria-label="Arquivar submissão"
                              >
                                <Archive className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Arquivar submissão</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openDeleteDialogForOne(s)}
                                aria-label="Excluir submissão"
                                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Excluir submissão</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        ) : (
          <div className="text-center py-20">
            <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground">
              {searchTerm || statusFilter !== "all" || originFilter !== "all"
                ? "Nenhum resultado"
                : "Inbox vazio"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" || originFilter !== "all"
                ? "Ajuste a busca ou os filtros para ver mais."
                : "Nenhuma submissão encontrada."}
            </p>
          </div>
        )}
      </div>

      {/* ── Dialog: nova submissão manual ───────────────────────────── */}
      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Nova submissão manual</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Cole conteúdo de um print, WhatsApp, SMS ou push pra adicionar à fila de revisão.
            </p>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Canal</Label>
                <Select
                  value={manualForm.template_type}
                  onValueChange={(v) =>
                    setManualForm({
                      ...manualForm,
                      template_type: v as typeof manualForm.template_type,
                      source: v === "email" ? "email" : v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">📧 Email</SelectItem>
                    <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                    <SelectItem value="sms">📱 SMS</SelectItem>
                    <SelectItem value="push">🔔 Push</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Origem</Label>
                <Select
                  value={manualForm.source}
                  onValueChange={(v) => setManualForm({ ...manualForm, source: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp (print/QR)</SelectItem>
                    <SelectItem value="email">Email manual</SelectItem>
                    <SelectItem value="form">Formulário</SelectItem>
                    <SelectItem value="manual">Manual (admin)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Marca / Enviador</Label>
              <Input
                value={manualForm.brand}
                onChange={(e) => setManualForm({ ...manualForm, brand: e.target.value })}
                placeholder="Ex: Nubank, iFood, Hotmart"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label>Título / Assunto</Label>
              <Input
                value={manualForm.title}
                onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                placeholder="Resuma o template em uma linha"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label>Conteúdo *</Label>
              <Textarea
                value={manualForm.content}
                onChange={(e) => setManualForm({ ...manualForm, content: e.target.value })}
                placeholder="Cole o texto/print do template aqui..."
                rows={8}
                className="font-mono text-[13px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Notas internas (opcional)</Label>
              <Input
                value={manualForm.notes}
                onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                placeholder="Ex: enviado pelo Diego via WA em 24/04"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setManualOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleManualCreate} disabled={manualSaving}>
              {manualSaving ? "Salvando..." : "Criar submissão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RejectSubmissionDialog
        open={rejectDialogOpen}
        onOpenChange={(open) => {
          setRejectDialogOpen(open);
          if (!open) setRejectTarget(null);
        }}
        count={rejectTarget?.ids.length ?? 0}
        title={rejectTarget?.title}
        onConfirm={handleConfirmReject}
      />

      <DeleteSubmissionDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        count={deleteTarget?.ids.length ?? 0}
        title={deleteTarget?.title}
        onConfirm={handleConfirmDelete}
      />

      {/* ── AlertDialog: confirmação leve para arquivar em lote ────── */}
      <AlertDialog open={bulkArchiveOpen} onOpenChange={setBulkArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Arquivar submissões
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selected.size > 1
                ? `Arquivar ${selected.size} submissões selecionadas? Elas saem da fila principal mas podem ser revisadas no filtro "Arquivado".`
                : `Arquivar a submissão selecionada? Ela sai da fila principal mas pode ser revisada no filtro "Arquivado".`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkArchiving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBulkArchive} disabled={bulkArchiving}>
              {bulkArchiving ? "Arquivando..." : "Arquivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Admin;
