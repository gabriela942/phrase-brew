import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TypeBadge } from "@/components/TypeBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Archive, Check, CheckCheck, Eye, RotateCcw, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { AdminSubmissionsTabs } from "@/components/admin/AdminSubmissionsTabs";
import { DeleteSubmissionDialog } from "@/components/admin/DeleteSubmissionDialog";
import {
  RejectSubmissionDialog,
  reasonLabel,
  type RejectionReasonValue,
} from "@/components/admin/RejectSubmissionDialog";
import { invalidateAdminSubmissions } from "@/hooks/useSubmissionCounts";
import {
  publishSubmissionToTemplate,
  unpublishSubmissionTemplates,
} from "@/lib/submissions";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];
type SubmissionStatus = Database["public"]["Enums"]["submission_status"];
type TemplateType = Database["public"]["Enums"]["template_type"];

const sanitizeSearch = (s: string) => s.replace(/[,()%]/g, " ").trim();

interface HistorySubmissionsViewProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  /** unique key for this view's list query (e.g. "admin-archived-submissions") */
  queryKey: string;
  /** which submission status(es) this view shows */
  statusValues: SubmissionStatus[];
  /** label of the date column (e.g. "Arquivada em", "Aprovada em") */
  dateColumnLabel: string;
  actions: {
    /** show "Aprovar" button (single + bulk) — approves and creates a published template */
    approve?: boolean;
    /** show "Reprovar" button (single + bulk) — opens reason dialog and archives any published template */
    reject?: boolean;
    /** show "Restaurar" button (single + bulk) — moves status back to 'new' */
    restore?: boolean;
    /** show "Arquivar" button (single + bulk) — moves status to 'archived' */
    archive?: boolean;
    /** show "Excluir" button (single + bulk) — hard delete with confirmation */
    delete?: boolean;
  };
}

