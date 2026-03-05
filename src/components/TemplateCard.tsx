import { Copy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TypeBadge } from "@/components/TypeBadge";
import { incrementCopyCount } from "@/lib/hooks";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface TemplateCardProps {
  id: string;
  title: string;
  content: string;
  template_type: "email" | "whatsapp" | "sms";
  copies_count: number;
  tags?: string[] | null;
  categories?: { name: string; icon: string | null } | null;
}

export function TemplateCard({ id, title, content, template_type, copies_count, tags, categories }: TemplateCardProps) {
  const navigate = useNavigate();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(content);
    await incrementCopyCount(id);
    toast.success("Copiado!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-card rounded-xl border shadow-card hover:shadow-card-hover transition-shadow cursor-pointer overflow-hidden"
      onClick={() => navigate(`/template/${id}`)}
    >
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <TypeBadge type={template_type} />
          {categories && (
            <span className="text-xs text-muted-foreground">
              {categories.icon} {categories.name}
            </span>
          )}
        </div>
        <h3 className="font-display font-semibold text-card-foreground line-clamp-2 leading-tight">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3 font-body">{content}</p>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Copy className="h-3 w-3" /> {copies_count} cópias
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(`/template/${id}`); }}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="default" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
