import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{
      mimeType: string;
      body?: { data?: string };
      parts?: Array<{ mimeType: string; body?: { data?: string } }>;
    }>;
  };
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
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function extractBody(msg: GmailMessage): string {
  // Try to get text/plain or text/html from parts
  if (msg.payload.parts) {
    for (const part of msg.payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
      // Check nested parts (multipart/alternative inside multipart/mixed)
      if (part.parts) {
        for (const subPart of part.parts) {
          if (subPart.mimeType === "text/plain" && subPart.body?.data) {
            return decodeBase64Url(subPart.body.data);
          }
        }
      }
    }
    // Fallback to HTML if no plain text
    for (const part of msg.payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
      if (part.parts) {
        for (const subPart of part.parts) {
          if (subPart.mimeType === "text/html" && subPart.body?.data) {
            return decodeBase64Url(subPart.body.data);
          }
        }
      }
    }
  }

  // Single-part message
  if (msg.payload.body?.data) {
    return decodeBase64Url(msg.payload.body.data);
  }

  return "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = await getAccessToken();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch unread emails from inbox
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread+in:inbox&maxResults=10",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!listRes.ok) {
      const text = await listRes.text();
      throw new Error(`Gmail list failed: ${text}`);
    }

    const listData = await listRes.json();
    const messages = listData.messages || [];

    let ingested = 0;

    for (const msg of messages) {
      // Get full message
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!msgRes.ok) {
        const text = await msgRes.text();
        console.error(`Failed to fetch message ${msg.id}: ${text}`);
        continue;
      }

      const fullMsg: GmailMessage = await msgRes.json();

      const subject = getHeader(fullMsg, "Subject") || "Sem assunto";
      const from = getHeader(fullMsg, "From") || "Desconhecido";
      const body = extractBody(fullMsg);

      // Extract brand from sender (domain or name)
      const brandMatch = from.match(/^(.+?)\s*</);
      const brand = brandMatch ? brandMatch[1].trim().replace(/"/g, "") : from.split("@")[0];

      // Insert into submissions
      const { error: insertError } = await supabase.from("submissions").insert({
        template_type: "email",
        source: "gmail",
        raw_subject: subject,
        raw_from: from,
        raw_body: body,
        title: subject,
        brand: brand,
        status: "new",
        language: "pt-br",
      });

      if (insertError) {
        console.error(`Insert error for ${msg.id}:`, insertError);
        continue;
      }

      // Mark as read in Gmail
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

      ingested++;
    }

    return new Response(
      JSON.stringify({ success: true, ingested, total: messages.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Ingest error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
