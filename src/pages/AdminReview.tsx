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

function extractBrandFromSender(rawFrom: string | null): string {
  if (!rawFrom) return "";
  const nameMatch = rawFrom.match(/^"?([^"<]+)"?\s*</);
  if (nameMatch) return nameMatch[1].trim();
  const emailMatch = rawFrom.match(/([^@]+)@/);
  return emailMatch ? emailMatch[1].trim() : rawFrom;
}

interface CategoryOption { id: string; name: string; slug: string; icon: string | null }

function guessCategoryFromContent(content: string, subject: string, categories: CategoryOption[]): string {
  if (!categories?.length) return "";
  const lower = (content + " " + subject).toLowerCase();
  for (const cat of categories) {
    const keywords = cat.slug.split("-");
    if (keywords.some((kw) => kw.length > 2 && lower.includes(kw))) return cat.id;
    if (lower.includes(cat.name.toLowerCase())) return cat.id;
  }
  return "";
}

function guessFieldsFromContent(content: string, subject: string) {
  const lower = (content + " " + subject).toLowerCase();

  let tone: ToneType | "" = "";
  if (/urgente|última chance|corra|não perca|expira/i.test(lower)) tone = "urgent";
  else if (/prezado|senhor|formal|cordialmente/i.test(lower)) tone = "formal";
  else if (/hey|oi|fala|beleza|e aí/i.test(lower)) tone = "casual";
  else if (/amigo|querido|carinho|abraço/i.test(lower)) tone = "friendly";
  else tone = "direct";

  let persona = "";
  if (/empresa|negócio|b2b|corporat|parceiro|cnpj/i.test(lower)) persona = "b2b";
  else if (/você|cliente|compra|pedido|oferta|desconto|cupom/i.test(lower)) persona = "b2c";

  const tagSet = new Set<string>();
  if (/promoção|desconto|oferta|cupom|% off/i.test(lower)) tagSet.add("promoção");
  if (/boas-vindas|bem-vindo|welcome|onboarding/i.test(lower)) tagSet.add("onboarding");
  if (/newsletter|novidades|atualização/i.test(lower)) tagSet.add("newsletter");
  if (/abandono|carrinho|cart/i.test(lower)) tagSet.add("carrinho abandonado");
  if (/transacional|confirmação|pedido|entrega|tracking/i.test(lower)) tagSet.add("transacional");
  if (/reengaj|reativação|sentimos sua falta|volte/i.test(lower)) tagSet.add("reengajamento");
  if (/nps|pesquisa|feedback|avaliação/i.test(lower)) tagSet.add("feedback");

  const variables: string[] = [];
  const varMatches = content.match(/\{[^}]+\}/g);
  if (varMatches) varMatches.forEach((v) => variables.push(v));
  if (/\[nome\]|\[name\]/i.test(content)) variables.push("{nome}");

  let marketType = "";
  if (/fintech|banco|cartão|crédito|investimento/i.test(lower)) marketType = "Fintech";
  else if (/e-commerce|loja|compra|produto|frete/i.test(lower)) marketType = "E-commerce";
  else if (/saas|software|plataforma|assinatura|trial/i.test(lower)) marketType = "SaaS";
  else if (/educação|curso|aula|professor|mentoria|conteúdo/i.test(lower)) marketType = "Educação";
  else if (/saúde|médico|clínica|consulta/i.test(lower)) marketType = "Saúde";
  else if (/food|comida|restaurante|delivery/i.test(lower)) marketType = "Food & Delivery";
  else if (/marketing|digital|social|instagram|tráfego|copy/i.test(lower)) marketType = "Marketing Digital";

  return { tone, persona, tags: Array.from(tagSet).join(", "), variables: variables.join(", "), marketType };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

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
      const brand = extractBrandFromSender(submission.raw_from) || submission.brand || "";
      const rawText = submission.raw_body || "";
      const htmlContent = submission.parsed_body || "";
      const textContent = rawText || stripHtml(htmlContent);
      const subject = submission.raw_subject || "";
      const guessed = guessFieldsFromContent(textContent, subject);
      const guessedCategory = guessCategoryFromContent(textContent, subject, (categories || []) as CategoryOption[]);

      setForm({
        title: submission.title || submission.raw_subject || "",
        template_type: submission.template_type,
        content: textContent,
        category_id: guessedCategory,
        tags: submission.suggested_tags?.join(", ") || guessed.tags,
        tone: guessed.tone,
        persona: guessed.persona,
        variables: guessed.variables,
        notes: submission.notes || "",
        brand: brand,
        market_type: submission.market_type || guessed.marketType,
      });
    }
  }, [submission, categories]);

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

  const emailHtml = submission.parsed_body || "";
  const hasEmailHtml = /<[^>]+>/.test(emailHtml);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="px-4 py-8 w-full max-w-full">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/admin")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao Inbox
        </Button>

        {/* Email Original - Full Width */}
        <div className="bg-card rounded-2xl border shadow-card p-6 space-y-4 mb-6">
          <h2 className="font-display text-xl font-bold text-card-foreground">Email Original</h2>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p><span className="text-foreground font-medium">Assunto:</span> {submission.raw_subject || "Sem assunto"}</p>
            <p><span className="text-foreground font-medium">De:</span> {submission.raw_from || "Não informado"}</p>
          </div>

          {hasEmailHtml ? (
            <div className="rounded-xl border bg-background overflow-hidden">
              <iframe
                title="Visual do email original"
                sandbox="allow-popups allow-popups-to-escape-sandbox"
                srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;padding:0;width:100%;}img{max-width:100%;height:auto;}table{max-width:100%!important;}*{box-sizing:border-box;}</style></head><body>${emailHtml}</body></html>`}
                className="w-full border-0"
                style={{ minHeight: "800px" }}
              />
            </div>
          ) : (
            <div className="bg-muted/50 rounded-xl p-6 border">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-body leading-relaxed">
                {submission.raw_body || "Sem conteúdo original"}
              </pre>
            </div>
          )}
        </div>

        {/* Editor & Actions - 2 columns */}
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
              <Label>Conteúdo (texto do email)</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca / Enviador</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Ex: Nubank, iFood" />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Mercado</Label>
                <Input value={form.market_type} onChange={(e) => setForm({ ...form, market_type: e.target.value })} placeholder="Ex: Fintech, SaaS" />
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
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
          </div>

          {/* Right: Checklist + Actions */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border shadow-card p-6 space-y-4">
              <h2 className="font-display text-xl font-bold text-card-foreground">Preview do Template</h2>
              <div className="flex gap-2 flex-wrap items-center">
                <TypeBadge type={form.template_type} />
                {form.brand && <span className="text-sm font-medium text-primary">{form.brand}</span>}
                {form.market_type && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{form.market_type}</span>}
              </div>
              <h3 className="font-display font-semibold text-lg text-card-foreground">{form.title || "Sem título"}</h3>
              <div className="bg-muted/50 rounded-xl p-4 border max-h-60 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-body leading-relaxed">
                  {form.content || "Sem conteúdo"}
                </pre>
              </div>
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
