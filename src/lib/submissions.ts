import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];
type TemplateType = Database["public"]["Enums"]["template_type"];
type ToneType = Database["public"]["Enums"]["tone_type"];

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface TemplatePayloadOverrides {
  title?: string;
  template_type?: TemplateType;
  content?: string;
  category_id?: string | null;
  tags?: string[];
  tone?: ToneType | null;
  persona?: string | null;
  variables?: string[];
  brand?: string | null;
  market_type?: string | null;
}

// ── Cleaning / parsing helpers ───────────────────────────────────────────────

export const cleanTitle = (title: string): string =>
  title.replace(/^(Fwd|Fw|Re|Enc|Res)\s*:\s*/gi, "").trim();

export const stripHtml = (html: string): string =>
  html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

export const extractBrandFromSender = (rawFrom: string | null): string => {
  if (!rawFrom) return "";
  const nameMatch = rawFrom.match(/^"?([^"<]+)"?\s*</);
  if (nameMatch) return nameMatch[1].trim();
  const emailMatch = rawFrom.match(/([^@]+)@/);
  return emailMatch ? emailMatch[1].trim() : rawFrom;
};

// Look for the original sender inside a forwarded email body
export const extractOriginalSender = (html: string): string => {
  const m = html.match(/De:\s*<strong[^>]*>([^<]+)<\/strong>/i);
  if (m) return m[1].trim();
  const plain = html.match(/(?:From|De)\s*:\s*([^\n<]+)/i);
  if (plain) return plain[1].replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim();
  return "";
};

export const sanitizeEmailHtml = (html: string): string => {
  let s = html;
  s = s.replace(/<div[^>]*class="[^"]*gmail_attr[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
  s = s.replace(/<div[^>]*class="[^"]*gmail_quote[^"]*"[^>]*>/gi, "<div>");
  s = s.replace(/-{5,}\s*Forwarded message\s*-{5,}/gi, "");
  s = s.replace(/^(From|To|De|Para|Sent|Enviado para|Date|Data|Subject|Assunto)\s*:.*$/gim, "");
  s = s.replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, "");
  s = s.replace(/<a[^>]*href=["']mailto:[^"']*["'][^>]*>(.*?)<\/a>/gi, "$1");
  s = s.replace(/&lt;\s*&gt;/g, "");
  s = s.replace(/<\s*>/g, "");
  s = s.replace(/<(div|span|p|td|font|strong)[^>]*>\s*<\/\1>/gi, "");
  s = s.replace(/^(\s*<(div|br)[^>]*>\s*)+/i, "");
  return s;
};

export const guessCategoryFromContent = (
  content: string,
  subject: string,
  categories: CategoryOption[]
): string => {
  if (!categories?.length) return "";
  const lower = (content + " " + subject).toLowerCase();
  for (const cat of categories) {
    const keywords = cat.slug.split("-");
    if (keywords.some((kw) => kw.length > 2 && lower.includes(kw))) return cat.id;
    if (lower.includes(cat.name.toLowerCase())) return cat.id;
  }
  return "";
};

export const guessFieldsFromContent = (content: string, subject: string) => {
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

  let market_type = "";
  if (/e-commerce|loja|compra|produto|frete|varejo/i.test(lower)) market_type = "E-commerce/Varejo";
  else if (/saas|software|plataforma|assinatura|trial/i.test(lower)) market_type = "SaaS";
  else if (/serviço|saúde|médico|clínica|consulta|food|comida|restaurante|delivery|fintech|banco|cartão|crédito|investimento/i.test(lower)) {
    market_type = "Serviços";
  } else if (/educação|curso|aula|professor|mentoria|conteúdo|infoproduto|marketing|digital|social|instagram|tráfego|copy/i.test(lower)) {
    market_type = "Infoproduto";
  }

  return {
    tone: tone as ToneType | "",
    persona,
    tags: Array.from(tagSet),
    variables,
    market_type,
  };
};

