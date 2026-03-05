import { Copy, Heart } from "lucide-react";
import { TypeBadge } from "@/components/TypeBadge";
import { incrementCopyCount } from "@/lib/hooks";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useRef } from "react";

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
  const isEmail = template_type === "email";

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-card rounded-xl border shadow-card hover:shadow-card-hover transition-shadow cursor-pointer overflow-hidden flex flex-col"
      onClick={() => navigate(`/template/${id}`)}
    >
      {/* Image preview for whatsapp/sms/push */}
      {isImage ? (
        <div className="relative w-full h-[280px] overflow-hidden border-b bg-muted">
          <img src={content} alt={brand || "Template"} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card/80" />
        </div>
      ) : isHtml ? (
        <div className="relative w-full h-[280px] overflow-hidden border-b bg-background">
          <iframe
            title={title}
            sandbox=""
            srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;padding:0;width:100%;pointer-events:none;overflow:hidden;}img{max-width:100%;height:auto;}table{max-width:100%!important;}*{box-sizing:border-box;}</style></head><body>${content}</body></html>`}
            className="w-full h-full border-0 pointer-events-none"
            style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", height: "200%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card/80" />
        </div>
      ) : (
        <div className="p-5 pb-3">
          <p className="text-sm text-muted-foreground line-clamp-4 font-body">{content}</p>
        </div>
      )}

      {/* Card footer */}
      <div className="p-4 pt-3 mt-auto space-y-2">
        {brand && (
          <h3 className="font-display font-semibold text-card-foreground text-base leading-tight">{brand}</h3>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {formattedDate && (
              <span className="text-xs text-muted-foreground">{formattedDate}</span>
            )}
            {categories && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {categories.name}
              </span>
            )}
            <TypeBadge type={template_type} />
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
          >
            <Heart className="h-3.5 w-3.5 fill-current" /> {copies_count}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
