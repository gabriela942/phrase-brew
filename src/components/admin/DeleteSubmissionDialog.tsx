import { useState } from "react";
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

interface DeleteSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  title?: string;
  onConfirm: () => Promise<void>;
}

export const DeleteSubmissionDialog = ({
  open,
  onOpenChange,
  count,
  title,
  onConfirm,
}: DeleteSubmissionDialogProps) => {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  const headerSuffix = count > 1 ? ` (${count})` : "";
  const description =
    count > 1
      ? `Essa ação removerá permanentemente ${count} submissões. Deseja continuar?`
      : title
        ? `Essa ação removerá permanentemente a submissão "${title}". Deseja continuar?`
        : "Essa ação removerá permanentemente a submissão. Deseja continuar?";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">
            Excluir submissão{headerSuffix}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