export const HistorySubmissionsView = ({
  title,
  subtitle,
  icon: Icon,
  queryKey,
  statusValues,
  dateColumnLabel,
  actions,
}: HistorySubmissionsViewProps) => {
  const queryClient = useQueryClient();

  const [originFilter, setOriginFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [bulkRestoring, setBulkRestoring] = useState(false);
  const [bulkArchiving, setBulkArchiving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ ids: string[]; title?: string } | null>(null);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ ids: string[]; title?: string } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(sanitizeSearch(searchInput)), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: submissions, isLoading } = useQuery({
    queryKey: [queryKey, originFilter, typeFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("submissions")
        .select("*")
        .order("updated_at", { ascending: false });

      if (statusValues.length === 1) {
        query = query.eq("status", statusValues[0]);
      } else {
        query = query.in("status", statusValues);
      }

      if (originFilter === "gmail") query = query.eq("source", "gmail");
      else if (originFilter === "whatsapp") query = query.eq("source", "whatsapp");
      else if (originFilter === "manual") query = query.not("source", "in", "(gmail,whatsapp)");

      if (typeFilter !== "all") query = query.eq("template_type", typeFilter as TemplateType);

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

  const clearSelected = (ids: string[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const updateStatusForIds = async (
    ids: string[],
    status: SubmissionStatus
  ): Promise<{ ok: boolean; n: number; error?: string }> => {
    const { error, count } = await supabase
      .from("submissions")
      .update({ status }, { count: "exact" })
      .in("id", ids);
    if (error) return { ok: false, n: 0, error: error.message };
    return { ok: true, n: count ?? ids.length };
  };

  const handleApproveOne = async (sub: Submission) => {
    setApprovingId(sub.id);
    try {
      const result = await publishSubmissionToTemplate(sub);
      if (result.ok) {
        toast.success("Submissão aprovada e publicada");
        invalidateAdminSubmissions(queryClient);
        queryClient.invalidateQueries({ queryKey: ["templates"] });
        clearSelected([sub.id]);
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
      for (const id of ids) {
        const sub = submissions?.find((s) => s.id === id);
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

  const handleRestoreOne = async (sub: Submission) => {
    setRestoringId(sub.id);
    try {
      const res = await updateStatusForIds([sub.id], "new");
      if (res.ok) {
        toast.success("Submissão restaurada para a Inbox");
        invalidateAdminSubmissions(queryClient);
        clearSelected([sub.id]);
      } else {
        toast.error(`Erro ao restaurar: ${res.error}`);
      }
    } finally {
      setRestoringId(null);
    }
  };

  const handleBulkRestore = async () => {
    if (selected.size === 0) return;
    setBulkRestoring(true);
    try {
      const ids = Array.from(selected);
      const res = await updateStatusForIds(ids, "new");
      if (res.ok) {
        toast.success(
          res.n > 1 ? `${res.n} submissões restauradas para a Inbox` : "Submissão restaurada para a Inbox"
        );
        invalidateAdminSubmissions(queryClient);
        setSelected(new Set());
      } else {
        toast.error(`Erro ao restaurar: ${res.error}`);
      }
    } finally {
      setBulkRestoring(false);
    }
  };

  const handleArchiveOne = async (sub: Submission) => {
    setArchivingId(sub.id);
    try {
      const res = await updateStatusForIds([sub.id], "archived");
      if (res.ok) {
        await unpublishSubmissionTemplates([sub.id]);
        toast.success("Submissão arquivada com sucesso");
        invalidateAdminSubmissions(queryClient);
        queryClient.invalidateQueries({ queryKey: ["templates"] });
        clearSelected([sub.id]);
      } else {
        toast.error(`Erro ao arquivar: ${res.error}`);
      }
    } finally {
      setArchivingId(null);
    }
  };

  const handleBulkArchive = async () => {
    if (selected.size === 0) return;
    setBulkArchiving(true);
    try {
      const ids = Array.from(selected);
      const res = await updateStatusForIds(ids, "archived");
      if (res.ok) {
        await unpublishSubmissionTemplates(ids);
        toast.success(
          res.n > 1 ? `${res.n} submissões arquivadas com sucesso` : "Submissão arquivada com sucesso"
        );
        invalidateAdminSubmissions(queryClient);
        queryClient.invalidateQueries({ queryKey: ["templates"] });
        setSelected(new Set());
      } else {
        toast.error(`Erro ao arquivar: ${res.error}`);
      }
    } finally {
      setBulkArchiving(false);
    }
  };

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
    const notesValue = notes
      ? `[Reprovado: ${reasonText}] ${notes}`
      : `[Reprovado: ${reasonText}]`;

    const { error, count } = await supabase
      .from("submissions")
      .update({ status: "rejected", notes: notesValue }, { count: "exact" })
      .in("id", rejectTarget.ids);

    if (error) {
      toast.error(`Erro ao reprovar: ${error.message}`);
      return;
    }

    // Archive any linked published template so it leaves the public library
    await unpublishSubmissionTemplates(rejectTarget.ids);

    const n = count ?? rejectTarget.ids.length;
    toast.success(
      n > 1 ? `${n} submissões reprovadas com sucesso` : "Submissão reprovada com sucesso"
    );
    invalidateAdminSubmissions(queryClient);
    queryClient.invalidateQueries({ queryKey: ["templates"] });
    clearSelected(rejectTarget.ids);
    setRejectDialogOpen(false);
    setRejectTarget(null);
  };

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
    // Despublish before deleting so orphan templates don't stay public.
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
    clearSelected(deleteTarget.ids);
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const filtersActive = searchTerm || originFilter !== "all" || typeFilter !== "all";

  return (
    <>
      <div className="container py-8 space-y-6">
        <AdminSubmissionsTabs />

        <div className="space-y-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
              <Icon className="h-7 w-7" /> {title}
            </h1>
            <p className="text-muted-foreground mt-1">{subtitle}</p>
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

            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v);
                setSelected(new Set());
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="email">📧 Email</SelectItem>
                <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                <SelectItem value="sms">📱 SMS</SelectItem>
                <SelectItem value="push">🔔 Push</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {someSelected && (
            <div className="flex gap-2 items-center flex-wrap rounded-lg border bg-muted/40 px-3 py-2">
              <span className="text-sm text-muted-foreground">{selected.size} selecionada(s)</span>
              <div className="flex gap-2 ml-auto flex-wrap">
                {actions.approve && (
                  <Button
                    onClick={handleBulkApprove}
                    disabled={bulkApproving}
                    size="sm"
                    className="gap-2"
                  >
                    <CheckCheck className="h-4 w-4" />
                    {bulkApproving ? "Aprovando..." : "Aprovar selecionados"}
                  </Button>
                )}
                {actions.reject && (
                  <Button
                    onClick={openRejectDialogForBulk}
                    size="sm"
                    variant="outline"
                    className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                    Reprovar selecionados
                  </Button>
                )}
                {actions.restore && (
                  <Button
                    onClick={handleBulkRestore}
                    disabled={bulkRestoring}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {bulkRestoring ? "Restaurando..." : "Restaurar selecionados"}
                  </Button>
                )}
                {actions.archive && (
                  <Button
                    onClick={handleBulkArchive}
                    disabled={bulkArchiving}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Archive className="h-4 w-4" />
                    {bulkArchiving ? "Arquivando..." : "Arquivar selecionados"}
                  </Button>
                )}
                {actions.delete && (
                  <Button
                    onClick={openDeleteDialogForBulk}
                    size="sm"
                    variant="outline"
                    className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir selecionados
                  </Button>
                )}
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
                    <TableHead>Tipo</TableHead>
                    <TableHead>Título / Assunto</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>{dateColumnLabel}</TableHead>
                    <TableHead className="w-[160px]">Ações</TableHead>
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
                        <TypeBadge type={s.template_type} />
                      </TableCell>
                      <TableCell className="max-w-[260px] truncate font-medium">
                        {s.title || s.raw_subject || "Sem título"}
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                        {s.brand || "—"}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground capitalize">{s.source}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(s.updated_at).toLocaleDateString("pt-BR")}
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

                          {actions.approve && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproveOne(s)}
                                  disabled={approvingId === s.id}
                                  aria-label="Aprovar submissão"
                                  className="border-whatsapp/40 text-whatsapp hover:bg-whatsapp/10 hover:text-whatsapp"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Aprovar submissão</TooltipContent>
                            </Tooltip>
                          )}

                          {actions.reject && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openRejectDialogForOne(s)}
                                  aria-label="Reprovar submissão"
                                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reprovar submissão</TooltipContent>
                            </Tooltip>
                          )}

                          {actions.restore && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRestoreOne(s)}
                                  disabled={restoringId === s.id}
                                  aria-label="Restaurar para a Inbox"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Restaurar para a Inbox</TooltipContent>
                            </Tooltip>
                          )}

                          {actions.archive && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleArchiveOne(s)}
                                  disabled={archivingId === s.id}
                                  aria-label="Arquivar submissão"
                                >
                                  <Archive className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Arquivar submissão</TooltipContent>
                            </Tooltip>
                          )}

                          {actions.delete && (
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
                          )}
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
            <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground">
              {filtersActive ? "Nenhum resultado" : "Nenhum item por aqui"}
            </h3>
            <p className="text-muted-foreground">
              {filtersActive ? "Ajuste a busca ou os filtros para ver mais." : "Submissões aparecerão aqui."}
            </p>
          </div>
        )}
      </div>

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
    </>
  );
};
