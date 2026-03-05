import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { TypeBadge } from "@/components/TypeBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCategories } from "@/lib/hooks";
import { toast } from "sonner";
import { ArrowLeft, Check, X, Save } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type TemplateType = Database["public"]["Enums"]["template_type"];
type ToneType = Database["public"]["Enums"]["tone_type"];

const AdminReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();

  const { data: submission, isLoading } = useQuery({
    queryKey: ["submission", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const [form, setForm] = useState({
    title: "",
    template_type: "email" as TemplateType,
    content: "",
    category_id: "",
    tags: "",
    tone: "" as ToneType | "",
    persona: "",
    variables: "",
    notes: "",
    brand: "",
    market_type: "",
  });

  const [checklist, setChecklist] = useState({
    noSensitiveData: false,
    noOffensiveLanguage: false,
    hasCTA: false,
    adequateSize: false,
  });

  useEffect(() => {
    if (submission) {
      setForm({
        title: submission.title || submission.raw_subject || "",
        template_type: submission.template_type,
        content: submission.parsed_body || submission.raw_body || "",
        category_id: "",
        tags: submission.suggested_tags?.join(", ") || "",
        tone: "",
        persona: "",
        variables: "",
        notes: submission.notes || "",
        brand: submission.brand || "",
        market_type: submission.market_type || "",
      });
    }
  }, [submission]);

  const handleApprove = async () => {
    if (!form.title || !form.content) {
      toast.error("Título e conteúdo são obrigatórios.");
      return;
    }

    const { error: templateError } = await supabase.from("templates").insert({
      title: form.title,
      template_type: form.template_type,
      content: form.content,
      category_id: form.category_id || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      tone: (form.tone as ToneType) || null,
      persona: form.persona || null,
      variables: form.variables ? form.variables.split(",").map((v) => v.trim()).filter(Boolean) : [],
      submission_id: id,
      status: "published",
      published_at: new Date().toISOString(),
      brand: form.brand || null,
      market_type: form.market_type || null,
    });

    if (templateError) {
      toast.error("Erro ao criar template.");
      return;
    }

    await supabase.from("submissions").update({ status: "approved", notes: form.notes }).eq("id", id!);
    
    queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
    queryClient.invalidateQueries({ queryKey: ["templates"] });
    toast.success("Template aprovado e publicado!");
    navigate("/admin");
  };

  const handleReject = async () => {
    await supabase.from("submissions").update({ status: "rejected", notes: form.notes }).eq("id", id!);
    queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
    toast.success("Submissão reprovada.");
    navigate("/admin");
  };

  const handleSaveDraft = async () => {
    await supabase.from("submissions").update({ status: "in_review", notes: form.notes }).eq("id", id!);
    queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
    toast.success("Salvo como rascunho.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8"><div className="h-96 bg-muted animate-pulse rounded-xl" /></div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Submissão não encontrada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-6xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/admin")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao Inbox
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="bg-card rounded-2xl border shadow-card p-6 space-y-5">
            <h2 className="font-display text-xl font-bold text-card-foreground">Editar & Categorizar</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Comunicação</Label>
                <Select value={form.template_type} onValueChange={(v: any) => setForm({ ...form, template_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca / Enviador</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Ex: Nubank, iFood" />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Mercado</Label>
                <Input value={form.market_type} onChange={(e) => setForm({ ...form, market_type: e.target.value })} placeholder="Ex: Fintech, E-commerce, SaaS" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tag1, tag2" />
              </div>
              <div className="space-y-2">
                <Label>Tom de voz</Label>
                <Select value={form.tone} onValueChange={(v: any) => setForm({ ...form, tone: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="direct">Direto</SelectItem>
                    <SelectItem value="friendly">Amigável</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Persona</Label>
                <Select value={form.persona} onValueChange={(v) => setForm({ ...form, persona: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="b2b">B2B</SelectItem>
                    <SelectItem value="b2c">B2C</SelectItem>
                    <SelectItem value="both">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Variáveis</Label>
                <Input value={form.variables} onChange={(e) => setForm({ ...form, variables: e.target.value })} placeholder="{nome}, {pedido}" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações internas</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
            </div>
          </div>

          {/* Preview + Checklist + Actions */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border shadow-card p-6 space-y-4">
              <h2 className="font-display text-xl font-bold text-card-foreground">Preview</h2>
              <div className="flex gap-2 flex-wrap items-center">
                <TypeBadge type={form.template_type} />
                {form.brand && <span className="text-sm font-medium text-primary">{form.brand}</span>}
                {form.market_type && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{form.market_type}</span>}
              </div>
              <h3 className="font-display font-semibold text-lg text-card-foreground">{form.title || "Sem título"}</h3>
              <div className="bg-muted/50 rounded-xl p-4 border">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-body leading-relaxed">
                  {form.content || "Sem conteúdo"}
                </pre>
              </div>
              {submission.raw_from && (
                <p className="text-xs text-muted-foreground">De: {submission.raw_from}</p>
              )}
            </div>

            <div className="bg-card rounded-2xl border shadow-card p-6 space-y-3">
              <h3 className="font-display font-semibold text-card-foreground">Checklist de Qualidade</h3>
              {[
                { key: "noSensitiveData" as const, label: "Sem dados sensíveis" },
                { key: "noOffensiveLanguage" as const, label: "Sem linguagem ofensiva" },
                { key: "hasCTA" as const, label: "CTA claro (quando aplicável)" },
                { key: "adequateSize" as const, label: "Tamanho adequado" },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <Checkbox
                    checked={checklist[item.key]}
                    onCheckedChange={(v) => setChecklist({ ...checklist, [item.key]: !!v })}
                  />
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="hero" size="lg" onClick={handleApprove}>
                <Check className="h-4 w-4 mr-2" /> Aprovar e Publicar
              </Button>
              <Button variant="outline" onClick={handleSaveDraft}>
                <Save className="h-4 w-4 mr-2" /> Salvar como Rascunho
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                <X className="h-4 w-4 mr-2" /> Reprovar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReview;
