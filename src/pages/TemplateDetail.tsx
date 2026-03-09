import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTemplate, useCategories, incrementCopyCount } from "@/lib/hooks";
import { Navbar } from "@/components/Navbar";
import { TypeBadge } from "@/components/TypeBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Copy, Calendar, Tag, Download, Pencil } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const MARKET_TYPES = ["Infoproduto", "SaaS", "Serviços", "E-commerce/Varejo"];

function stripHtmlToText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
}

const isImageUrl = (str: string) => /^https?:\/\/.+\.(png|jpg|jpeg|webp|gif)/i.test(str) || str.includes("supabase") && str.includes("submission-images");

const TemplateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: template, isLoading } = useTemplate(id!);

  const { data: categories } = useCategories();
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ brand: "", market_type: "", template_type: "", category_id: "", tags: "" });

  const isHtml = template?.content ? /<[^>]+>/.test(template.content) : false;
  const isImage = template?.content ? isImageUrl(template.content) : false;
  const isEmail = template?.template_type === "email";

  const openEdit = () => {
    if (!template) return;
    setEditForm({
      brand: template.brand || "",
      market_type: template.market_type || "",
      template_type: template.template_type,
      category_id: template.category_id || "",
      tags: template.tags?.join(", ") || "",
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!template) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("templates")
        .update({
          brand: editForm.brand || null,
          market_type: editForm.market_type || null,
          template_type: editForm.template_type as any,
          category_id: editForm.category_id || null,
          tags: editForm.tags ? editForm.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
          updated_at: new Date().toISOString(),
        })
        .eq("id", template.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["template", id] });
      await queryClient.refetchQueries({ queryKey: ["template", id] });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template corrigido com sucesso!");
      setEditOpen(false);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      toast.error("Erro ao salvar correção.");
    } finally {
      setSaving(false);
    }
  };

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
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <Button variant="outline" size="sm" onClick={openEdit}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" /> Corrigir informações
          </Button>
        </div>

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

            {isEmail && (
              <h1 className="font-display text-2xl md:text-3xl font-bold text-card-foreground">{template.title}</h1>
            )}

            {/* Content display */}
            {isImage ? (
              <div className="rounded-xl border bg-muted overflow-hidden">
                <img src={template.content} alt={template.brand || "Template"} className="w-full object-contain max-h-[80vh]" />
              </div>
            ) : isHtml ? (
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
              {isImage ? (
                <Button size="lg" variant="hero" asChild>
                  <a href={template.content} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" /> Ver imagem original
                  </a>
                </Button>
              ) : (
                <>
                  <Button size="lg" variant="hero" onClick={handleCopyText}>
                    <Copy className="h-4 w-4 mr-2" /> Copiar Texto
                  </Button>
                  <Button size="lg" variant="outline" onClick={handleDownloadHtml}>
                    <Download className="h-4 w-4 mr-2" /> Baixar HTML
                  </Button>
                </>
              )}
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

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Corrigir informações</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Enviador / Marca</Label>
              <Input
                value={editForm.brand}
                onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                placeholder="Ex: Nubank, iFood, Hotmart"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Mercado</Label>
              <Select value={editForm.market_type} onValueChange={(v) => setEditForm({ ...editForm, market_type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {MARKET_TYPES.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Mensagem</Label>
              <Select value={editForm.template_type} onValueChange={(v) => setEditForm({ ...editForm, template_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                  <SelectItem value="sms">📱 SMS</SelectItem>
                  <SelectItem value="push">🔔 Push</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={editForm.category_id} onValueChange={(v) => setEditForm({ ...editForm, category_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria..." />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.icon ? `${c.icon} ` : ""}{c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                placeholder="Ex: promoção, newsletter, onboarding"
              />
              <p className="text-xs text-muted-foreground">Separe as tags por vírgula</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Salvando..." : "Salvar correção"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateDetail;