// Build a clean, fully-populated template payload from a submission.
// `categories` is optional — when provided, we infer category_id.
export const buildTemplatePayloadFromSubmission = (
  submission: Submission,
  categories?: CategoryOption[]
) => {
  const htmlContent = submission.parsed_body || "";
  const rawText = submission.raw_body || "";
  const sanitizedHtml = htmlContent ? sanitizeEmailHtml(htmlContent) : "";
  const content = sanitizedHtml || rawText;

  const originalSender = htmlContent ? extractOriginalSender(htmlContent) : "";
  const brand =
    originalSender ||
    extractBrandFromSender(submission.raw_from) ||
    submission.brand ||
    null;

  const rawSubject = submission.raw_subject || "";
  const cleanedTitle = cleanTitle(submission.title || rawSubject);

  const textForAnalysis = rawText || stripHtml(htmlContent);
  const guessed = guessFieldsFromContent(textForAnalysis, cleanedTitle);
  const category_id = categories?.length
    ? guessCategoryFromContent(textForAnalysis, cleanedTitle, categories)
    : "";

  return {
    title: cleanedTitle || (typeof brand === "string" ? brand : "") || submission.template_type,
    template_type: submission.template_type,
    content,
    category_id: category_id || null,
    tags:
      submission.suggested_tags && submission.suggested_tags.length > 0
        ? submission.suggested_tags
        : guessed.tags,
    tone: (guessed.tone as ToneType) || null,
    persona: guessed.persona || null,
    variables: guessed.variables,
    brand,
    market_type: submission.market_type || guessed.market_type || null,
  };
};

// ── Central publish / unpublish ──────────────────────────────────────────────

export interface PublishResult {
  ok: boolean;
  action: "created" | "updated" | "failed";
  templateId?: string;
  error?: string;
}

/**
 * Publish (or republish) a submission as a public template.
 *
 * - Cleans title, sanitizes HTML, infers brand/tags/tone/category.
 * - Idempotent: if a template already exists for the submission, updates it
 *   (and republishes if it had been archived). Otherwise inserts.
 * - Sets the submission's status to `approved`.
 * - Optional `overrides` lets callers (like AdminReview) pass user-edited
 *   values — those win over the auto-detected ones.
 */
export const publishSubmissionToTemplate = async (
  submission: Submission,
  options?: {
    overrides?: TemplatePayloadOverrides;
    submissionNotes?: string;
    categories?: CategoryOption[];
  }
): Promise<PublishResult> => {
  const computed = buildTemplatePayloadFromSubmission(submission, options?.categories);
  const payload = { ...computed, ...options?.overrides };

  if (!payload.content) {
    return { ok: false, action: "failed", error: "Conteúdo vazio" };
  }

  const { data: existing } = await supabase
    .from("templates")
    .select("id")
    .eq("submission_id", submission.id)
    .maybeSingle();

  let templateId: string | undefined;
  let action: "created" | "updated";

  if (existing) {
    const { error } = await supabase
      .from("templates")
      .update({
        ...payload,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) return { ok: false, action: "failed", error: error.message };
    templateId = existing.id;
    action = "updated";
  } else {
    const { data, error } = await supabase
      .from("templates")
      .insert({
        ...payload,
        submission_id: submission.id,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error || !data) {
      return { ok: false, action: "failed", error: error?.message ?? "no row returned" };
    }
    templateId = data.id;
    action = "created";
  }

  const submissionUpdate: Record<string, unknown> = { status: "approved" };
  if (options?.submissionNotes !== undefined) submissionUpdate.notes = options.submissionNotes;
  await supabase.from("submissions").update(submissionUpdate).eq("id", submission.id);

  return { ok: true, action, templateId };
};

/**
 * Despublish: archive every published template linked to the given
 * submissions so they leave the public library.
 *
 * Called when submissions move to `rejected`, `archived`, or are deleted.
 */
export const unpublishSubmissionTemplates = async (
  submissionIds: string[]
): Promise<{ ok: boolean; n: number; error?: string }> => {
  if (submissionIds.length === 0) return { ok: true, n: 0 };
  const { error, count } = await supabase
    .from("templates")
    .update({ status: "archived" }, { count: "exact" })
    .in("submission_id", submissionIds)
    .eq("status", "published");
  if (error) return { ok: false, n: 0, error: error.message };
  return { ok: true, n: count ?? 0 };
};

// ── Backward-compat shim ─────────────────────────────────────────────────────
// Existing callers can keep using approveSubmission(sub) — under the hood
// it now goes through publishSubmissionToTemplate.
export const approveSubmission = async (sub: Submission): Promise<boolean> => {
  const result = await publishSubmissionToTemplate(sub);
  return result.ok;
};
