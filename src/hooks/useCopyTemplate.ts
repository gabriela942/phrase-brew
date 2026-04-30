import { useState, useCallback } from "react";
import { toast } from "sonner";
import { incrementCopyCount } from "@/lib/hooks";

const isImageUrl = (str: string) =>
  /^https?:\/\/.+\.(png|jpg|jpeg|webp|gif)/i.test(str) ||
  (str.includes("supabase") && str.includes("submission-images"));

// ─── Copy template content ────────────────────────────────────────────────────
// Writes the real template text to the clipboard and exposes a short-lived
// `copied` flag for button feedback. Falls back to toasting on error.

export function useCopyTemplate(templateId: string, content: string) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    const isHtml = /<[^>]+>/.test(content);
    const isImage = isImageUrl(content);

    const text = isImage
      ? content
      : isHtml
        ? content
            .replace(/<[^>]+>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/\s+/g, " ")
            .trim()
        : content;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(isImage ? "Link copiado!" : "Template copiado!");
      setTimeout(() => setCopied(false), 1800);
      void incrementCopyCount(templateId);
    } catch (err) {
      console.error("Copy failed", err);
      toast.error("Não foi possível copiar");
    }
  }, [content, templateId]);

  return { copied, copy };
}
