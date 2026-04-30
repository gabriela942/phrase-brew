import { useState, useEffect } from "react";
import { Heart, Copy as CopyIcon, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TypeBadge } from "@/components/TypeBadge";
import { cn } from "@/lib/utils";
import { incrementCopyCount } from "@/lib/hooks";
import { isLocalLike, toggleLocalLike } from "@/lib/likes";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TemplatePreviewData {
  id: string;
  title: string;
  content: string;
  template_type: "email" | "whatsapp" | "sms" | "push";
  copies_count: number;
  tags?: string[] | null;
  brand?: string | null;
  categories?: { name: string; icon: string | null } | null;
  published_at?: string | null;
}

interface TemplatePreviewModalProps {
  template: TemplatePreviewData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isImageUrl = (str: string) =>
  /^https?:\/\/.+\.(png|jpg|jpeg|webp|gif)/i.test(str) ||
  (str.includes("supabase") && str.includes("submission-images"));

const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("pt-BR", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

// ─── Component ────────────────────────────────────────────────────────────────

export function TemplatePreviewModal({
  template,
  open,
  onOpenChange,
}: TemplatePreviewModalProps) {
  const {
    id,
    title,
    content,
    template_type,
    copies_count,
    tags,
    brand,
    categories,
    published_at,
  } = template;

  const [liked, setLiked] = useState(false);

  // Sync local-like state whenever we open (in case another card toggled it)
  useEffect(() => {
    if (open) setLiked(isLocalLike(id));
  }, [open, id]);

  const isHtml = /<[^>]+>/.test(content);
  const isImage = isImageUrl(content);
  const formattedDate = formatDate(published_at);

  const handleCopy = async () => {
    if (isImage) {
      await navigator.clipboard.writeText(content);
      toast.success("Link copiado!");
    } else {
      const text = isHtml
        ? content
            .replace(/<[^>]+>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/\s+/g, " ")
            .trim()
        : content;
      await navigator.clipboard.writeText(text);
      toast.success("Template copiado!");
    }
    await incrementCopyCount(id);
  };

  const handleLike = () => setLiked(toggleLocalLike(id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* ── Scrollable content ── */}
        <div className="overflow-y-auto">

          {/* Preview hero */}
          <div className="relative w-full bg-muted/20 border-b border-border/40 flex items-center justify-center overflow-hidden">
            {isImage ? (
              <img
                src={content}
                alt={brand || title}
                className="w-full h-auto max-h-[420px] object-contain"
              />
            ) : isHtml ? (
              <iframe
                title={title}
                sandbox=""
                srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:16px;width:100%;background:white;font-family:system-ui,sans-serif;}img{max-width:100%;height:auto;}table{max-width:100%!important;}*{box-sizing:border-box;}</style></head><body>${content}</body></html>`}
                className="w-full border-0 bg-white"
                style={{ height: 420 }}
              />
            ) : (
              <div className="p-8 w-full min-h-[220px] flex items-center">
                <p className="text-[14px] text-foreground/80 leading-relaxed whitespace-pre-wrap font-body">
                  {content}
                </p>
              </div>
            )}
          </div>

          {/* Metadata + title */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <TypeBadge type={template_type} />
              {brand && (
                <span className="text-[12px] px-2.5 py-1 rounded-full bg-muted text-foreground/75 font-medium">
                  {brand}
                </span>
              )}
              {categories && (
                <span className="text-[12px] px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground font-medium">
                  {categories.icon ? `${categories.icon} ` : ""}
                  {categories.name}
                </span>
              )}
              {tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-primary/8 text-primary font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <DialogTitle className="font-display text-xl font-bold text-foreground leading-tight">
              {title}
            </DialogTitle>

            {formattedDate && (
              <DialogDescription className="flex items-center gap-1.5 text-[12px] text-muted-foreground/70 m-0">
                <Calendar className="h-3.5 w-3.5" />
                Publicado em {formattedDate}
              </DialogDescription>
            )}
          </div>

          {/* Raw content for non-visual templates */}
          {!isImage && !isHtml && (
            <div className="px-6 pb-6">
              <div className="rounded-xl bg-muted/25 border border-border/40 p-4 text-[13px] text-foreground/80 leading-relaxed whitespace-pre-wrap font-body">
                {content}
              </div>
            </div>
          )}
        </div>

        {/* ── Sticky action footer ── */}
        <div className="border-t border-border/40 bg-card p-4 flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={handleLike}
            aria-pressed={liked}
            className={cn(
              "gap-1.5",
              liked && "text-rose-500 border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 hover:text-rose-500"
            )}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            {liked ? "Curtido" : "Curtir"}
          </Button>

          <Button
            onClick={handleCopy}
            className="flex-1 bg-gradient-hero hover:opacity-95 gap-2 font-semibold"
          >
            <CopyIcon className="h-4 w-4" />
            Copiar template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
