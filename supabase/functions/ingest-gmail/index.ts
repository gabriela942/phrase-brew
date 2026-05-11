import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Default Gmail query: catches Promotions, any email with a List-Unsubscribe
// header (newsletters / marketing), or forwarded emails. Looks in the inbox
// over the last 30 days. Override via the GMAIL_QUERY secret.
const DEFAULT_QUERY = "(category:promotions OR has:list OR subject:(Fwd OR Fw OR Enc)) in:inbox newer_than:30d";

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get("GMAIL_CLIENT_ID")!;
  const clientSecret = Deno.env.get("GMAIL_CLIENT_SECRET")!;
  const refreshToken = Deno.env.get("GMAIL_REFRESH_TOKEN")!;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to refresh token: ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

interface GmailMessage {
  id: string;
  labelIds?: string[];
  payload: {
    mimeType?: string;
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: GmailPart[];
  };
}

interface GmailPart {
  mimeType: string;
  body?: { data?: string };
  parts?: GmailPart[];
}

function getHeader(msg: GmailMessage, name: string): string | null {
  const header = msg.payload.headers.find(
    (h) => h.name.toLowerCase() === name.toLowerCase()
  );
  return header?.value ?? null;
}

function decodeBase64Url(data: string): string {
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function collectBodiesFromParts(parts: GmailPart[], acc: { text: string; html: string }) {
  for (const part of parts) {
    if (part.mimeType === "text/plain" && part.body?.data && !acc.text) {
      acc.text = decodeBase64Url(part.body.data);
    }
    if (part.mimeType === "text/html" && part.body?.data && !acc.html) {
      acc.html = decodeBase64Url(part.body.data);
    }
    if (part.parts?.length) collectBodiesFromParts(part.parts, acc);
  }
}

function extractBodies(msg: GmailMessage): { text: string; html: string } {
  const extracted = { text: "", html: "" };
  if (msg.payload.parts?.length) collectBodiesFromParts(msg.payload.parts, extracted);
  if (!extracted.text && msg.payload.body?.data) {
    extracted.text = decodeBase64Url(msg.payload.body.data);
  }
  if (!extracted.html && msg.payload.body?.data && msg.payload.mimeType === "text/html") {
    extracted.html = decodeBase64Url(msg.payload.body.data);
  }
  if (!extracted.text && extracted.html) {
    extracted.text = extracted.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  return extracted;
}

// ── Cleaning helpers (mirrors src/lib/submissions.ts) ────────────────────────

const FORWARD_PREFIX_RE = /^(\s*(fwd|fw|enc|encaminhada?):\s*)+/i;

function isForwardedSubject(subject: string): boolean {
  return FORWARD_PREFIX_RE.test(subject);
}

function cleanTitle(title: string): string {
  return title.replace(/^(Fwd|Fw|Re|Enc|Res)\s*:\s*/gi, "").trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function extractBrandFromSender(rawFrom: string): string {
  if (!rawFrom) return "";
  const nameMatch = rawFrom.match(/^"?([^"<]+)"?\s*</);
  if (nameMatch) return nameMatch[1].trim();
  const emailMatch = rawFrom.match(/([^@]+)@/);
  return emailMatch ? emailMatch[1].trim() : rawFrom;
}

function extractOriginalSender(html: string): string {
  if (!html) return "";
  const m = html.match(/De:\s*<strong[^>]*>([^<]+)<\/strong>/i);
  if (m) return m[1].trim();
  const plain = html.match(/(?:From|De)\s*:\s*([^\n<]+)/i);
  if (plain) return plain[1].replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim();
  return "";
}

function sanitizeEmailHtml(html: string): string {
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
}

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
}

function guessCategoryFromContent(
  content: string,
  subject: string,
  categories: CategoryRow[]
): string | null {
  if (!categories.length) return null;
  const lower = (content + " " + subject).toLowerCase();
  for (const cat of categories) {
    const keywords = cat.slug.split("-");
    if (keywords.some((kw) => kw.length > 2 && lower.includes(kw))) return cat.id;
    if (lower.includes(cat.name.toLowerCase())) return cat.id;
  }
  return null;
}

function guessFieldsFromContent(content: string, subject: string) {
  const lower = (content + " " + subject).toLowerCase();

  let tone = "direct";
  if (/urgente|última chance|corra|não perca|expira/i.test(lower)) tone = "urgent";
  else if (/prezado|senhor|formal|cordialmente/i.test(lower)) tone = "formal";
  else if (/hey|oi|fala|beleza|e aí/i.test(lower)) tone = "casual";
  else if (/amigo|querido|carinho|abraço/i.test(lower)) tone = "friendly";

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

  let market_type: string | null = null;
  if (/e-commerce|loja|compra|produto|frete|varejo/i.test(lower)) market_type = "E-commerce/Varejo";
  else if (/saas|software|plataforma|assinatura|trial/i.test(lower)) market_type = "SaaS";
  else if (/serviço|saúde|médico|clínica|consulta|food|comida|restaurante|delivery|fintech|banco|cartão|crédito|investimento/i.test(lower)) {
    market_type = "Serviços";
  } else if (/educação|curso|aula|professor|mentoria|conteúdo|infoproduto|marketing|digital|social|instagram|tráfego|copy/i.test(lower)) {
    market_type = "Infoproduto";
  }

  return { tone, persona, tags: Array.from(tagSet), variables, market_type };
}

interface ClassificationResult {
  marketing: boolean;
  reason: string;
}

function classifyMarketing(msg: GmailMessage, subject: string): ClassificationResult {
  const headers = msg.payload.headers;
  const hasUnsubscribe = headers.some(
    (h) => h.name.toLowerCase() === "list-unsubscribe"
  );
  if (hasUnsubscribe) return { marketing: true, reason: "List-Unsubscribe header" };

  const labels = msg.labelIds ?? [];
  if (labels.includes("CATEGORY_PROMOTIONS")) {
    return { marketing: true, reason: "CATEGORY_PROMOTIONS label" };
  }

  if (isForwardedSubject(subject)) {
    return { marketing: true, reason: "forwarded email (assumed marketing)" };
  }

  return { marketing: false, reason: "no marketing signal" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

  // Two auth paths:
  //  1) x-cron-secret matches CRON_SECRET — pg_cron / scheduled invocation
  //  2) Authorization JWT belonging to an admin user — manual / future UI
  const cronSecret = Deno.env.get("CRON_SECRET");
  const providedCronSecret = req.headers.get("x-cron-secret");
  const isCronCaller = !!cronSecret && providedCronSecret === cronSecret;

  if (!isCronCaller) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin, error: roleError } = await userClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const log: Array<Record<string, unknown>> = [];

  try {
    const accessToken = await getAccessToken();
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Load categories once for auto-classification of new templates
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("id, name, slug");
    const categories: CategoryRow[] = categoriesData ?? [];

    const query = Deno.env.get("GMAIL_QUERY") ?? DEFAULT_QUERY;
    log.push({ step: "query", value: query });

    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=25`;
    const listRes = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!listRes.ok) {
      const text = await listRes.text();
      throw new Error(`Gmail list failed: ${text}`);
    }

    const listData = await listRes.json();
    const messages: Array<{ id: string }> = listData.messages ?? [];
    log.push({ step: "list", count: messages.length, ids: messages.map((m) => m.id) });

    const stats: Record<string, number> = {
      total: messages.length,
      skipped_existing: 0,
      skipped_non_marketing: 0,
      ingested_marketing: 0,
      ingested_pending: 0,
      template_published: 0,
      errors: 0,
    };

    for (const msg of messages) {
      // Idempotency: skip if we already ingested this Gmail message
      const { data: existing } = await supabase
        .from("submissions")
        .select("id")
        .eq("gmail_message_id", msg.id)
        .maybeSingle();

      if (existing) {
        stats.skipped_existing++;
        log.push({ msg: msg.id, action: "skip_existing" });
        continue;
      }

      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!msgRes.ok) {
        stats.errors++;
        log.push({ msg: msg.id, action: "fetch_error", text: await msgRes.text() });
        continue;
      }

      const fullMsg: GmailMessage = await msgRes.json();
      const rawSubject = getHeader(fullMsg, "Subject") || "Sem assunto";
      const cleanedTitle = cleanTitle(rawSubject);
      const fromHeader = getHeader(fullMsg, "From") || "Desconhecido";
      const { text: plainBody, html: htmlBody } = extractBodies(fullMsg);

      // For forwarded emails, prefer the original sender from the body
      const originalSender = htmlBody ? extractOriginalSender(htmlBody) : "";
      const fromForBrand = originalSender || fromHeader;
      const brand = extractBrandFromSender(fromForBrand) || fromForBrand;

      const sanitizedHtml = htmlBody ? sanitizeEmailHtml(htmlBody) : "";
      const cleanContent = sanitizedHtml || plainBody || "";
      const textForAnalysis = plainBody || stripHtml(htmlBody);
      const guessed = guessFieldsFromContent(textForAnalysis, cleanedTitle);

      const classification = classifyMarketing(fullMsg, rawSubject);

      // Skip non-marketing emails entirely. The Inbox tab is gone, so we
      // don't want admin-quality noise (test emails, security alerts, plain
      // personal mail) cluttering the public library. Only true marketing
      // (CATEGORY_PROMOTIONS, List-Unsubscribe header, or forwards) survives.
      if (!classification.marketing) {
        log.push({
          msg: msg.id,
          action: "skip_non_marketing",
          subject: rawSubject,
          reason: classification.reason,
        });
        stats.skipped_non_marketing = (stats.skipped_non_marketing ?? 0) + 1;
        continue;
      }

      const status = "approved";

      // 1) Insert the submission
      const { data: inserted, error: insertError } = await supabase
        .from("submissions")
        .insert({
          gmail_message_id: msg.id,
          template_type: "email",
          source: "gmail",
          raw_subject: rawSubject,
          raw_from: fromHeader,
          raw_body: plainBody || htmlBody,
          parsed_body: htmlBody || null,
          title: cleanedTitle,
          brand,
          status,
          language: "pt-br",
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        stats.errors++;
        log.push({
          msg: msg.id,
          action: "insert_error",
          error: insertError?.message ?? "no row returned",
        });
        continue;
      }

      // 2) Always publish a clean template (auto-publish for everything)
      const category_id = guessCategoryFromContent(textForAnalysis, cleanedTitle, categories);
      const { error: tErr } = await supabase.from("templates").insert({
        title: cleanedTitle || brand || "email",
        template_type: "email",
        content: cleanContent,
        category_id,
        tags: guessed.tags,
        tone: guessed.tone as "formal" | "casual" | "direct" | "friendly" | "urgent",
        persona: guessed.persona || null,
        variables: guessed.variables,
        brand,
        market_type: guessed.market_type,
        submission_id: inserted.id,
        status: "published",
        published_at: new Date().toISOString(),
      });
      if (tErr) {
        log.push({ msg: msg.id, action: "template_error", error: tErr.message });
      } else {
        stats.template_published++;
      }
      if (classification.marketing) stats.ingested_marketing++;
      else stats.ingested_pending++;

      log.push({
        msg: msg.id,
        action: "ingested",
        subject: rawSubject,
        cleaned_title: cleanedTitle,
        from: fromHeader,
        original_sender: originalSender || null,
        brand,
        status,
        marketing: classification.marketing,
        reason: classification.reason,
        labels: fullMsg.labelIds ?? [],
        tags: guessed.tags,
        tone: guessed.tone,
        market_type: guessed.market_type,
      });

      // Mark as read in Gmail (best effort)
      await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}/modify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ removeLabelIds: ["UNREAD"] }),
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, ...stats, log }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Ingest error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message, log }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
