import { useParams, useNavigate } from "react-router-dom";
import { useTemplate, incrementCopyCount } from "@/lib/hooks";
import { Navbar } from "@/components/Navbar";
import { TypeBadge } from "@/components/TypeBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Calendar, Tag, Download } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

function stripHtmlToText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
}

const TemplateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: template, isLoading } = useTemplate(id!);

  const isHtml = template?.content ? /<[^>]+>/.test(template.content) : false;

  const handleCopyText = async () => {
    if (!template) return;
    const text = isHtml ? stripHtmlToText(template.content) : template.content;
    await navigator.clipboard.writeText(text);
    await incrementCopyCount(template.id);
    toast.success("Texto copiado!");
  };

  const handleDownloadHtml = () => {
    if (!template) return;
    const html = isHtml
      ? template.content
      : `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${template.title}</title></head><body><pre style="white-space:pre-wrap;font-family:sans-serif;">${template.content}</pre></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.title.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("HTML baixado!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <div className="h-96 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Template não encontrado.</p>
        </div>
      </div>
    );
  }

  const cat = template.categories as { name: string; icon: string | null } | null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-5xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border shadow-card overflow-hidden"
        >
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <TypeBadge type={template.template_type} />
              {cat && (
                <span className="text-sm text-muted-foreground">
                  {cat.icon} {cat.name}
                </span>
              )}
              {template.brand && (
                <span className="text-sm font-medium text-primary">{template.brand}</span>
              )}
              {template.market_type && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{template.market_type}</span>
              )}
              {template.tone && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                  {template.tone}
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold text-card-foreground">{template.title}</h1>

            {/* Email visual */}
            {isHtml ? (
              <div className="rounded-xl border bg-background overflow-hidden">
                <iframe
                  title="Visual do template"
                  sandbox="allow-popups allow-popups-to-escape-sandbox"
                  srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;padding:0;width:100%;}img{max-width:100%;height:auto;}table{max-width:100%!important;}*{box-sizing:border-box;}</style></head><body>${template.content}</body></html>`}
                  className="w-full border-0"
                  style={{ minHeight: "700px" }}
                />
              </div>
            ) : (
              <div className="bg-muted/50 rounded-xl p-6 border">
                <pre className="whitespace-pre-wrap font-body text-sm text-foreground leading-relaxed">
                  {template.content}
                </pre>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button size="lg" variant="hero" onClick={handleCopyText}>
                <Copy className="h-4 w-4 mr-2" /> Copiar Texto
              </Button>
              <Button size="lg" variant="outline" onClick={handleDownloadHtml}>
                <Download className="h-4 w-4 mr-2" /> Baixar HTML
              </Button>
            </div>

            {template.variables && template.variables.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-display font-semibold text-foreground">Variáveis</h3>
                <div className="flex flex-wrap gap-2">
                  {template.variables.map((v) => (
                    <code key={v} className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-md font-mono">
                      {v}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {template.tags && template.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {template.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
              <span className="flex items-center gap-1">
                <Copy className="h-3.5 w-3.5" /> {template.copies_count} cópias
              </span>
              {template.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {new Date(template.published_at).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TemplateDetail;
