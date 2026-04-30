import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Copy as CopyIcon, Check, Info, ArrowLeft, ArrowRight } from "lucide-react";
import { TypeBadge } from "@/components/TypeBadge";
import { useOptimisticLike } from "@/hooks/useOptimisticLike";
import { useCopyTemplate } from "@/hooks/useCopyTemplate";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TemplateCardProps {
  id: string;
  title: string;
  content: string;
  template_type: "email" | "whatsapp" | "sms" | "push";
  copies_count: number;
  tags?: string[] | null;
  brand?: string | null;
  market_type?: string | null;
  segment?: string | null;
  categories?: { name: string; icon: string | null } | null;
  published_at?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isImageUrl = (str: string) =>
  /^https?:\/\/.+\.(png|jpg|jpeg|webp|gif)/i.test(str) ||
  (str.includes("supabase") && str.includes("submission-images"));

const CARD_HEIGHT = 380;
const PREVIEW_H = 180;

const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("pt-BR", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

function summarize(content: string, max = 140): string {
  const stripped = content
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped.length <= max) return stripped;
  return stripped.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

// ─── Shared action buttons ────────────────────────────────────────────────────

function LikeButton({
  liked,
  count,
  onLike,
  size = "sm",
}: {
  liked: boolean;
  count: number;
  onLike: (e: React.MouseEvent) => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      onClick={onLike}
      aria-label={liked ? "Descurtir template" : "Curtir template"}
      aria-pressed={liked}
      title={liked ? "Descurtir" : "Curtir"}
      className={cn(
        "flex items-center gap-1 rounded-lg font-medium transition-colors",
        size === "sm" ? "h-7 px-1.5 text-[12px]" : "h-8 px-2 text-[13px]",
        liked
          ? "text-rose-500"
          : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5"
      )}
    >
      <Heart
        className={cn(
          "transition-transform",
          size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
          liked && "fill-current scale-110"
        )}
      />
      <span className="tabular-nums">{count}</span>
    </button>
  );
}

function CopyButton({
  copied,
  onCopy,
  label = "Copiar",
  size = "sm",
}: {
  copied: boolean;
  onCopy: (e: React.MouseEvent) => void;
  label?: string;
  size?: "sm" | "md";
}) {
  return (
    <button
      onClick={onCopy}
      aria-label="Copiar template"
      title="Copiar template"
      className={cn(
        "flex items-center gap-1 rounded-lg font-medium transition-colors",
        size === "sm" ? "h-7 px-1.5 text-[12px]" : "h-8 px-2.5 text-[13px]",
        copied
          ? "text-emerald-600 bg-emerald-500/10"
          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
      )}
    >
      {copied ? (
        <>
          <Check className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
          <span className={size === "sm" ? "hidden md:inline" : ""}>
            Copiado!
          </span>
        </>
      ) : (
        <>
          <CopyIcon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
          <span className={size === "sm" ? "hidden md:inline" : ""}>
            {label}
          </span>
        </>
      )}
    </button>
  );
}

// ─── Front face ───────────────────────────────────────────────────────────────

function CardFront({
  title,
  content,
  template_type,
  brand,
  categories,
  formattedDate,
  liked,
  likesCount,
  copied,
  onLike,
  onCopy,
  onFlip,
}: {
  title: string;
  content: string;
  template_type: TemplateCardProps["template_type"];
  brand?: string | null;
  categories?: TemplateCardProps["categories"];
  formattedDate: string | null;
  liked: boolean;
  likesCount: number;
  copied: boolean;
  onLike: (e: React.MouseEvent) => void;
  onCopy: (e: React.MouseEvent) => void;
  onFlip: (e: React.MouseEvent) => void;
}) {
  const isHtml = /<[^>]+>/.test(content);
  const isImage = isImageUrl(content);

  return (
    <div className="w-full h-full bg-card rounded-[20px] border border-border/60 shadow-card overflow-hidden flex flex-col">
      {/* Preview — clean, no badge overlay */}
      <div
        className="relative w-full overflow-hidden flex-shrink-0 bg-muted/10"
        style={{ height: PREVIEW_H }}
      >
        {isImage ? (
          <img
            src={content}
            alt={brand || title}
            className="w-full h-full object-cover"
          />
        ) : isHtml ? (
          <div className="w-full h-full bg-white">
            <iframe
              title={title}
              sandbox=""
              srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0;width:100%;pointer-events:none;overflow:hidden;}img{max-width:100%;height:auto;}table{max-width:100%!important;}*{box-sizing:border-box;}</style></head><body>${content}</body></html>`}
              className="border-0 pointer-events-none"
              style={{
                width: "200%",
                height: "200%",
                transform: "scale(0.5)",
                transformOrigin: "top left",
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted/40 to-muted/20 p-5">
            <p className="text-sm text-muted-foreground leading-relaxed font-body">
              {content}
            </p>
          </div>
        )}

        {/* Mobile-only flip toggle (desktop uses hover) */}
        <button
          onClick={onFlip}
          aria-label="Ver detalhes do template"
          title="Ver detalhes"
          className="md:hidden absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2.5 p-4 flex-1 min-h-0">
        {/* Meta row: channel + brand + category */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <TypeBadge type={template_type} />
          {brand && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted/70 text-muted-foreground font-medium truncate max-w-[130px]">
              {brand}
            </span>
          )}
          {categories && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground/80 font-medium truncate max-w-[110px]">
              {categories.name}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="font-display font-semibold text-card-foreground text-[14px] leading-snug line-clamp-2"
          title={title}
        >
          {title}
        </h3>

        {/* Actions row */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-2.5 border-t border-border/40">
          <span className="text-[11px] text-muted-foreground/70 tabular-nums">
            {formattedDate ?? " "}
          </span>
          <div className="flex items-center gap-0.5">
            <LikeButton liked={liked} count={likesCount} onLike={onLike} />
            <CopyButton copied={copied} onCopy={onCopy} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Back face ────────────────────────────────────────────────────────────────

function CardBack({
  id,
  title,
  content,
  template_type,
  brand,
  market_type,
  categories,
  tags,
  formattedDate,
  liked,
  likesCount,
  copied,
  onLike,
  onCopy,
  onFlip,
}: {
  id: string;
  title: string;
  content: string;
  template_type: TemplateCardProps["template_type"];
  brand?: string | null;
  market_type?: string | null;
  categories?: TemplateCardProps["categories"];
  tags?: string[] | null;
  formattedDate: string | null;
  liked: boolean;
  likesCount: number;
  copied: boolean;
  onLike: (e: React.MouseEvent) => void;
  onCopy: (e: React.MouseEvent) => void;
  onFlip: (e: React.MouseEvent) => void;
}) {
  const summary = summarize(content, 180);
  const channelLabel = { email: "Email", whatsapp: "WhatsApp", sms: "SMS", push: "Push" }[template_type];

  return (
    <div className="w-full h-full bg-card rounded-[20px] border border-border/60 shadow-card overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/40 bg-muted/25 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <TypeBadge type={template_type} />
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70 truncate">
            Resumo técnico
          </span>
        </div>

        {/* Mobile-only flip back button */}
        <button
          onClick={onFlip}
          aria-label="Voltar para a frente"
          title="Voltar"
          className="md:hidden w-7 h-7 rounded-full bg-card border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Title */}
        <h3
          className="font-display font-semibold text-card-foreground text-[14px] leading-snug line-clamp-2"
          title={title}
        >
          {title}
        </h3>

        {/* Summary */}
        {summary && (
          <p className="text-[12.5px] text-muted-foreground leading-relaxed line-clamp-3">
            {summary}
          </p>
        )}

        {/* Metadata list */}
        <dl className="text-[12px] space-y-1 pt-1">
          <MetaRow label="Canal" value={channelLabel} />
          {brand && <MetaRow label="Marca" value={brand} />}
          {categories && (
            <MetaRow
              label="Categoria"
              value={`${categories.icon ? categories.icon + " " : ""}${categories.name}`}
            />
          )}
          {market_type && <MetaRow label="Mercado" value={market_type} />}
          {formattedDate && <MetaRow label="Publicado" value={formattedDate} />}
        </dl>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="text-[10.5px] px-2 py-0.5 rounded-full bg-primary/8 text-primary font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* "Ver mais detalhes" — navigates to the template page */}
      <div className="px-4 py-2.5 border-t border-border/40 bg-card shrink-0">
        <Link
          to={`/template/${id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-1.5 w-full h-9 rounded-lg border border-primary/25 bg-primary/5 text-primary text-[12.5px] font-semibold hover:bg-primary/10 hover:border-primary/40 transition-colors group/details"
        >
          Ver mais detalhes
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/details:translate-x-0.5" />
        </Link>
      </div>

      {/* Sticky actions */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-border/40 bg-card shrink-0">
        <LikeButton liked={liked} count={likesCount} onLike={onLike} size="md" />
        <CopyButton copied={copied} onCopy={onCopy} label="Copiar template" size="md" />
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <dt className="text-muted-foreground/60 font-medium w-20 shrink-0">{label}</dt>
      <dd className="text-foreground/80 font-medium truncate">{value}</dd>
    </div>
  );
}

// ─── TemplateCard (flip container) ────────────────────────────────────────────

export function TemplateCard(props: TemplateCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const { liked, count, toggleLike } = useOptimisticLike(props.id, props.copies_count);
  const { copied, copy } = useCopyTemplate(props.id, props.content);

  const formattedDate = formatDate(props.published_at);

  const onLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike();
  };
  const onCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    void copy();
  };
  const onFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped((v) => !v);
  };

  return (
    <div
      className="group relative [perspective:1200px]"
      style={{ height: CARD_HEIGHT }}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-500 ease-out [transform-style:preserve-3d]",
          "group-hover:[transform:rotateY(180deg)]",
          isFlipped && "[transform:rotateY(180deg)]"
        )}
      >
        {/* Front */}
        <div className="absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
          <CardFront
            title={props.title}
            content={props.content}
            template_type={props.template_type}
            brand={props.brand}
            categories={props.categories}
            formattedDate={formattedDate}
            liked={liked}
            likesCount={count}
            copied={copied}
            onLike={onLike}
            onCopy={onCopy}
            onFlip={onFlip}
          />
        </div>

        {/* Back */}
        <div className="absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]">
          <CardBack
            id={props.id}
            title={props.title}
            content={props.content}
            template_type={props.template_type}
            brand={props.brand}
            market_type={props.market_type}
            categories={props.categories}
            tags={props.tags}
            formattedDate={formattedDate}
            liked={liked}
            likesCount={count}
            copied={copied}
            onLike={onLike}
            onCopy={onCopy}
            onFlip={onFlip}
          />
        </div>
      </div>
    </div>
  );
}
