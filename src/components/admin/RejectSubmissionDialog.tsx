import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const REJECTION_REASONS = [
  { value: "not_crm", label: "Não é template de CRM" },
  { value: "incomplete", label: "Conteúdo incompleto" },
  { value: "low_quality", label: "Baixa qualidade" },
  { value: "duplicate", label: "Duplicado" },
  { value: "out_of_scope", label: "Fora do escopo" },
  { value: "other", label: "Outro" },
] as const;

export type RejectionReasonValue = (typeof REJECTION_REASONS)[number]["value"];

export const reasonLabel = (value: RejectionReasonValue): string =>
  REJECTION_REASONS.find((r) => r.value === value)?.label ?? value;

interface RejectSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  title?: string;
  onConfirm: (reason: RejectionReasonValue, notes: string) => Promise<void>;
}

export const RejectSubmissionDialog = ({
  open,
  onOpenChange,
  count,
  title,
  onConfirm,
}: RejectSubmissionDialogProps) => {
  const [reason, setReason] = useState<RejectionReasonValue>("not_crm");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("not_crm");
      setNotes("");
      setSaving(false);
    }
  }, [open]);

  const isOther = reason === "other";
  const notesRequired = isOther;
  const canConfirm = !saving && (!notesRequired || notes.trim().length > 0);

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setSaving(true);
    try {
      await onConfirm(reason, notes.trim());
    } finally {
      setSaving(false);
    }
  };

  const headerSuffix = count > 1 ? ` (${count})` : "";
  const subjectLine =
    count > 1
      ? `Você está prestes a reprovar ${count} submissões.`
      : title
        ? `Submissão: "${title}"`
        : "Confirme a reprovação desta submissão.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Reprovar submissão{headerSuffix}</DialogTitle>
          <p className="text-sm text-muted-foreground">{subjectLine}</p>
          <p className="text-sm text-muted-foreground">
            Opcionalmente registre um motivo para ajudar na triagem futura.
          </p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-3">
            <Label>Motivo</Label>
            <RadioGroup
              value={reason}
              onValueChange={(v) => setReason(v as RejectionReasonValue)}
              className="grid gap-2"
            >
              {REJECTION_REASONS.map((r) => (
                <div key={r.value} className="flex items-center gap-2">
                  <RadioGroupItem value={r.value} id={`reject-reason-${r.value}`} />
                  <Label htmlFor={`reject-reason-${r.value}`} className="cursor-pointer font-normal">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reject-notes">
              {isOther ? "Descreva o motivo *" : "Observação (opcional)"}
            </Label>
            <Textarea
              id="reject-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isOther
                  ? "Explique brevemente o motivo da reprovação"
                  : "Detalhes adicionais para a triagem"
              }
              rows={isOther ? 5 : 3}
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            {saving ? "Reprovando..." : "Confirmar reprovação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
