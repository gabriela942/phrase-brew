import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/lib/hooks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

const SubmitTemplate = () => {
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    template_type: "email" as "email" | "whatsapp" | "sms",
    content: "",
    suggested_category: "",
    suggested_tags: "",
    segment: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Preencha título e conteúdo.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("submissions").insert({
      source: "form",
      title: form.title.trim(),
      template_type: form.template_type,
      parsed_body: form.content.trim(),
      raw_body: form.content.trim(),
      suggested_category: form.suggested_category || null,
      suggested_tags: form.suggested_tags ? form.suggested_tags.split(",").map((t) => t.trim()).filter(Boolean) : null,
      segment: form.segment || null,
      status: "new",
    });
    setLoading(false);
    if (error) {
      toast.error("Erro ao enviar. Tente novamente.");
      return;
    }
    toast.success("Modelo enviado com sucesso! Será revisado em breve.");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Enviar Modelo</h1>
            <p className="text-muted-foreground mt-1">Contribua com um template para a comunidade.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border shadow-card p-6 md:p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={form.template_type} onValueChange={(v: any) => setForm({ ...form, template_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">📧 Email</SelectItem>
                    <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                    <SelectItem value="sms">📱 SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoria sugerida</Label>
                <Select value={form.suggested_category} onValueChange={(v) => setForm({ ...form, suggested_category: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.icon} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Título do modelo *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Email de boas-vindas para novo cliente"
              />
            </div>

            <div className="space-y-2">
              <Label>Conteúdo *</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Cole o conteúdo do template aqui..."
                rows={10}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tags (separadas por vírgula)</Label>
                <Input
                  value={form.suggested_tags}
                  onChange={(e) => setForm({ ...form, suggested_tags: e.target.value })}
                  placeholder="cobrança, pagamento, lembrete"
                />
              </div>
              <div className="space-y-2">
                <Label>Segmento</Label>
                <Input
                  value={form.segment}
                  onChange={(e) => setForm({ ...form, segment: e.target.value })}
                  placeholder="Ex: e-commerce, SaaS"
                />
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" disabled={loading} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Enviando..." : "Enviar Modelo"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SubmitTemplate;
