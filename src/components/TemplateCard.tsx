import { Copy, Heart } from "lucide-react";
import { TypeBadge } from "@/components/TypeBadge";
import { incrementCopyCount } from "@/lib/hooks";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface TemplateCardProps {
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

const isImageUrl = (str: string) => /^https?:\/\/.+\.(png|jpg|jpeg|webp|gif)/i.test(str) || str.includes("supabase") && str.includes("submission-images");

export function TemplateCard({ id, title, content, template_type, copies_count, tags, brand, categories, published_at }: TemplateCardProps) {
  const navigate = useNavigate();
  const isHtml = /<[^>]+>/.test(content);
  const isImage = isImageUrl(content);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isImage) {
      await navigator.clipboard.writeText(content);
      toast.success("Link copiado!");
    } else {
      const text = isHtml ? content.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim() : content;
      await navigator.clipboard.writeText(text);
      toast.success("Copiado!");
    }
    await incrementCopyCount(id);
  };

  const formattedDate = published_at
    ? new Date(published_at).toLocaleDateString("pt-BR", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className="group relative bg-card rounded-2xl border border-border/60 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer overflow-hidden flex flex-col gradient-border"
      onClick={() => navigate(`/template/${id}`)}
    >
      {/* Preview area */}
      {isImage ? (
        <div className="relative w-full h-[260px] overflow-hidden bg-muted/30">
          <img
            src={content}
            alt={brand || "Template"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-60" />
        </div>
      ) : isHtml ? (
        <div className="relative w-full h-[260px] overflow-hidden bg-muted/10">
          <iframe
            title={title}
            sandbox=""
            srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;padding:0;width:100%;pointer-events:none;overflow:hidden;}img{max-width:100%;height:auto;}table{max-width:100%!important;}*{box-sizing:border-box;}</style></head><body>${content}</body></html>`}
            className="w-full h-full border-0 pointer-events-none"
            style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", height: "200%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-60" />
        </div>
      ) : (
        <div className="p-5 pb-3 min-h-[100px]">
          <p className="text-sm text-muted-foreground line-clamp-4 font-body leading-relaxed">{content}</p>
        </div>
      )}

      {/* Card footer */}
      <div className="p-4 pt-3 mt-auto space-y-2.5">
        {brand && (
          <h3 className="font-display font-semibold text-card-foreground text-base leading-tight truncate">
            {brand}
          </h3>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <TypeBadge type={template_type} />
            {categories && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted/70 text-muted-foreground font-medium truncate max-w-[120px]">
                {categories.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {formattedDate && (
              <span className="text-[11px] text-muted-foreground/70 hidden sm:inline">{formattedDate}</span>
            )}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors group/heart"
            >
              <Heart className="h-3.5 w-3.5 fill-current transition-transform group-hover/heart:scale-110" />
              {copies_count}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
