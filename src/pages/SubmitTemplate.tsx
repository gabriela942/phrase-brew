import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/lib/hooks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Send, Mail, ArrowLeft, Upload, X, ImageIcon } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type TemplateType = Database["public"]["Enums"]["template_type"];

const SubmitTemplate = () => {
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    template_type: "whatsapp" as TemplateType,
    suggested_category: "",
    suggested_tags: "",
    segment: "",
    brand: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione apenas arquivos de imagem.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 10MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Anexe um print/imagem do modelo.");
      return;
    }
    setLoading(true);

    // Upload image
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("submission-images")
      .upload(fileName, imageFile);

    if (uploadError) {
      toast.error("Erro ao enviar imagem. Tente novamente.");
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("submission-images")
      .getPublicUrl(fileName);

    const { error } = await supabase.from("submissions").insert({
      source: "form",
      template_type: form.template_type,
      raw_body: urlData.publicUrl,
      suggested_category: form.suggested_category || null,
      suggested_tags: form.suggested_tags ? form.suggested_tags.split(",").map((t) => t.trim()).filter(Boolean) : null,
      segment: form.segment || null,
      brand: form.brand.trim() || null,
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
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>

          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Enviar Modelo</h1>
            <p className="text-muted-foreground mt-1">Envie um print de WhatsApp, SMS ou Push para a comunidade. Para emails, encaminhe diretamente para modelscrm@gmail.com.</p>
          </div>

          {/* Quick tip about email */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">📧 Para emails:</strong> Encaminhe diretamente para{" "}
              <code className="text-primary font-mono font-semibold">modelscrm@gmail.com</code> — preservamos o visual original com imagens e layout.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border shadow-card p-6 md:p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={form.template_type} onValueChange={(v: any) => setForm({ ...form, template_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                    <SelectItem value="sms">📱 SMS</SelectItem>
                    <SelectItem value="push">🔔 Push</SelectItem>
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
              <Label>Marca / Enviador</Label>
              <Input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="Ex: Nubank, iFood, Magazine Luiza"
              />
            </div>

            <div className="space-y-2">
              <Label>Print / Imagem do modelo *</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative rounded-xl border border-border overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full max-h-80 object-contain bg-muted" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <div className="bg-primary/10 rounded-full p-3">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Clique para anexar o print</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou WEBP — máx. 10MB</p>
                  </div>
                </button>
              )}
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
                <Label>Segmento / Mercado</Label>
                <Input
                  value={form.segment}
                  onChange={(e) => setForm({ ...form, segment: e.target.value })}
                  placeholder="Ex: e-commerce, SaaS, fintech"
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
